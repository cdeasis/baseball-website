const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { processUrl } = require('./articleWorker');

const parser = new Parser();

async function pollOnce() { 
    const feeds = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'feeds.json'), 'utf8'));
    for (const feed of feeds) {
        try {
            const res = await parser.parserUrl(feed.feedUrl);
            for (const item of res.items) {
                const link = item.link || item.id ||item.guid;
                if (!link) continue;

                await processUrl({
                    url: link,
                    source: feed.source,
                    publishedAt: item.isoDate || item.pubDate
                }).catch(err => {
                    console.error('Worker error for', link, err?.message);
                });
            }
        } catch (e) {
            console.error('Feed error', feed.feedUrl, e?.message);
        }
    }
}

exports.startPolling = () => {
    const interval = Number(process.env.FEED_POLL_MS || 300000); // default 5 mins
    console.log(`Feed polling every ${interval}s`);
    pollOnce();
    return setInterval(pollOnce, interval);
}