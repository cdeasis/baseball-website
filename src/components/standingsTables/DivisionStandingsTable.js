import { useEffect, useState } from 'react';
import { getStandings } from '../../api/standings';
import { leagueLogos } from "../../util/teamDefinitions";
import { StandingsTable } from "./StandingsTable";

export const DivisionStandingsTable = ({ columns, groupBy, compact = false }) => {
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

    // group by league and division
    const grouped = {};
    teams.forEach((team) => {
        const key = `${team.league}-${team.division}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(team);
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {["AL", "NL"].map((league) => (
                <div key={league}>
                    <div className="flex items-center space-x-2 mb-4">
                        <img src={leagueLogos[league]?.logo} alt={`${league} logo`} className="w-6 h-6"/>
                        <h3 className="text-2xl font-bold">{league === "AL" ? "American League" : "National League"}</h3>
                    </div>

                    {["East", "Central", "West"].map((division) => {
                        const key = `${league}-${division}`;
                        const teams = grouped[key];
                        if (!teams) return null;

                        return (
                            <div key={division} className="mb-8">
                                <h4 className="text-xl font-bold mb-2 text-gray-800">{division}</h4>
                                <StandingsTable data={teams} columns={columns} compact={compact}/>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    )
}