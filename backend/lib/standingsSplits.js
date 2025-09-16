// turn {wins, losses} into "W-L"
function wlSummary(w = 0, l = 0) {
    return `${w} - ${l}`;
}

// trim leading 0 from win PCT
function pctTrim(pct) {
    if (!pct) return '';
    return String(pct).replace(/0(?=\.)/, '');
}

// --- split records ---
function indexSplitRecords(splitRecords = []) {
    const idx = Object.create(null);
    for (const r of splitRecords) {
        if (!r?.type) continue;
        idx[r.type] = r;
    }
    return idx;
}

// map StatsApi split "type" with FE field names
const SPLIT_MAP = {
    home: 'HOME',
    away: 'AWAY',
    day: 'DAY',
    night: 'NIGHT',
    lastTen: 'L10',
    oneRun: '1-RUN',
    extraInning: 'XTRA',
    right: 'RHP',
    left: 'LHP',
    grass: 'GRASS',
    turf: 'TURF',
    interleague: 'INTR',
};

// take splitRecords[] and return summaries keyed by field names
function mapSplitSummaries(splitRecords = []) {
    const idx = indexSplitRecords(splitRecords);
    const out = {};
    for (const [type, field] of Object.entries(SPLIT_MAP)) {
        const rec = idx[type];
        if (rec) out[field] = wlSummary(rec.wins, rec.losses);
    }
    return out;
}

// --- divisionRecords ---
function mapDivisionSummaries(divisionRecords = []) {
    const out = {};
    for (const rec of divisionRecords) {
        const name = rec?.division?.name || '';
        if (!name) continue;
        if (name.includes('East')) out.EAST = wlSummary(rec.wins, rec.losses);
        else if (name.includes('Central')) out.CENT = wlSummary(rec.wins, rec.losses);
        else if (name.includes('West')) out.WEST = wlSummary(rec.wins, rec.losses);
    }
    return out;
}

// --- leagueRecords ---
function mapInterleagueFromLeagues(leagueRecords = [], teamLeague) {
    if (!teamLeague) return '';
    const oppId = teamLeague === 'AL' ? 104 : 103;
    const rec = leagueRecords.find(lr => lr?.league?.id === oppId);
    return rec ? wlSummary(rec.wins, rec.losses) : '';
}

// helper to produce all summaries FE care sabout from one teamRecord
function buildAllSplits(tr, teamLeague) {
    const splits = mapSplitSummaries(tr?.records?.splitRecords || []);
    const divs = mapDivisionSummaries(tr?.records?.divisionRecords || []);

    if (!splits.INTR) {
        const derived = mapInterleagueFromLeagues(tr?.records?.leagueRecords || [], teamLeague);
        if (derived) splits.INTR = derived;
    }

    return {
        ...splits,
        ...divs,
    }
}

module.exports = {
    wlSummary,
    pctTrim,
    mapSplitSummaries,
    mapDivisionSummaries,
    mapInterleagueFromLeagues,
    buildAllSplits,
};