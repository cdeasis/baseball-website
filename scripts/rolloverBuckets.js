require('dotenv').config();
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const LiveNewsArticle = require('../backend/models/LiveNewsArticles');

const NY = 'America/New_York';

function computeCutoffs(now = DateTime.now().setZone(NY)) {
    return {
        twoDaysAgo: now.minus({ days: 2 }).toJSDate(),
        oneMonthAgo: now.minus({ days: 30 }).toJSDate(),
    };
}

async function updateBuckets({ twoDaysAgo, oneMonthAgo }) {
    // LIVE: today & yesterday
    await LiveNewsArticle.updateMany(
        { publishedAt: { $gte: twoDaysAgo } },
        { $set: { bucket: 'LIVE' } }
    );

    // ARCHIVE: 2-30 days
    await LiveNewsArticle.updateMany(
        { publishedAt: { $lt: twoDaysAgo, $gte: oneMonthAgo } },
        { $set: { bucket: 'ARCHIVE'} }
    );

    // COLD: >30 days
    await LiveNewsArticle.updateMany(
        { publishedAt: { $lt: oneMonthAgo } },
        { $set: { bucket: 'COLD' } }
    );
}

async function capBucket(bucket, max) {
    const col = mongoose.connection.collection('LiveNewsArticles');
    const toCold = await col.find({ bucket }).sort({ publishedAt: 1, sourceRank: 1, title: 1 }).skip(max).project({ _id: 1 }).toArray(); // oldest first
    if (toCold.length) {
        await col.updateMany(
            { _id: { $in: toCold.map(d => d._id) } },
            { $set: { bucket: 'COLD' } }
        );
    }
}
// CLI entry point
async function main() {
    await mongoose.connect(process.env.MONGO_URI);

    const cutoffs = computeCutoffs();
    await updateBuckets(cutoffs);

    // optional caps
    await capBucket('LIVE', 120);
    await capBucket('ARCHIVE', 3000);

    await mongoose.disconnect();
}

if (require.main === module){
    main().catch(async (e) => { console.error(e); await mongoose.disconnect(); });
}

module.exports = { computeCutoffs, updateBuckets}