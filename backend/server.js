const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

require('./config/mongodb'); // Ensure MongoDB connection is established

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount routes
const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes);

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});