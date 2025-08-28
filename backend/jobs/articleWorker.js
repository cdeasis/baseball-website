const axios = require('axios');
const LiveNewsArticle = require('../models/LiveNewsArticles');
const { extractiveSummary } = require('../lib/summarize');
const { canonicalize } = require('../lib/dedupe');
const { tagEntities } = require('../lib/tags');

const EXTRACTOR_URL = process.env.EXTRACTOR_URL || 'http://127.0.0.1:8000';

exports.processUrl = async ({ url, source, publishedAt }) => {
    const canonicalUrl = canonicalize(url);

    // dedupe by canonicalUrl
    const exists = await LiveNewsArticle.findOne({ canonicalUrl });
    if (exists) return { skipped: true, reason: 'duplicate' };

    // call python extractor
    const { data } = await axios.post(`${EXTRACTOR_URL}/extract`, { url });
    const text = data?.text || '';
    const title = data?.title || '';
    const author = data?.byline || '';
    const lead = data?.lead_image || '';

    if (!text.trim() || !title.trim()) {
        return { skipped: true, reason: 'no content' };
    }
    
    // summarize + tags
    const sum = extractiveSummary(text);
    const tags = tagEntities(`${title} ${text}`);

    const doc = await LiveNewsArticle.create({
        source,
        url,
        canonicalUrl,
        title,
        author,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        raw: { text },
        summary: {...sum, generatedAt: new Date() },
        tags,
        images: { lead }
    });

    return { ok: true, id: doc._id.toString() };
}