import { useEffect, useState } from "react";
import { getWildCardStandings } from "../api/standings";
import { leagueLogos } from "../util/teamDefinitions";
import { WildCardTable } from "../components/standingsTables/WildcardTable";

export const WildCardView = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let done = false;
        (async () => {
            try {
                const { teams } = await getWildCardStandings();
                if (!done) setTeams(teams);
            } finally {
                if (!done) setLoading(false);
            }
        })();
        return () => { done = true; };
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

    const alTeams = teams.filter(t => t.league === "AL");
    const nlTeams = teams.filter(t => t.league === "NL");

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