const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { processUrl } = require('./articleWorker');

const parser = new Parser();

// include/exclude URL filtering
function shouldSkip(feed, url) {
    if (!url) return true;

    // include: require at least one match
    if (Array.isArray(feed.include) && feed.include.length) {
        const pass = feed.include.some(s => url.includes(s));
        if (!pass) return true;
    }

    // exclude: skip if any match
    if (Array.isArray(feed.include) && feed.exclude.length) {
        if (feed.exclude.some(s => url.includes(s))) return true;
    }
    return false;
}

async function pollOnce() { 
    const feedsPath = path.join(__dirname, '..', 'feeds.json');
    // sanity check
    let feeds;
    try {
        feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
    } catch (e) {
        console.error('Could not read feeds.json:', feedsPath, e.message);
        return;
    }

    if(!Array.isArray(feeds)) {
        console.error('feed.json is not an array');
        return;
    }

    for (const feed of feeds) {
        if (!feed?.feedUrl) {
            console.error('Skipping feed with missing feedUrl:', feed);
            continue;
        }

        try {
            const res = await parser.parseURL(feed.feedUrl);
            const items = Array.isArray(res?.items) ? res.items : [];

            // cap per-feed if maxItems is provided
            const capped = feed.maxItems ? items.slice(0, Number(feed.maxItems)) : items;

            let seen = 0, sent = 0, skipped = 0;
            for (const item of res.items) {
                seen += 1;

                const link = item.link || item.id || item.guid;
                if (!link) { skipped += 1; continue; }
                if (shouldSkip(feed, link)) { skipped += 1; continue;}

                await processUrl({
                    url: link,
                    source: feed.source,
                    publishedAt: item.isoDate || item.pubDate
                }).then(r => {
                    if (r?.ok) sent += 1;
                }).catch(err => {
                    console.error('Worker error for', link, err?.message);
                });
            }

            console.log(`[poll] ${feed.name || feed.source} - items:${items.length} capped:${capped.length} sent:${sent} skipped:${skipped}`)
        } catch (e) {
            console.error('Feed error', feed.feedUrl, e?.message);
        }
    }
}

function startPolling () {
    const interval = Number(process.env.FEED_POLL_MS || 300000); // default 5 mins
    console.log(`Feed polling every ${interval}s`);
    pollOnce();
    return setInterval(pollOnce, interval);
}

module.exports = { startPolling, pollOnce };