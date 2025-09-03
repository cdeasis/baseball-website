const app = require('./server');

const { startPolling } = require('./jobs/pollFeeds');
const port = process.env.PORT || 5000;

startPolling();

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});