# News Injestion Pipeline

**Author:** cdeasis
**Date:** August 2025

## Purpose
This document explains the backend news ingestion flow, including the roles of worker jobs, supporting libraries, models, and the Python extractor service. It also describes the associated test setup, manual scratch utilities, and next steps for wiring this into the application and frontend.

## Documentation

### Backend Files Explanation:

`backend/jobs/pollFeeds.js`:
- *Reads feed list* from `backend/feeds.json` (have mocked `fs.readFilesSync` in tests)
- *Poll each RSS feed* with `rss-parser` &rarr; `parseURL(feed.feedUrl)`
- for each `<item>` in the feed it:
    - pulls a link and published date
    - calls `processUrl({ url, source, publishedAt }) from articleWorker.js
- exported `startPolling()` runs `pollOnce()` immediately and on an interval (configured by `FEED_POLL_MS`), while `pollOnce()` can be called directly (used in test)

`backend/jobs/articleWorker.js`:
- *Dedupe*: `canonicalize(url)` &rarr; looks up `LiveNewsArticle.findOne({ canonicalUrl }) - if found, skip
- *Extract*: calls *Pyton FASTAPI* extractor: `POST ${EXTRACTOR_URL}/extract { url }`
    - *Extractor* returns `{ text, title, byline, lead_image, canonical_url }` (from `extractor/app.py`)
- *Summarize*: run `extractiveSummary(text)` (simple TextRank/lead-based baseline)
- *Tag*: run `tagEntities(title + text) using backend `teamdefinitions` mapping
- *Persist*: `LiveNewsArticle.create({...})` with normalized fields
- Returns `{ ok: true, id: ... }` on success or `{ skipped: true, reason: ... }`

### How these work in conjunction with other elements:
- *Model*:  `backend/models/LiveNewsArticles.js` is the Mongo schema the worker writes into
    - UI can read from this later via new endpoints like:
        - `GET /api/news/live` (list)
        - `GET /api/news/live/:id` (detail)
- *Lib Helpers* (`backend/lib`):
    - `dedupe.js` &rarr; canonical URL + near-dup checks
    - `summarize.js` &rarr; `extractiveSummary()` used by worker
    - `tags.js` + `teamdefinitions.js` &rarr; entity tagging (team/players)
- *Extractor service* (`extractor/app.py`):
    - fetches article HTML (`httpx`/`trafilatura`), extracts clean text/title/author/image
    - run with `uvicorn` and set `EXTRACOTR_URL=http://127.0.0.1:8000`

### Testing
- `tests/articleWorker.test.js`:
    - Mocks axios and Mongoose model
    - Cases:
        1. *Skips duplicates* when a doc already exists for `canonicalUrl`
        2. *Skips empty extraction* (no `text` and `title`)
        3. *Saves* a doc when extraction has content; asserts axios with `/extract/ and `create()` invoked
- `tests/pollFeeds.test.js`:
    - Mocks `fs` (so feeds.json is controlled) and `rss-parser` (feed items controlled)
    - Mocks `articleWorker.processUrl`
    - Calls `pollOnce()` directly and asserts `processUrl` called twice with two mocked item links
- `backend/scratch/` (manual smoke tests):
    - `testLib.js`: runs helpers (summarize/dedupe/tags) with real code
        - quick sanity check
    - `testModel.js`: connects to Mongo, creates and deletes a `LiveNewsArticle`
        - confirms schema/connection

### Next Steps
1. *Wire routes* for live collection:
    - `routes/news.js`:
    ```js
    router.get('/live', liveController.list);
    router.get('/live/:id', liveController.getById);
    ```
    - Controller methods use `LiveNewsArticle.find()` etc.
2. *Start polling* from server:
    - Import `{ startPolling }` in `backend/server.js` (or a bootstrap file) and call it once at startup
    - Enxure `EXTRACTOR_URL` and `FEED_POLL_MS` (optionally) are in `.env`
3. *Run extractor*:
    - `cd extractor && python -m venv venv && pip install -r requirements.txt`
    - `uvicorn app:app --host 127.0.0.1 --port 8000`
    - Confirm `GET /health` returns `{ ok: true }`
4. *Update frontend* (when ready):
    - Point News/Archive UIs to new `/api/news/live` endpoints (or keep current endpoints and add an `"INGEST LIVE"` section)
    - Keep showing own summaries, headline, and link back to original URL for attribution