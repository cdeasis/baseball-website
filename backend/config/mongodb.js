const mongoose = require('mongoose');
const path = require('path');
const { config } = require('dotenv');

// load env from backend/.env (one level up from /config)
config({ path: path.join(__dirname, '..', '.env') });

// skip real db connection during tests
if (process.env.NODE_ENV === 'test') {
  module.exports = mongoose;
} else {
  const dbURI = process.env.MONGO_URI;
  if (!dbURI) {
    console.error('MONGO_URI missing. Create backend/.env');
    process.exit(1);
  }

  mongoose.connect(dbURI)
      .then(() => console.log('MongoDB connected successfully.'))
      .catch((err) => console.error('MongoDB connection error:', err));

  module.exports = mongoose;
  }

