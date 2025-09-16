# News Injestion Pipeline

**Author:** cdeasis<br>
**Date:** August 2025

## Purpose
This document describes and outlines the backend news ingestion flow:
- **Feed polling** &rarr; **article processing** &rarr; **extraction** &rarr; **summarization** &rarr; **storage**
- How jobs, models, libraries, and the Python extractor service work together
- How rollover/bucketing organizes articles into **LIVE / ARCHIVE / COLD** for frontend use

--- 

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
- **Summarization**: 
    - Uses summarizer client (`POST /summarize`)
    - Stores both `summary.short` and `summary.long`, with `summary.model` set to `facebook/bart-large-cnn`
    - Falls back to baseline extractive summary on error/timeout
- **Tagging**: entity tags via `tagEntites(title + text)` (team/player mapping)
- **Persistence**: inserts into `LiveNewsArticles` with normalized fields
- Returns `{ ok: True }` or `{ skipped: true, reason }`
- Logs `{ usedSummary: 'ml' | 'extractive' }`
#### 3. **Summarizer Client** (`backend/lib/summarizerClient.js`)
- Wrapper around Python FastAPI summarizer
- Retries on transient errors, applies min-length guards
- Provides:
    - `shouldSummarize(text)` &rarr; skip short content
    - `callSummarizer(text)` &rarr; returns `{ short, long, model }`
#### 4. **Extractor Service** (`extractor/app.py`)
- Python FastAPI app wrapping **httpx + trafilatura**
- Fetches HTML with retries, fallback to `amp/` or `?output=amp` for CBS
- Extracts clean JSON with `{ text, title, author, images, url }`
- Summarization endpoint:
    - `/summarize` &rarr; generates **short** ($\approx 80$ tokens) + **long** ($\approx 320$ tokens) summaries
    - Uses HuggingFace `facebook/bart-large-cnn`, runs on GPU if available
- `/health` endpoint for readiness
- Run locally with `uvicorn app:app --host 127.0.0.1 --port 8000`
#### 5. **Schema** (`backend/models/LiveNewsArticles.js`)
- Single primary collection: **LiveNewsArticles**
- Fields:
    - Core: `title`, `url`, `canonicalUrl`, `author`, `publishedAt`, `raw.text`, `summary`, `tags`, `images`
    - Metadata: `bucket` (`LIVE | ARCHIVE | COLD`), `sourceRank`, `ingestedAt`
- Indexes:
    - `(bucket, publishedAt)` for fast filtering
    - `(source, publishedAt)` for per-source queries
    - Full-text index on `title + raw.text`
#### 6. **Rollover / Bucketing**
- **Old system**: physically moving docs between `NewsArticles`, `ArchiveArticles`, and `ColdArticles`
- **New system**: single collection, runs via cron scheduler (twice daily), with `bucket` field updated
    - `LIVE`: today + yesterday
    - `ARCHIVE`: 2 days &rarr; 1 month
    - `COLD`: >1 month (only via search)
#### 7. **Supporting Libraries** (`backend/lib`)
- `dedupe.js` &rarr; canonicalize URLs, near-duplicate detection
- `summarize.js` &rarr; legacy extractive summary (still used as fallback)
- `tags.js` &rarr; entity tagging
- `teamdefinitions.js` &rarr; MLB-specific mappings

---

## Current Status (Sept 2025)
✅ Polling and extraction pipeline stable<br>
✅ Summarizer integrated (short + long, ML-backed with fallback) <br>
✅ Articles correctly persisted with metadata and bucketed rollover<br>
✅ Cron scheduler configured (feeds + rollover twice daily)<br>
✅ Frontend integration complete (News page, Home highlights, Archive page wired to API)<br>
⚠️ Some feeds (Ap, edge cases) still may need custom parsing

---