require('dotenv').config();
const { connectMongo } = require('../backend/config/mongodb');
const { fetchFromStatsApi } = require('../backend/jobs/fetchStandings');

(async () => {
  try {
    await connectMongo();
    const out = await fetchFromStatsApi(); // uses current year
    console.log('Snapshot created:', out);
  } catch (e) {
    console.error('Fetch failed:', e?.message || e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
