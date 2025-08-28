// mock fs + rss-parser + articleWorker all inside factories
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify([
    { source: 'mlb.com', feedUrl: 'https://example.com/feed.xml' }
  ])),
}));

jest.mock('rss-parser', () => {
    // return a constructor that creates an object with parseURL()
    return function RSSParser () {
        return {
            parseURL: jest.fn(async () => ({
                items: [
                    { link: 'https://site.com/1', isoDate: '2025-08-01T00:00:00Z' },
                    { link: 'https://site.com/2', pubDate: 'Sun, 01 Aug 2025 00:00:00 GMT'},
                ],
            })),
        };
    };
});

jest.mock('../jobs/articleWorker', () => ({
    processUrl: jest.fn().mockResolvedValue({ ok: true }),
}), { virtual: true }); // virtual since not in node_modules

// pull in mocked processUrl by the same resolved path
const { processUrl } = require('../jobs/articleWorker');

// now require startPolling (AFTER mocks are set)
const { pollOnce } = require('../jobs/pollFeeds');

describe('pollFeeds', () => {
    let logSpy, errSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.FEED_POLL_MS = '999999'; // ensure the interval doesn't fire repeatedly

        // silence logs during the test
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        // quiet logs
        logSpy?.mockRestore();
        errSpy?.mockRestore();
    });

    it('reads feeds and calls processUrl for each item', async () => {
        await pollOnce(); // directly invoke the logic

        expect(processUrl).toHaveBeenCalledTimes(2);
        const urls = processUrl.mock.calls.map(([arg]) => arg.url);
        expect(urls).toContain('https://site.com/1', 'https://site.com/2');
    });
});