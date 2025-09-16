import { useEffect, useState } from 'react';
import { getStandings } from '../../api/standings';
import { leagueLogos } from "../../util/teamDefinitions";
import { StandingsTable } from "./StandingsTable";

export const LeagueStandingsTable = ({ columns, groupBy, compact = false }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let done = false;
        (async () => {
            try {
                const { teams } = await getStandings(groupBy);
                if (!done) setTeams(teams);
            } finally {
                if (!done) setLoading(false);
            }
        })();
        return () => { done = true; };
    }, [groupBy]);

    if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

    // group by league only
    const grouped = {AL: [], NL: []};
    teams.forEach((team) => {
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

                    <StandingsTable data={grouped[league]} columns={columns} compact={compact}/>
                </div>
            ))}
        </div>
    );
}