import { useEffect, useState } from 'react';
import { getStandings } from '../api/standings'; 
import { leagueLogos } from "../util/teamDefinitions";

export const StandingsCard = () => {
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let done = false;
        (async () => {
        try {
            const { teams } = await getStandings('division');
            const g = {};
            teams.forEach(team => {
            if (!g[team.league]) g[team.league] = {};
            if (!g[team.league][team.division]) g[team.league][team.division] = [];
            g[team.league][team.division].push(team);
            });
            if (!done) setGrouped(g);
        } finally {
            if (!done) setLoading(false);
        }
        })();
        return () => { done = true; };
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
    
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Standings</h2>

            {["AL", "NL"].map((league) => {
                const divisions = grouped[league];
                if (!divisions) return null;
            
            return (          
                <div key={league} className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <img src={leagueLogos[league]?.logo} alt={`${league} logo`} className="w-6 h-6 object-contain" />
                        <h3 className="font-semibold text-lg">
                            {leagueLogos[league]?.name || league}
                        </h3>
                    </div>

                    {["East", "Central", "West"].map((divisionName) => {
                            const divisionTeams = divisions[divisionName];
                            if (!divisionTeams) return null;

                            return (
                                <div key={divisionName} className="mb-4">
                                    <h4 className="font-semibold mb-1">{divisionName}</h4>
                                    <table className="text-sm w-full">
                                        <thead>
                                            <tr className="text-left border-b">
                                                <th>Team</th>
                                                <th>W</th>
                                                <th>L</th>
                                                <th>PCT</th>
                                                <th>GB</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {divisionTeams.map((team) => (
                                                <tr key={team.id}>
                                                    <td className="flex items-center space-x-2">
                                                        <img src={team.logo} alt={`${team.name} logo`} className="w-5 h-5 object-contain" />
                                                        <span>{team.abbreviation}</span>
                                                    </td>
                                                    <td>{team.W}</td>
                                                    <td>{team.L}</td>
                                                    <td>{team.PCT}</td>
                                                    <td>{team.GB === 0 ? "-" : team.GB.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}