export const StandingsTable = ({ data, columns}) => {
    const dividerAfterCols = new Set (["GB", "DIFF", "AWAY", "NIGHT", "LHP", "XTRA"]);

    return (
        <table className="w-full text-sm border-collapse">
            <thead>
                <tr className="border-b border-gray-300">
                    {columns.map((col) => (
                        <th key={col} className="text-left py-2 px-3">
                            {col.toUpperCase()}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((team) => (
                    <tr key={team.id} className="border-b border-gray-200">
                        {columns.map((col) => {
                            let value = team[col];
                            if (col === "GB") {
                                value = value === 0 ? "-" : value.toFixed(1);
                            }
                            const divider = dividerAfterCols.has(col) ? "border-r border-gray-300" : "";

                            if (col.toLowerCase() === "team") {
                                return (
                                    <td key={col} className="flex items-center space-x-2 py-2 px-3">
                                        <img src={team.logo} alt={`${team.name} logo`} className="w-5 h-5 object-contain" />
                                        <span className="font-bold">{team.name}</span>
                                    </td>
                                );
                            }

                            if (col === "DIFF") {
                                const diffValue = team[col]
                                const color = diffValue > 0 ? "text-green-600" : diffValue < 0 ? "text-red-600": "text-gray-800";
                                return (
                                    <td key={col} className={`py-2 px-3 font-medium ${color} ${divider}`}>
                                        {diffValue > 0 ? `+${diffValue}` : diffValue}
                                    </td>
                                )
                            }

                            if (col === "EXWL") {
                                const { wins, losses } = team[col];
                                return (
                                    <td key={col} className={`py-2 px-3 font-medium ${divider}`}>
                                    {`${wins}-${losses}`}
                                    </td>
                                );
                            }
                          
                            return (
                                <td key={col} className={`py-2 px-3 font-medium ${divider}`}>
                                    {value}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}