import { expandedStandingsData } from "../util/expandedStandingsData";
import { calculatedWildCard } from "../util/calculateStandingsStats";
import { leagueLogos } from "../util/teamDefinitions";
import { WildCardTable } from "../components/standingsTables/WildcardTable";

export const WildCardView = () => {
    const data = calculatedWildCard(expandedStandingsData());

    const alTeams = data.filter(t => t.league === "AL");
    const nlTeams = data.filter(t => t.league === "NL");

    const columns = ["team", "W", "L", "PCT", "GB", "RS", "RA", "DIFF", "STRK", "L10"];

    const renderSelection = (leagueName, teamsInLeague, leagueKey) => {
        const divisionLeaders = teamsInLeague.filter(t => t.isDivisionLeader);
        const wildCardContenders = teamsInLeague.filter(t => !t.isDivisionLeader);

        return (
            <div className="mb-12">
                <div className="flex items-center space-x-2 mb-2">
                    <img src={leagueLogos[leagueKey]?.logo} alt={`${leagueKey} Logo`} className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">{leagueName}</h3>
                </div>
                
                <WildCardTable data={divisionLeaders} columns={columns} showDivisionLetter />
                <hr className="my-1 border-gray-400" />
                <hr className="mb-2 border-gray-400" />
                <WildCardTable data={wildCardContenders} columns={columns} />
            </div>
        );
    };
    return (
        <div className="max-w-5xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6">Wild Card Standings</h2>
            {renderSelection("American League", alTeams, "AL")}
            {renderSelection("National League", nlTeams, "NL")}
        </div>
    );
}