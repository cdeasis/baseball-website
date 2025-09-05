jest.mock('../jobs/pollFeeds', () => ({ startPolling: jest.fn() }));

// Mock the model BEFORE requiring the app
const mockModel = {
  find: jest.fn(),
  findById: jest.fn(),
};
jest.mock('../models/LiveNewsArticles', () => mockModel);

const request = require('supertest');
const app = require('../server'); // should export the express app (not listening)

describe('news routes (bucketed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function chainFindReturns(docs) {
    const lean = jest.fn().mockResolvedValue(docs);
    const limit = jest.fn(() => ({ lean }));
    const sort = jest.fn(() => ({ limit }));
    mockModel.find.mockReturnValue({ sort });
    return { sort, limit, lean };
  }

  test('GET /api/news returns LIVE mapped list', async () => {
    // docs as stored in DB
    const dbDocs = [
      { _id: 'a1', title: 'T1', images: { lead: 'img1' }, summary: { short: 'S1' }, raw: { text: 'X' }, author: 'A', source: 'S', publishedAt: new Date('2025-09-03') },
      { _id: 'a2', title: 'T2', images: { lead: 'img2' }, summary: { long: 'L2' }, raw: { text: 'Y' }, author: 'B', source: 'S', publishedAt: new Date('2025-09-02') },
    ];
    const { sort, limit } = chainFindReturns(dbDocs);

    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    // mapped shape
    expect(res.body).toEqual([
      expect.objectContaining({ id: 'a1', title: 'T1', image: 'img1', author: 'A', source: 'S', publishedDate: expect.any(String) }),
      expect.objectContaining({ id: 'a2', title: 'T2', image: 'img2', author: 'B', source: 'S', publishedDate: expect.any(String) }),
    ]);
    expect(mockModel.find).toHaveBeenCalledWith({ bucket: 'LIVE' });
    expect(sort).toHaveBeenCalledWith({ publishedAt: -1, sourceRank: -1, title: 1 });
    expect(limit).toHaveBeenCalledWith(200);
  });

  test('GET /api/news/archive returns ARCHIVE mapped list', async () => {
    const dbDocs = [
      { _id: 'x1', title: 'Old1', images: {}, summary: {}, raw: { text: 'aaa' }, author: '', source: 'src', publishedAt: new Date('2025-08-20') },
    ];
    const { sort, limit } = chainFindReturns(dbDocs);

    const res = await request(app).get('/api/news/archive');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual(expect.objectContaining({
      id: 'x1',
      title: 'Old1',
      isArchived: true,
      source: 'src',
    }));
    expect(mockModel.find).toHaveBeenCalledWith({ bucket: 'ARCHIVE' });
    expect(sort).toHaveBeenCalledWith({ publishedAt: -1 });
    expect(limit).toHaveBeenCalledWith(1000);
  });

  test('GET /api/news/cold returns recent COLD slice when no q', async () => {
    const dbDocs = [
      { _id: 'c1', title: 'Cold1', images: {}, summary: {}, raw: { text: 'zzz' }, author: 'ZZ', source: 'src', publishedAt: new Date('2025-07-01') },
    ];
    const { sort, limit } = chainFindReturns(dbDocs);

    const res = await request(app).get('/api/news/cold');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual(expect.objectContaining({
      id: 'c1',
      title: 'Cold1',
      isArchived: false,
      source: 'src',
    }));
    expect(mockModel.find).toHaveBeenCalledWith({ bucket: 'COLD' });
    expect(sort).toHaveBeenCalledWith({ publishedAt: -1 });
    expect(limit).toHaveBeenCalledWith(200);
  });

  test('GET /api/news/cold?q=foo performs text search', async () => {
    const dbDocs = [
      { _id: 'c2', title: 'Foo story', images: {}, summary: {}, raw: { text: '...' }, author: '', source: 'src', publishedAt: new Date('2025-06-01') },
    ];
    // For the search branch we need to mock sort().limit().lean() again
    const lean = jest.fn().mockResolvedValue(dbDocs);
    const limit = jest.fn(() => ({ lean }));
    const sort = jest.fn(() => ({ limit }));
    // Note: when using $text projection, we pass both filter and projection:
    mockModel.find.mockReturnValue({ sort });

    const res = await request(app).get('/api/news/cold?q=foo');
    expect(res.status).toBe(200);
    expect(mockModel.find).toHaveBeenCalledWith(
      { bucket: 'COLD', $text: { $search: 'foo' } },
      { score: { $meta: 'textScore' } }
    );
    expect(sort).toHaveBeenCalledWith({ score: { $meta: 'textScore' }, publishedAt: -1 });
    expect(limit).toHaveBeenCalledWith(200);
  });

  test('GET /api/news/:id returns mapped detail', async () => {
    const doc = {
      _id: 'abc123',
      title: 'Hello',
      source: 'cbssports.com',
      author: 'Author',
      publishedAt: new Date('2025-09-03T12:00:00Z'),
      images: { lead: 'lead.jpg' },
      summary: { long: 'Long summary' },
      raw: { text: 'Raw text' },
      url: 'https://example.com',
    };
    mockModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
    });

    const res = await request(app).get('/api/news/abc123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'abc123',
      title: 'Hello',
      source: 'cbssports.com',
      author: 'Author',
      publishedDate: doc.publishedAt.toISOString(),
      image: 'lead.jpg',
      summary: 'Long summary',
      blurb: '',
      url: 'https://example.com',
    });
    expect(mockModel.findById).toHaveBeenCalledWith('abc123');
  });

  test('GET /api/news/:id 404s when not found', async () => {
    mockModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
    });
    const res = await request(app).get('/api/news/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});