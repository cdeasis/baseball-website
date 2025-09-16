// basic calculated stats
function calculateWinPercentage(W, L) {
    return W + L === 0 ? 0 : (W / (W + L));
}

function calculateRunDifferential(rs, ra) {
    return rs - ra;
}

function calculatedExpectedWL(rs, ra, games, exponent = 1.83) {
    if (rs === 0 && ra === 0) return { w: 0, l: games};

    const expectedWinPct = Math.pow(rs, exponent) / (Math.pow(rs, exponent) + Math.pow(ra, exponent));
    const expectedWins = Math.round(expectedWinPct * games);
    const expectedLosses = games - expectedWins;

    return {
        wins: expectedWins,
        losses: expectedLosses,
    }
}

// games back calculations
// generalized gb for divsion/league/overall
function calculateGamesBack(teams, groupBy = "division") {
    const grouped = {};
    const results = [];

    teams.forEach(team => {
        const key = groupBy === "overall" ? "mlb" : groupBy === "league" ? team.league : `${team.league} ${team.division}`;

        if(!grouped[key]) grouped[key] = [];
        grouped[key].push(team);
    });

    for (const groupKey in grouped) {
        const teamsInGroup = grouped[groupKey];
        console.log("Group key:", groupKey, grouped[groupKey]);
        // sort by best record
        teamsInGroup.sort((a, b) => {
            const pctA = a.W / (a.W + a.L);
            const pctB = b.W / (b.W + b.L);
            if (pctB !== pctA) return pctB - pctA;
            return b.W - a.W;
        });

        const leader = teamsInGroup[0];

        results.push(...teamsInGroup.map(team => {
            const gb = ((leader.W - team.W) + (team.L - leader.L)) / 2;
            return {
                ...team,
                GB: team.id === leader.id ? 0 : Number(gb.toFixed(1)),
            };
        }));
    };
    return results;
}

function calculatedWildCard(teams) {
    const leagueGroups = { AL: [], NL: [] };

    // group by league
    teams.forEach(team => {
        if (!leagueGroups[team.league]) leagueGroups[team.league] = [];
        leagueGroups[team.league].push(team);
    });

    const results = [];

    for (const league in leagueGroups) {
        const leagueTeams = leagueGroups[league];

        // find divsion leaders
        const divisions ={};
        leagueTeams.forEach(team => {
            if (!divisions[team.division]) divisions[team.division] = [];
            divisions[team.division].push(team);
        });

        const divisionLeaders = Object.values(divisions).map(divTeams => {
            return divTeams.sort((a, b) => {
                const pctA = a.W / (a.W + a.L);
                const pctB = b.W / (b.W + b.L);
                if (pctB !== pctA) return pctB - pctA;
                return b.W - a.W;
            })[0];
        });

        divisionLeaders.sort((a, b) => {
                const pctA = a.W / (a.W + a.L);
                const pctB = b.W / (b.W + b.L);
                if (pctB !== pctA) return pctB - pctA;
                return b.W - a.W;
        })

        const divisionLeaderIDs = new Set(divisionLeaders.map(t => t.id));

        // filter out division leaders
        const wildcardContenders = leagueTeams.filter(team=> !divisionLeaderIDs.has(team.id));

        // sort contenders
        wildcardContenders.sort((a, b) => {
            const pctA = a.W / (a.W + a.L);
            const pctB = b.W / (b.W + b.L);
            if (pctB !== pctA) return pctB - pctA;
            return b.W - a.W;
        });

        // for wildcard teams, compare by the 3rd team
        const wildcardThree = wildcardContenders[2];

        results.push(
            ...divisionLeaders.map(team => ({ ...team, GB: 0, isDivisionLeader: true})),
            ...wildcardContenders.map(team => {
                const rawGB = ((wildcardThree.W - wildcardThree.L) - (team.W - team.L)) / 2;
                return {
                    ...team,
                    GB: team.id === wildcardThree.id ? 0 : Number(rawGB.toFixed(1)),
                    isDivisionLeader: false
                }
            })
        );
    }
    return results;
}

module.exports = {
    calculateWinPercentage,
    calculateRunDifferential,
    calculatedExpectedWL,
    calculateGamesBack,
    calculatedWildCard,
};