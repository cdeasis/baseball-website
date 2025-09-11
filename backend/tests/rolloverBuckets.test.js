const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { DateTime } = require('luxon');

const LiveNewsArticle = require('../models/LiveNewsArticles');
const { updateBuckets } = require('../../scripts/rolloverBuckets');

const NY = 'America/New_York';

describe('rollover bucket updater', () => {
    let mongod;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri= mongod.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    beforeEach(async () => {
        await LiveNewsArticle.deleteMany({});
    })

    function makeDate({ daysAgo = 0 }) {
        return DateTime.now().setZone(NY).minus({ days: daysAgo }).toJSDate();
    }

    it('assigns LIVE / ARCHIVE / COLD based on publishedAt', async () => {
        // seed 3 docs with controlled dates
        await LiveNewsArticle.insertMany([
            { title: 'BUCKET TEST - LIVE', source: 'test', publishedAt: makeDate({ daysAgo: 0.5 }), raw: { text: 'x'} },
            { title: 'BUCKET TEST - ARCHIVE', source: 'test', publishedAt: makeDate({ daysAgo: 5 }), raw: { text: 'x'} },
            { title: 'BUCKET TEST - COLD', source: 'test', publishedAt: makeDate({ daysAgo: 40 }), raw: { text: 'x'} },
        ]);

        const now = DateTime.now().setZone(NY);
        const cutoffs = {
            twoDaysAgo: now.minus({ days: 2 }).toJSDate(),
            oneMonthAgo: now.minus({ days: 30 }).toJSDate(),
        };

        await updateBuckets(cutoffs);
        
        const live = await LiveNewsArticle.findOne({ title: /LIVE/ }).lean();
        const archive = await LiveNewsArticle.findOne({ title: /ARCHIVE/ }).lean();
        const cold = await LiveNewsArticle.findOne({ title: /COLD/ }).lean();

        expect(live.bucket).toBe('LIVE');
        expect(archive.bucket).toBe('ARCHIVE');
        expect(cold.bucket).toBe('COLD');
    })
})