import { expandedStandingsData } from "../util/expandedStandingsData";

const standings = expandedStandingsData();

export const getTeamRecord = (teamAbbr) => {
  const team = standings.find(t => t.abbreviation === teamAbbr);
  return team ? `${team.W}-${team.L}` : "-";
};