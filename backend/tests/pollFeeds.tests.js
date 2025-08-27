jest.mock('fs', () => ({
  readFileSync: jest.fn(() => JSON.stringify([
    { source: 'mlb.com', feedUrl: 'https://example.com/feed.xml' }
  ])),
}));
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn(async () => ({
      items: [
        { link: 'https://site.com/1', isoDate: '2025-08-01T00:00:00Z' },
        { link: 'https://site.com/2', pubDate: 'Sun, 01 Aug 2025 00:00:00 GMT' },
      ],
    })),
  }));
});
const processUrlMock = jest.fn().mockResolvedValue({ ok: true });
jest.mock('../jobs/articleWorker', () => ({
  processUrl: (...args) => processUrlMock(...args),
}));

const { startPolling } = require('../jobs/pollFeeds');

describe('pollFeeds', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    process.env.FEED_POLL_MS = '999999'; // ensure the interval doesn't fire repeatedly
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads feeds and calls processUrl for each item', async () => {
    const handle = startPolling(); // this calls pollOnce immediately per your code

    // let any pending microtasks resolve
    await Promise.resolve();

    expect(processUrlMock).toHaveBeenCalledTimes(2);
    const calls = processUrlMock.mock.calls.map(([arg]) => arg.url);
    expect(calls).toEqual(['https://site.com/1', 'https://site.com/2']);

    clearInterval(handle);
  });
});