jest.mock('axios', () => ({ post: jest.fn() }));

const axios = require('axios');

// important: mock the model before requiring the worker
const createMock = jest.fn();
const findOneMock = jest.fn();
jest.mock('../models/LiveNewsArticles', () => ({
    findOne: (...args) => findOneMock(...args),
    create: (...args) => createMock(...args),
}));

const { processUrl } = require('../jobs/articleWorker');

describe('articleWorker.processUrl', () => {
    beforeEach(() => {
        jest.clearallMocks();
        process.env.EXTRACTOR_URL = 'http://127.0.0.1:8000';
    });

    it('skips duplicates by canonicalUrl', async () => {
        findOneMock.mockResolvedValue({ _id: 'x'}); // pretend exists
        const res= await processUrl({ url: 'https://site.com/a?utm=1', source: 'x'});
        expect(res).toEqual({ skipped: true, reason: 'duplicate' });
        expect(axios.post).not.toHaveBeenCalled();
    });

    it ('skips when extractor returns no comment', async () => {
        findOneMock.mockResolvedValue(null); 
        axios.post.mockResolvedValue({ data: { text: '', title: ''}});

        const res = await processUrl({ url: 'https://site.com/a', source: 'x'});
        expect(res).toEqual({ skipped: true, reason: 'no content' });
        expect(createMock).not.toHaveBeenCalled();
    });

    it ('saves when extractor returns content', async () => {
        findOneMock.mockResolvedValue(null);
        axios.post.mockResolvedValue({ 
            data: {
                text: 'Yankees beat Mariners in extras.',
                title: 'Yankees win',
                byline: 'John',
                lead_image: 'https://img',
            },
        });
        createMock.mockResolvedValue({ _id: { toString: () => 'abc' } });

        const res = await processUrl({ url: 'https://site.com/a?utm=1', source: 'mlb' });

        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/extract', { url: 'https://site.com/a?utm=1' });
        expect(createMock).toHaveBeenCalled();
        expect(res).toEqual({ ok: true, id: 'abc123' });
    });
});