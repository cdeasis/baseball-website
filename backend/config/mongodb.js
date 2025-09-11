const mongoose = require('mongoose');
const path = require('path');
const { config } = require('dotenv');

// load env from backend/.env (one level up from /config)
config({ path: path.join(__dirname, '..', '.env') });

let connecting;

// call once at startup, await, then start jobs
async function connectMongo() {
  // test subs their own DB
  if (process.env.NODE_ENV === 'test') return mongoose;

  // already connected
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

  const dbURI = process.env.MONGO_URI;
  if (!dbURI) throw new Error('MONGO_URI missing. Create backend/.env');

  connecting = mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 10000,
  });

  await connecting;
  console.log('MongoDB connected successfully');
  return mongoose.connection;
}

module.exports = { connectMongo, mongoose};