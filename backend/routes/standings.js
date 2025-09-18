const express = require('express');
const router = express.Router();
const StandingsSnapshot = require('../models/StandingsSnapshot');
const { teams: teamsMeta } = require('../lib/teamIdMap');
const {
    calculateWinPercentage,
    calculateRunDifferential,
    calculatedExpectedWL,
    calculateGamesBack,
    calculatedWildCard,
} = require('../jobs/standingsCalcs');

function enrichRow(t) {
  const m = teamsMeta[t.teamId] || {};
  const games = (t.W || 0) + (t.L || 0);
  const pctNum = calculateWinPercentage(t.W, t.L);
  const pctStr = String(pctNum.toFixed(3)).replace(/^0/, '');

  return {
    id: t.teamId,
    name: m.name || t.teamId,
    abbreviation: m.abbreviation || t.teamId,
    logo: m.logo || '',

    league: m.league || t.league,
    division: m.division || t.division,

    W: t.W ?? 0,
    L: t.L ?? 0,
    RS: t.RS ?? 0,
    RA: t.RA ?? 0,

    // derived
    PCT: pctStr,
    DIFF: calculateRunDifferential(t.RS, t.RA),
    EXWL: calculatedExpectedWL(t.RS, t.RA, games),

    // splits (ensure keys exist even if empty)
    STRK: t.STRK || '',
    L10: t.L10 || '',
    HOME: t.HOME || '',
    AWAY: t.AWAY || '',
    DAY: t.DAY || '',
    NIGHT: t.NIGHT || '',
    '1-RUN': t.ONE_RUN || '',
    XTRA: t.EXTRA_INN || '',
    EAST: t.EAST || '',
    CENT: t.CENT || '',
    WEST: t.WEST || '',
    INTR: t.INTR || '',
    RHP: t.VS_R || '',
    LHP: t.VS_L || '',
    GRASS: t.GRASS || '',
    TURF: t.TURF || '',
  };
}

// GET /api/standings?groupBy=division|league|overall
router.get('/', async (req, res) => {
  res.set('Cache-control', 'no-store');

  const groupBy = (req.query.groupBy || 'division').toLowerCase();

  const season = new Date().getFullYear();
  const snap = await StandingsSnapshot.findOne({ season })
    .sort({ snapshotDate: -1, createdAt: -1, _id: -1 })
    .lean();

  if (!snap) return res.status(503).json({ error: 'No standings snapshot yet' });

  const enriched = (snap.teams || []).map(enrichRow);

  // IMPORTANT: compute GB for the requested grouping so FE gets numeric GB
  const withGB = calculateGamesBack(enriched, groupBy);

  res.json({
    season: snap.season,
    asOf: snap.snapshotDate,
    groupBy,
    teams: withGB, // each item includes numeric GB
  });
});

// GET /api/standings/wildcard
router.get('/wildcard', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const season = new Date().getFullYear();
  const snap = await StandingsSnapshot.findOne({ season })
    .sort({ snapshotDate: -1, createdAt: -1, _id: -1 })
    .lean();

  if (!snap) return res.status(503).json({ error: 'No standings snapshot yet' });

  const enriched = (snap.teams || []).map(enrichRow);

  // Use your same FE logic, ported to backend, to mark isDivisionLeader and WC GB.
  const wild = calculatedWildCard(enriched);

  res.json({
    season: snap.season,
    asOf: snap.snapshotDate,
    teams: wild,
  });
});

module.exports = router;