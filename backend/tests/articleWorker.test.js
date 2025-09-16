// mock axios and Mongoose model *inside* jest.mock factories
jest.mock('axios', () => {
    const instance = { post: jest.fn() };
    return {
        __esModule: true,
        default: instance,
        create: jest.fn(() => instance),
        post: instance.post, // if code ever calls axios.post directly
    };
});

jest.mock('../models/LiveNewsArticles', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
}));

// mock summarizer client used by articleWorker
jest.mock('../lib/summarizerClient', () => ({
    summarizeOrFallback: jest.fn(),
}));

const axios = require('axios');
const LiveModel = require('../models/LiveNewsArticles');
const { processUrl } = require('../jobs/articleWorker');
const { summarizeOrFallback } = require('../lib/summarizerClient');

describe('articleWorker.processUrl', () => {
    let axiosInstance;

    beforeAll(() => {
        process.env.EXTRACTOR_URL = 'http://127.0.0.1:8000';
        axiosInstance = axios.create.mock.results[0].value;
    })

    beforeEach(() => {
        axiosInstance.post.mockReset();
        LiveModel.findOne.mockReset();
        LiveModel.create.mockReset();
        summarizeOrFallback.mockReset();
    });

    it('skips duplicates by canonicalUrl', async () => {
        LiveModel.findOne.mockResolvedValue({ _id: 'x'}); // pretend exists
        const res= await processUrl({ url: 'https://site.com/a?utm=1', source: 'x' });
        expect(res).toEqual({ skipped: true, reason: 'duplicate' });
        expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it ('skips when extractor returns no content', async () => {
        LiveModel.findOne.mockResolvedValue(null); 
        axiosInstance.post.mockResolvedValue({ data: { text: '', title: ''} });

        const res = await processUrl({ url: 'https://site.com/a', source: 'x' });
        expect(res).toEqual({ skipped: true, reason: 'no content' });
        expect(LiveModel.create).not.toHaveBeenCalled();
    });

    it ('saves with ML when extractor returns content', async () => {
        LiveModel.findOne.mockResolvedValue(null);
        axiosInstance.post.mockResolvedValue({ 
            data: {
                text: 'Yankees beat Mariners in extras.',
                title: 'Yankees win',
                byline: 'John',
                lead_image: 'https://img',
                html: '<p>...</p>',
            },
        });

        // summarizer returns ML payload
        summarizeOrFallback.mockResolvedValue({ 
            payload: {
                short: 'Short sum.',
                long: 'Long sum.',
                model: 'facebook/bart-large-cnn',
                generatedAt: expect.any(Date),
            },
            used: 'ml',
            model: 'facebook/bart-large-cnn',
        });

        LiveModel.create.mockResolvedValue({ _id: { toString: () => 'abc123' } });

        const res = await processUrl({ url: 'https://site.com/a?utm=1', source: 'mlb' });

        expect(axiosInstance.post).toHaveBeenCalledWith('/extract', { url: 'https://site.com/a?utm=1' });
        expect(summarizeOrFallback).toHaveBeenCalledWith(
            'Yankees beat Mariners in extras.',
            expect.any(Function) 
        );
        expect(LiveModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Yankees win',
                summary: expect.objectContaining({ model: 'facebook/bart-large-cnn' }),
            })
        );
        expect(res).toEqual({ ok: true, id: 'abc123' });
    });

    it('falls back to extracive when summarizer throws', async () => {
        LiveModel.findOne.mockResolvedValue(null);
        axiosInstance.post.mockResolvedValue({
            data: { text: 'Some text', title: 'Some title', byline: '', lead_image: ''},
        });

        // force fallback path
        summarizeOrFallback.mockResolvedValue({
            payload: {
                short: 'Extractive short',
                long: 'Extractive long',
                model: 'extractive',
                generatedAt: expect.any(Date),
            },
            used: 'extractive',
            model: 'extractive',
        });

        LiveModel.create.mockResolvedValue({ _id: { toString: () => 'id1' } });

        const res = await processUrl({ url: 'https://x.com', source: 'src' });
        expect(res).toEqual({ ok: true, id: 'id1' });
        expect(LiveModel.create).toHaveBeenCalledWith(
            expect.objectContaining({
                summary: expect.objectContaining({ model: 'extractive' }),
            })
        );
    });
});