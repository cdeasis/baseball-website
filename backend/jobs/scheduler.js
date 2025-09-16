const cron = require('node-cron');
const rollover = require('../../scripts/rolloverBuckets');
const { pollOnce } = require('./pollFeeds');

const TZ = process.env.CRON_TZ || 'America/New_York';
const ROLLOVER_CRON = process.env.ROLLOVER_CRON || '5 3 * * *' // 03:05 every day
const FEED_PULL_CRON = process.env.FEED_PULL_CRON || '15 9,17 * * *' // 09:15 & 17:15 every day 

function startScheduler() {
    // Rollover
    cron.schedule(
        ROLLOVER_CRON,
        async () => {
            console.log('[Scheduler] Running rollover job...');
            try { await rollover.main(); console.log('[Scheduler] Rollover finished'); }
            catch (err) { console.error('[Scheduler] Rollover failed', err); }
        },
        { scheduled: true, timezone: TZ }
    )

    // two guaranteed one-shot pulls
    cron.schedule(
        FEED_PULL_CRON,
        async () => {
            console.log('[Scheduler] Running scheduled pollOnce...');
            try { await pollOnce(); console.log('[Scheduler] pollOnce finished'); }
            catch (err) { console.error('[Scheduler] pollOnce failed', err); }
        },
        {scheduled: true, timezone: TZ}
    );
}

module.exports = { startScheduler };