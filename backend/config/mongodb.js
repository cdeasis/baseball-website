const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env') });

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.error('MONGO_URI missing. Create backend/.env');
  process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoose;