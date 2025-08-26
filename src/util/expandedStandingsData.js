import { standingsData } from "../data/StandingsData";
import { teams } from "./teamDefinitions";
import { calculateWinPercentage, calculateRunDifferential, calculateGamesBack,calculatedExpectedWL } from "./calculateStandingsStats";

export const expandedStandingsData = (groupBy = "division") => {
    const enriched = standingsData.map((team) => {
        const meta = teams[team.id];

        if (!meta) {
            console.warn(`No team metadata found for ID: ${team.id}`, meta);
            return team;
        }

        const gamesPlayed = team.W + team.L;
        const exwl = calculatedExpectedWL(team.RS, team.RA, gamesPlayed);

        return {
            ...team,
            ...meta,
            division: meta.division,
            PCT: calculateWinPercentage(team.W, team.L).toFixed(3).replace(/^0/, ''),
            DIFF: calculateRunDifferential(team.RS, team.RA),
            EXWL: exwl,
        };
    });
    const withGamesBack = calculateGamesBack(enriched, groupBy);
    return withGamesBack;
}