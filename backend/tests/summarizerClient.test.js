jest.mock('axios', () => {
  const instance = { post: jest.fn() };
  return {
    create: jest.fn(() => instance),
  };
});

const axios = require('axios');
const {
    callSummarizer,
    shouldSummarize,
    config,
} = require('../lib/summarizerClient');

describe('summarizerClient', () => {
    let axiosInstance;

    beforeAll(() => {
        // summarizerClient required already called axios.create(...)
        axiosInstance = axios.create.mock.results[0].value;
    });

    beforeEach(() => {
        // rest only post mock, not whole axios mock
        axiosInstance.post.mockReset();
    })

    test('shouldSummarize respects enabled + minChars', () => {
        const prevEnabled = config.enabled;
        const prevMin = config.minChars;

        // simulate enabled with minChars=10
        config.enabled = true;
        config.minChars = 10;

        expect(shouldSummarize('short')).toBe(false);       // length 5 < 10
        expect(shouldSummarize('0123456789X')).toBe(true);  // length 11

        // restore
        config.enabled = prevEnabled;
        config.minChars = prevMin;
    });

    test('callSummarizer returns short/long/model on success', async () => {
        axiosInstance.post.mockResolvedValue({ data: { short: 's', long: 'l', model: 'bart' } });
        const res = await callSummarizer('some text');
        expect(res).toEqual(expect.objectContaining({ short: 's', long: 'l', model: 'bart' }));
        expect(axiosInstance.post).toHaveBeenCalledWith(
            config.url,
            expect.objectContaining({ text: 'some text', short_tokens: config.shortTokens, long_tokens: config.longTokens }),
        );
    });

    test('callSummarizer throws on empty summary', async () => {
        axiosInstance.post.mockResolvedValue({ data: {} });
        await expect(callSummarizer('x')).rejects.toThrow('empty-summary');
    });

    test('callSummarizer retries then succeeds', async () => {
        const err = new Error('boom');
        axiosInstance.post
            .mockRejectedValueOnce(err) // first attempt fails
            .mockResolvedValueOnce({ data: { short: 's2', long: 'l2', model: 'm2' } });
        const res = await callSummarizer('y');
        expect(res.model).toBe('m2');
        expect(axiosInstance.post).toHaveBeenCalledTimes(2);
    });
});