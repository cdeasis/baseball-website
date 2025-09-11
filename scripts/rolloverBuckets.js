const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
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

// optional cap helper
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

/*
* single rollover pass
* If 'manageConnection' is true, this function will connect/disconnect Mongo
* If false, it assumes the process already has a live Mongoose connection
*/
async function runRollover({ manageConnection = false } = {}) {
    try {
        if (manageConnection) {
            require('dotenv').config();
            await mongoose.connect(process.env.MONGO_URI);
        }

        const cutoffs = computeCutoffs();
        await updateBuckets(cutoffs);

        // optional caps
        await capBucket('LIVE', 120);
        await capBucket('ARCHIVE', 3000);

        if (manageConnection) {
            await mongoose.disconnect();
        }
    } catch (e) {
        // don't swallow errors; let caller decide how to log/alert
        if (manageConnection) {
            try { await mongoose.disconnect(); } catch {}
        }
        throw e;
    }
}

module.exports = { computeCutoffs, updateBuckets, runRollover };

/* -------------- CLI ENTRY  -------------- */
if (require.main === module) {
    runRollover({ manageConnection: true })
        .then(() => {
            console.log('[rollover] done');
            process.exit(0);
        })
        .catch((e) => {
            console.error('[rollover] failed', e);
            process.exit(1);
        });
}