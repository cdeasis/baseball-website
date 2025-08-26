import { teams } from "../../util/teamDefinitions";

export const WildCardTable = ({ data, columns, showDivisionLetter = false}) => {
    const dividerAfterCols = new Set(["GB", "DIFF"]);

    return (
        <table className="w-full text-sm border-collapse">
            <thead>
                <tr className="border-b border-gray-300">
                    {columns.map(col => (
                        <th key={col} className="text-left py-2 px-3">
                            {col.toUpperCase()}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map(team => (
                    <tr key={team.id} className="border-b border-gray-200">
                        {columns.map(col => {
                            let value = team[col];
                            if (col === "GB") {
                                if (value === 0)  {
                                    value = "-";
                                } else if (value < 0) {
                                    value = `+${Math.abs(value).toFixed(1)}`;
                                } else {
                                    value = value.toFixed(1);
                                }
                            }
                            const divider = dividerAfterCols.has(col) ? "border-r border-gray-300" : "";

                            if (col.toLowerCase() === "team") {
                                const teamMeta = teams[team.id];
                                const divLetter = showDivisionLetter ? ` - ${team.division.charAt(0)}` : "";
                                return (
                                    <td key={col} className="flex items-center space-x-2 py-2 px-3 font-medium">
                                        <img src={teamMeta.logo} alt={`${teamMeta.name} logo`} className="w-5 h-5 object-contain"/>
                                        <span>{teamMeta.name}{divLetter}</span>
                                    </td>
                                );
                            }

                            if (col === "DIFF") {
                                const diffValue = team[col];
                                const color = diffValue > 0 ? "text-green-600" : diffValue < 0 ?"text-red-600" : "text-gray-800";
                                return (
                                    <td key={col} className={`py-2 px-3 font-medium ${color} ${divider}`}>
                                        {diffValue > 0 ? `+${diffValue}` : diffValue}
                                    </td>
                                );
                            }

                            return (
                                <td key={col} className={`py-2 px-3 font-medium ${divider}`}>
                                    {value}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}