# News Injestion Pipeline

**Author:** cdeasis<br>
**Date:** August 2025

## Purpose
This document describes and outlines the backend news ingestion flow:
- **Feed polling** &rarr; **article processing** &rarr; **extraction** &rarr; **summarization** &rarr; **storage**
- How jobs, models, libraries, and the Python extractor service work together
- How rollover/bucketing organizes articles into **LIVE / ARCHIVE / COLD** for frontend use
- Current status and next steps

## Documentation

### Subsystems:

#### 1. **Feed Poller** (`backend/jobs/pollFeeds.js`)
- Reads `backend/feeds.json` (list of sources)
- Uses `rss-parser` to fetch items
- For each `<item>`:
    - Extracts link + published date
    - Calls `processUrl({ url, source, publishedAt })`
- Concurrency controlled by `withGate()` to avoid hammering extractor
- Supports include/exclude URL filters and per-feed `maxItems`
- Exports:
    - `pollOnce()` - single pass (useful for tests)
    - `startPolling()` - bootstraps inverval loop (default 5 min via `FEED_POLL_MS`)
#### 2. **Article Worker** (`backend/jobs/articleWorker.js`)
- **Deduplication**: via `canonicalize(url)`, skips if already in DB
- **Extraction**:
    - Calls Python FastAPI extractor (`POST /extract`)
    - Returns `{ text, title, byline, lead_image, canonical_url }`
- **Summarization**: baseline extractive summary with `extractiveSummary(text)`
- **Tagging**: entity tags via `tagEntites(title + text)` (team/player mapping)
- **Persistence**: inserts into `LiveNewsArticles` with normalized fields
- Returns `{ ok: True }` or `{ skipped: true, reason }`
#### 3. **Extractor Service** (`extractor/app.py`)
- Python FastAPI app wrapping **httpx + trafilatura**
- Fetches HTML with retries, fallback to `amp/` or `?output=amp` for CBS
- Extracts clean JSON with `{ text, title, author, images, url }`
- `/health` endpoint for readiness
- Run locally with `uvicorn app:app --host 127.0.0.1 --port 8000`
#### 4. **Schema** (`backend/models/LiveNewsArticles.js`)
- Single primary collection: **LiveNewsArticles**
- Fields:
    - Core: `title`, `url`, `canonicalUrl`, `author`, `publishedAt`, `raw.text`, `summary`, `tags`, `images`
    - Metadata: `bucket` (`LIVE | ARCHIVE | COLD`), `sourceRank`, `ingestedAt`
- Indexes:
    - `(bucket, publishedAt)` for fast filtering
    - `(source, publishedAt)` for per-source queries
    - Full-text index on `title + raw.text`
#### 5. **Rollover / Bucketing**
- **Old system**: physically moving docs between `NewsArticles`, `ArchiveArticles`, and `ColdArticles`
- **New system**: single collection, with `bucket` field updated
    - `LIVE`: today + yesterday
    - `ARCHIVE`: 2 days &rarr; 1 month
    - `COLD`: >1 month (only via search)
#### 6. **Supporting Libraries** (`backend/lib`)
- `dedupe.js` &rarr; canonicalize URLs, near-duplicate detection
- `summarize.js` &rarr; baseline summary generator
- `tags.js` &rarr; entity tagging
- `teamdefinitions.js` &rarr; MLB-specific mappings

## Current Status (Sept 2025)
✅ Polling and extraction pipeline stable<br>
✅ Live ingestion writes correctly into `LiveNewsArticles`<br>
✅ Feeds working: MLB.com, ESPN, MLBTradeRumors, Yahoo Sports, CBS (AMP fallback)<br>
✅ Rollover + bucketing confirmed working (LIVE &rarr; ARCHIVE &rarr; COLD)<br>
✅ Frontend integration complete (News page, Home highlights, Archive page wired to API)<br>
⚠️ AP feeds still problematic, may need custom parsing in future<br>

## Possible Expansions
- Add more feeds (ex: The Athletic, Fangraphs, team-specific blogs) with tuned include/exclude filters
- Weighted `sourceRank` for tiebreaks (trusted sources show higher)
- Deduplication improvements (canoniocalize + near-text similarity)

## Next Steps

#### **Phase 1 - Schema + Rollover (done)**
- Finalize schema evolution (`bucket`, indexes)
- Implement rollover script that updates `bucket` values daily
- Map backend responses to existing frontend article shape

#### **Phase 2- Frontend Integration (done)**
- Update News page to pull from `/api/news/live`
- Archive page &rarr; `api/news/archive` (2d-1mo)
- Search &rarr; query COLD when keywords present

#### **Phase 3 - Summarization System (final phase, next and current branch)**
- Replace baseline `extractiveSummary()` with ML summarizer
- Generate richer `short` + `long` summaries
- Persist model metadata in `summary.model`
- Ensure attribution via `canonicalUrl` links