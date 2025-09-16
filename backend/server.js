const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
const newsRoutes = require('./routes/news');
const standingsRoutes = require('./routes/standings');

app.use('/api/news', newsRoutes);
app.use('/api/standings', standingsRoutes);

module.exports = app; // for testing