const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

require('./config/mongodb'); // Ensure MongoDB connection is established

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

// only start poller + listen when NOT running tests
if (process.env.NODE_ENV !== 'test') {
    const { startPolling } = require('./jobs/pollFeeds');
    startPolling();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server running on https://localhost:${port}`);
    });
}

module.exports = app; // for testing