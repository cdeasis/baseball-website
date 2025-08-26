import { expandedStandingsData } from "../../util/expandedStandingsData";
import { leagueLogos } from "../../util/teamDefinitions";
import { StandingsTable } from "./StandingsTable";

export const OverallStandingsTable = ({ columns, groupBy }) => {
    const data = expandedStandingsData(groupBy);
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
                <img src={leagueLogos["MLB"]?.logo} alt="MLB Logo" className="w-6 h-6 object-contain" />
                <h3 className="text-xl font-bold">Major League Baseball</h3>
            </div>
            <StandingsTable data={data} columns={columns} />
        </div>
    )
}