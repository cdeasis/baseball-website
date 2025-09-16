require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const mongoose = require('mongoose');
const minimist = require('minimist');
const { callSummarizer, shouldSummarize } = require('../backend/lib/summarizerClient');

const LiveNewsArticle = require('../backend/models/LiveNewsArticles');
const argv = minimist(process.argv.slice(2));

const DRY_RUN = !!argv['dry-run'] || false;
const BATCH_SIZE = Number(argv.batchSize || 25);
const LIMIT = Number(argv.limit || 0);
const BUCKET = argv.bucket || undefined;
const RESUME_FROM = argv.resumeFrom || undefined;
const UPGRADE_EXTRACTIVE = !!argv.upgradeExtractive || false;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/newsDatabase';
const CONCURRENCY = Number(argv.concurrency || 1);

// --- query builder ---
function buildQuery() {
    const q = {
        // missing ML summary
        $or: [
            { 'summary.long': { $exists: false } },
            { 'summary.model': { $exists: false } },
            { 'summary.model': null },
        ],
    };

    // optionally include extractive docs for upgrade
    if (UPGRADE_EXTRACTIVE) {
        q.$or.push({ 'summary.model': 'extractive' });
    }

    if (BUCKET) q.bucket = BUCKET;
    if (RESUME_FROM) q._id = { $gt: mongoose.Types.ObjectId.createFromHexString(RESUME_FROM) };

    return q;
}

// --- batch runner (cursor + batches) ---
async function* batchCursor(query, batchSize, limit=0) {
    let processed = 0;
    const projection = {
        _id: 1,
        title: 1,
        source: 1,
        url: 1,
        canoncialUrl: 1,
        summary: 1,
        'raw.text': 1,
    }

    const cursor = LiveNewsArticle.find(query, projection)
        .sort({ _id: 1 }) // stable ordering for resume
        .maxTimeMS(60_000) // optional guard for very large scans
        .cursor();

    let batch = [];
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        if (limit && processed >= limit) break;
        batch.push(doc);
        processed += 1;

        if (batch.length >= batchSize) {
            yield batch;
            batch = [];
        }
    }
    if (batch.length) yield batch;
}

// --- worker for single doc ---
async function processDoc(doc) {
    const id = doc._id.toString();
    const text = (doc?.raw?.text || '').trim();

    if (!shouldSummarize(text)) {
        console.info('[skip] gate (short/disabled)', { id, len: text.length });
        return { id, skipped: true, reason: 'gate' };
    }

    // ML summarize only (no extractive overwrite in backfill)
    const ml = await callSummarizer(text);
    
    const patch = {
        'summary.short': ml.short,
        'summary.long': ml.long,
        'summar.model': ml.model,
        'summary.generatedAt': new Date(),
    };

    if (DRY_RUN) {
        console.log('[dry-run] would update', {
            id,
            model: ml.model,
            shortLen: ml.short.length,
            longLen: ml.long.length,
        });
        return { id, ok: true, dryRun: true };
    }

    await LiveNewsArticle.updateOne({ _id: doc._id }, { $set: patch });
    console.log('[update] ok', { id, model: ml.model, shortLen: ml.short.length, longLen: ml.long.length });
    return { id, ok: true };
}

// --- orchestrator --- 
async function run() {
    console.log('[start] backfillSummaries', {
        DRY_RUN, BATCH_SIZE, LIMIT, BUCKET, RESUME_FROM, UPGRADE_EXTRACTIVE, CONCURRENCY,
    });

    await mongoose.connect(MONGO_URI, { dbName: undefined });
    console.log('[mongo] connected');

    const query = buildQuery();
    console.log('[query]', JSON.stringify(query));

    let total = 0, updated = 0, skipped = 0, failed = 0, lastId = null;

    for await (const batch of batchCursor(query, BATCH_SIZE, LIMIT)) {
        const queue = [...batch];

        async function takeOne() {
            const doc = queue.shift();
            if (!doc) return;
            lastId = doc._id.toString();
            try {
                const res = await processDoc(doc);
                total += 1;
                if (res.ok) updated += 1;
                else if (res.skipped) skipped += 1;
            } catch (e) {
                failed += 1;
                const status = e.response?.status;
                const detail = e.response?.data || e.message;
                console.warn('[error]', { id: doc._id.toString(), status, detail });
            }
            return takeOne();
        }

        const workers = Array.from(
            { length: Math.max(1, Math.min(CONCURRENCY, batch.length)) },
            takeOne
        );
        await Promise.all(workers);

        console.log('[progress]', { total, updated, skipped, failed, lastId });
    }

    console.log('[done]', { total, updated, skipped, failed, lastId });
    await mongoose.disconnect();
    process.exit(failed ? 1 : 0);
}

run().catch(async (e) => {
    console.error('[fatal]', e);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
})