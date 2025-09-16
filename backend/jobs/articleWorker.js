const axios = require('axios');
const LiveNewsArticle = require('../models/LiveNewsArticles');
const { extractiveSummary } = require('../lib/summarize');
const { canonicalize } = require('../lib/dedupe');
const { tagEntities } = require('../lib/tags');
const { summarizeOrFallback } = require('../lib/summarizerClient');

// --- CONFIG ---
const EXTRACTOR_URL = process.env.EXTRACTOR_URL || 'http://127.0.0.1:8000';

// --- HTTP clients ---
const extractorHttp = axios.create({
    baseURL: EXTRACTOR_URL,
    timeout: Number(process.env.EXTRACTOR_TIMEOUT_MS || 15000),
});


exports.processUrl = async ({ url, source, publishedAt }) => {
    url = typeof url === 'string' ? url.trim() : url;
    const canonicalUrl = canonicalize(url);

    // dedupe by canonicalUrl
    const exists = await LiveNewsArticle.findOne({ canonicalUrl });
    if (exists) return { skipped: true, reason: 'duplicate' };

    // call python extractor
    let data;
    try {
        const res = await extractorHttp.post('/extract', { url });
        data = res.data;
    } catch (err) {
        const status = err.response?.status;
        const detail = err.response?.data || err.message;
        console.error('[extractor] error', { status, detail, url });
        return { skipped: true, reason: `extractor-error-${status || 'unknown'}` };
    }
    
    const text = data?.text || '';
    const title = data?.title || '';
    const author = data?.byline || '';
    const lead = data?.lead_image || '';

    if (!text.trim() || !title.trim()) {
        return { skipped: true, reason: 'no content' };
    }
    
    // summarize (ML -> fallback)
    const { payload: summaryPayload, used, model } = await summarizeOrFallback(text, extractiveSummary);

    const tags = tagEntities(`${title} ${text}`);

    const doc = await LiveNewsArticle.create({
        source,
        url,
        canonicalUrl,
        title,
        author,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        raw: { text, html: data?.html || '' },
        summary: summaryPayload,
        tags,
        images: { lead },
    });

    console.info('[articleWorker] saved', {
        id: doc._id.toString(),
        source,
        usedSummary: used,
        model,
    });

    return { ok: true, id: doc._id.toString() };
}