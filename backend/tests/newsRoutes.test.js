// mock poller so importing routes/server doesn't start intervals
jest.mock('../jobs/pollFeeds', () => ({
    startPolling: jest.fn(),
}));

// mock LiveNewsArticle model methods used by routes
jest.mock('../models/LiveNewsArticles', () => ({
    find: jest.fn(),
    findById: jest.fn(),
}));

const request = require('supertest');
const app = require('../server'); // exported express app

test('live list', async () => {
  // chain mocks for find().sort().limit()
  const docs = [{ _id: '1' }, { _id: '2' }];
  const limit = jest.fn().mockResolvedValue(docs);
  const sort = jest.fn(() => ({ limit }));
  Live.find.mockReturnValue({ sort });

  const res = await request(app).get('/api/news/live');
  expect(res.status).toBe(200);
  expect(res.body).toEqual(docs);
  expect(Live.find).toHaveBeenCalledTimes(1);
  expect(sort).toHaveBeenCalledWith({ publishedAt: -1, _id: -1 });
  expect(limit).toHaveBeenCalledWith(20);
});


const Live = require('../models/LiveNewsArticles');

describe('GET /api/news/live', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns latest live articles (default limit 20)', async () => {
        // mock chained Mongoose query: find().sort().limit()
        const fakeDocs = [{ _id: '1', title: 'A'}, { _id: '2', title: 'B' }];
        const limitFn = jest.fn().mockResolvedValue(fakeDocs);
        const sortFn = jest.fn(() => ({ limit: limitFn }));
        Live.find.mockReturnValue({ sort: sortFn });

        const res = await request(app).get('/api/news/live');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeDocs);
        // ensure sort/limit called as expected
        expect(Live.find).toHaveBeenCalledTimes(1);
        expect(sortFn).toHaveBeenCalledWith({ publishedAt: -1, _id: -1 });
        expect(limitFn).toHaveBeenCalledWith(20);
    });

    it('honors ?limit= param but caps at 100', async () => {
        const fakeDocs = new Array(5).fill(0).map((_, i) => ({ _id: String(i) }));
        const limitFn = jest.fn().mockResolvedValue(fakeDocs);
        const sortFn = jest.fn(() => ({ limit: limitFn }));
        Live.find.mockReturnValue({ sort: sortFn });

        const res = await request(app).get('/api/news/live?limit=500');
        expect(res.status).toBe(200);
        expect(limitFn).toHaveBeenCalledWith(100); // capped
    });
});

describe('GET /api/news/live/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns a single article by id', async () => {
        const doc = { _id: '123', title: 'Hello' };
        Live.findById.mockResolvedValue(doc);

        const res = await request(app).get('/api/news/live/abc123');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(doc);
        expect(Live.findById).toHaveBeenCalledWith('abc123');
    });

    it('returns 404 when not found', async () => {
        Live.findById.mockResolvedValue(null);

        const res = await request(app).get('/api/news/live/unknown');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Article not found' });
    });
});