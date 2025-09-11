const app = require('./server');
const { startPolling } = require('./jobs/pollFeeds');
const { startScheduler } = require('./jobs/scheduler');
const { connectMongo } = require('./config/mongodb');

const port = process.env.PORT || 5000;

(async () => {
    try {
        await connectMongo();
        startPolling();
        startScheduler();

        app.listen(port, () => {
            console.log(`Server running on https://localhost:${port}`);
        });
    } catch (err) {
        console.error('Startup failed:', err);
        process.exit(1);
    }
})();