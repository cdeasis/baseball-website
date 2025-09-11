const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

module.exports = app; // for testing