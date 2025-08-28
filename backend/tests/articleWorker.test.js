// mock axios and Mongoose model *inside* jest.mock factories
jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../models/LiveNewsArticles', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
}));

const axios = require('axios');
const LiveModel = require('../models/LiveNewsArticles'); // gets the mocked module
const { processUrl } = require('../jobs/articleWorker');

describe('articleWorker.processUrl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.EXTRACTOR_URL = 'http://127.0.0.1:8000';
    });

    it('skips duplicates by canonicalUrl', async () => {
        LiveModel.findOne.mockResolvedValue({ _id: 'x'}); // pretend exists
        const res= await processUrl({ url: 'https://site.com/a?utm=1', source: 'x' });
        expect(res).toEqual({ skipped: true, reason: 'duplicate' });
        expect(axios.post).not.toHaveBeenCalled();
    });

    it ('skips when extractor returns no comment', async () => {
        LiveModel.findOne.mockResolvedValue(null); 
        axios.post.mockResolvedValue({ data: { text: '', title: ''}});

        const res = await processUrl({ url: 'https://site.com/a', source: 'x' });
        expect(res).toEqual({ skipped: true, reason: 'no content' });
        expect(LiveModel.create).not.toHaveBeenCalled();
    });

    it ('saves when extractor returns content', async () => {
        LiveModel.findOne.mockResolvedValue(null);
        axios.post.mockResolvedValue({ 
            data: {
                text: 'Yankees beat Mariners in extras.',
                title: 'Yankees win',
                byline: 'John',
                lead_image: 'https://img',
            },
        });
        LiveModel.create.mockResolvedValue({ _id: { toString: () => 'abc123' } });

        const res = await processUrl({ url: 'https://site.com/a?utm=1', source: 'mlb' });

        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/extract', { url: 'https://site.com/a?utm=1' });
        expect(LiveModel.create).toHaveBeenCalled();
        expect(res).toEqual({ ok: true, id: 'abc123' });
    });
});