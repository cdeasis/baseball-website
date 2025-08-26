import { expandedStandingsData } from "../../util/expandedStandingsData";
import { leagueLogos } from "../../util/teamDefinitions";
import { StandingsTable } from "./StandingsTable";

export const LeagueStandingsTable = ({ columns, groupBy }) => {
    const data = expandedStandingsData(groupBy);

    // group by league only
    const grouped = {AL: [], NL: []};
    data.forEach((team) => {
        if (grouped[team.league]) grouped[team.league].push(team);
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {["AL", "NL"].map((league) => (
                <div key={league}>
                    <div className="flex items-center space-x-2 mb-4">
                        <img src={leagueLogos[league]?.logo} alt={`${league} logo`} className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{league === "AL" ? "American League" : "National League"}</h3>
                    </div>

                    <StandingsTable data={grouped[league]} columns={columns} />
                </div>
            ))}
        </div>
    );
}