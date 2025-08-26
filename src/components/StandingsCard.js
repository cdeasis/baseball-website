import { expandedStandingsData } from "../util/expandedStandingsData";
import { leagueLogos, teams } from "../util/teamDefinitions";

// group flat array into league/division before rendering
const groupByLeagueAndDivision = (teams) => {
    const grouped = {};

    teams.forEach(team => {
        if (!grouped[team.league]) {
            grouped[team.league] = {};
        }
        if (!grouped[team.league][team.division]) {
            grouped[team.league][team.division] = [];
        }
        grouped[team.league][team.division].push(team);
    });

    return grouped;
}

export const StandingsCard = () => {
    const grouped = groupByLeagueAndDivision(expandedStandingsData("division"));

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