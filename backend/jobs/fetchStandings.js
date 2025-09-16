const axios = require('axios');
const StandingsSnapshot = require('../models/StandingsSnapshot');
const { TEAM_ID_MAP, teams: teamsMeta } = require('../lib/teamIdMap');
const {
    calculateWinPercentage,
    calculateRunDifferential,
    calculatedExpectedWL,
} = require('./standingsCalcs');
const { buildAllSplits } = require('../lib/standingsSplits');
 
const STATSAPI_BASE = process.env.STATSAPI_BASE || 'https://statsapi.mlb.com/api/v1';

async function fetchFromStatsApi(season = new Date().getFullYear()) {
    // standings records
    const url = `${STATSAPI_BASE}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason`;
    const { data } = await axios.get(url);

    // shape: data.records[].teamRecords[]
    const rows = [];
    for (const rec of (data.records || [])) {
        for (const tr of (rec.teamRecords || [])) {
            const mlbId = String(tr.team?.id);
            const code = TEAM_ID_MAP[mlbId];
            const meta = code ? teamsMeta[code] : null;
            if (!meta) continue;

            const splits = buildAllSplits(tr, meta.league);

            rows.push({
                teamId: code,
                league: meta.league,
                division: meta.division,

                W: tr.wins ?? 0,
                L: tr.losses ?? 0,
                RS: tr.runsScored ?? 0,
                RA: tr.runsAllowed ?? 0,
                
                // streak (StatsAPI gives object)
                STRK: tr.streak?.streakCode || '',
                // summaries from helpers
                L10: splits.L10 || '',
                HOME: splits.HOME || '',
                AWAY: splits.AWAY || '',
                DAY: splits.DAY || '',
                NIGHT: splits.NIGHT || '',
                ONE_RUN: splits['1-RUN'] || '',
                EXTRA_INN: splits.XTRA || '',
                EAST: splits.EAST || '',
                CENT: splits.CENT || '',
                WEST: splits.WEST || '',
                INTR: splits.INTR || '',
                VS_R: splits.RHP || '',
                VS_L: splits.LHP || '',
                GRASS: splits.GRASS || '',
                TURF: splits.TURF || '',
            });
        }
    }

    // compute derived
    rows.forEach(t => {
        const games = (t.W || 0) + (t.L || 0);
        t.PCT = calculateWinPercentage(t.W, t.L);
        t.DIFF = calculateRunDifferential(t.RS, t.RA);
        t.EXWL = calculatedExpectedWL(t.RS, t.RA, games);
    });

    const today = new Date().toISOString().slice(0, 10);
    const doc = await StandingsSnapshot.create({
        season,
        snapshotDate: today,
        teams: rows,
    });

    return { id: doc._id.toString(), count: rows.length };
}

module.exports = { fetchFromStatsApi };