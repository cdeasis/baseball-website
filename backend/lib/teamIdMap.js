const teams = require('./teamdefinitions');

const TEAM_ID_MAP = Object.fromEntries(
    Object.entries(teams)
        .filter(([, t]) => t.mlbId != null)
        .map(([code, t]) => [String(t.mlbId), code])
);

module.exports = { TEAM_ID_MAP, teams };