import { getStandings } from "../api/standings";

let standingsPromise = null; // shared fetch promise
let standingsData = null; // last resolved payload

export async function loadStandingsOnce() {
    if (standingsData) return standingsData;
    if (!standingsData) standingsPromise = getStandings("overall");
    standingsData = await standingsPromise;
    return standingsData;
}

// non React helper for anywhere (ex: utility functions)
export async function getTeamRecordOnce(teamAbbr) {
    try {
        const { teams } = await loadStandingsOnce();
        const t = teams.find(x => x.abbreviation === teamAbbr);
        return t ? `${t.W}-${t.L}` : "-";
    } catch {
        return "-";
    }
}

// optional fast map for lots of lookups
export async function getStandingsMapOnce() {
    const { teams } = await loadStandingsOnce();
    const byAbbr = new Map();
    for (const t of teams) byAbbr.set(t.abbreviation, t);
    return byAbbr;
}