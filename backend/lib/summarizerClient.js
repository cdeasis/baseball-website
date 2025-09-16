const axios = require('axios');

// --- CONFIG ---
const config = {
    url: process.env.SUMMARIZER_URL || 'http://127.0.0.1:8000/summarize',
    enabled: String(process.env.SUMMARIZER_ENABLED || 'true').toLowerCase() === 'true',
    shortTokens: Number(process.env.SUMMARIZER_SHORT_TOKENS || 80),
    longTokens: Number(process.env.SUMMARIZER_LONG_TOKENS || 220),
    minChars: Number(process.env.SUMMARIZER_MIN_CHARS || 800),
    timeoutMs: Number(process.env.SUMMARIZER_TIMEOUT_MS || 25000),
    retries: Number(process.env.SUMMARIZER_RETRIES || 1),
};

const http = axios.create({ timeout: config.timeoutMs });

// gate to avoid tiny blurbs / disabled mode
function shouldSummarize(text) {
    return config.enabled && typeof text === 'string' && text.trim().length >= config.minChars;
}

// pure ML call with retries; throws on failure
async function callSummarizer(text, {
    shortTokens = config.shortTokens,
    longTokens = config.longTokens,
    url = config.url,
    retries = config.retries,
} = {}) {
    let attempt = 0; let lastErr;
    const payload = { text, short_tokens: shortTokens, long_tokens: longTokens };

    while (attempt <= retries) {
        const t0 = Date.now();
        try {
            const { data } = await http.post(url, payload);
            const latencyMs = Date.now() - t0;
            if (!data?.short && !data?.long) throw new Error('empty-summary');
            return {
                short: data.short || '',
                long: data.long || data.short || '',
                model: data.model || 'unknown',
                latencyMs,
            };
        } catch (e) {
            lastErr = e;
            if (attempt === retries) break;
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            attempt += 1;
        }
    }
    throw lastErr || new Error('summarizer-failed');
}

// deterministic fallback used by both paths
function buildFallbackSummary(text, extractiveSummaryFn) {
    const sum = (typeof extractiveSummaryFn === 'function') ? (extractiveSummaryFn(text) || {}) : {};
    const short = sum.short || (text.slice(0, 320) + (text.length > 320 ? '...' : ''));
    const long = sum.long || sum.short || text;
    return {
        short,
        long,
        model: 'extractive',
        generatedAt: new Date(),
    };
}

// helper that prefers ML then falls back (used by articleWorker online path)
async function summarizeOrFallback(text, extractiveSummaryFn) {
    if (shouldSummarize(text)) {
        try {
            const ml = await callSummarizer(text);
            return {
                payload: {
                    short: ml.short,
                    long: ml.long,
                    model: ml.model,
                    generatedAt: new Date(),
                },
                used: 'ml',
                model: ml.model,
            };
        } catch (e) {
            // fall through to extractive
        }
    }
    const payload = buildFallbackSummary(text, extractiveSummaryFn);
    return { payload, used: 'extractive', model: 'extractive'};
}

module.exports = {
    callSummarizer,
    shouldSummarize,
    buildFallbackSummary,
    summarizeOrFallback,
    config,
}