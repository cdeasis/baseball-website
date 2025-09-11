const cron = require('node-cron');
const rollover = require('../../scripts/rolloverBuckets');

function startScheduler() {
    // run once every day at specific time (NY)
    cron.schedule('5 3 * * *', async () => {
        console.log('[Scheduler] Running rollover job...');
        try {
            await rollover.main(); // export main from rolloverBuckets
            console.log('[Scheduler] Rollover finished');
        } catch (err) {
            console.error('[Scheduler] Rollover failed', err);
        }
    }, {
        scheduled: true,
        timezone: 'America/New_York',
    });
}

module.exports = { startScheduler }