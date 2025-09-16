# Standings Ingestion Pipeline

**Author:** cdeasis<br>
**Date:** September 2025<br>

## Purpose
This document describes and outlines the backend ingestion flow for MLB standings data:
- Fetching from **MLB's StatsAPI**
- Normalizing team IDs and metadata
- Calculating derived statistics (PCT, GB, DIFF, EXWL, WCGB)
- Storing in MongoDB snapshots for frontend use

--- 

## Documentation

### Subsystems:

#### 1. **Team Definitions** (`backend/lib/teamdefinitions.js`) + (`backend/lib/teamIdMap.js`)
- Defines canonical team metadata (`teamId`, name, abbreviaion, league, division, colors, etc.)
- Extended with offical **MLB API team IDs** (`mlbId`) for mapping external data to internal records
- Used to normalize external API responses into internal `teamId`

#### 2. **Standings Snapshot Model** (`backend/models/StandingsSnapshot.js`)
- Mongo schema representing a snapshot of standings for a given date
- Fields:
  - Core: `teamId`, `W`, `L`, `RS`, `RA`, `STRK`, `L10`, splits: 
    - `HOME`, `AWAY`, `DAY`, `NIGHT`, `GRASS`, `TURF`, `RHP`, `LHP`, `1-RUN`, `XTRA`, vs divsions (`EAST`, `CENT`, `WEST`), interleague (`INTR`)
  - Derived: `PCT`, `DIFF`, `EXWL`, `GB`, `WCGB`
  - Metadata: `season`, `snapshotDate`, `createdAt`

#### 3. **Fetcher / Ingestor** (`backend/jobs/fetchStandings.js`)
- Calls **MLB StatsAPI**: `/api/v1/standings?leagueId=103,104&season=YYYY&standingsTypes=regularSeason`
- Maps `teamRecords[]` &rarr; noramlized rows using `TEAM_ID_MAP`
- Builds split records (`HOME`, `AWAY`, `DAY`, etc.)
- Computes derived stats (`PCT`, `DIFF`, `EXWL`)
- Persists into `StandingsSnapshot` collection
- Run modes:
  - **Manual**: 
    - `npm run standings:snapshot`
  - **Scheduled** via cron in `backend/jobs/scheduler` (default ~3AM ET daily)

#### 4. **Routing** (`backend/routes/standings.js`)
- `GET /api/standings?groupBy=division|league|overall`
  - Returns latest snapshot with GB calculated for requested grouping
- `GET /api/standings/wildcard`
  - Marks divsion leaders, computes WCGB, returns by league

#### 5. **Frontend Integration**
- **Removed dummy data**: `src/data/standingsData.js` and `src/util/expandedStandingsData.js`
- Now pulls **live data** from backend API
- Tables/views:
  - **StandingsCard** (Home)
  - **General Standings**
  - **Wild Card**
  - **Expanded (with all splits)**
  - **VS Division**
    - **Division / League / Overall** sub tables for each main view except for **Wild Card**

---

## Current Status (Sept 2025)
✅ StatsAPI connected (`/teams`, `/standings`)<br>
✅ Team ID mapping via `teamIdMap`<br>
✅ Standings snapshots stored in MongoDB<br>
✅ Frontend switched off dummy &rarr; live API<br>
✅ Scheduler runs snapshot ingestion daily (~3AM ET)<br>  

---

## Possible Expansions
- **Event-driven updates:** trigger standings update immediately after games go final (hook into scores/schedule ingestion)
- **Final daily check:** keep the 3AM ET run as a catch-all reconciliation
- **Historical archive:** retain daily snapshots for rewind/visualization of past standings
- **Projections**: layer on PECOTA, ZiPs, or internal ML models
- **Date-based queries**: `/api/standings/:date` to fetch any snapshot

---