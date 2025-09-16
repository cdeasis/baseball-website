import { useEffect, useState } from 'react';
import { getStandings } from '../../api/standings';
import { leagueLogos } from "../../util/teamDefinitions";
import { StandingsTable } from "./StandingsTable";

export const OverallStandingsTable = ({ columns, groupBy, compact = false }) => {
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

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
                <img src={leagueLogos["MLB"]?.logo} alt="MLB Logo" className="w-6 h-6 object-contain" />
                <h3 className="text-xl font-bold">Major League Baseball</h3>
            </div>
            <StandingsTable data={teams} columns={columns} compact={compact}/>
        </div>
    )
}