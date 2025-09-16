export const StandingsTable = ({ data, columns, compact=false }) => {
    const dividerAfterCols = new Set (["GB", "DIFF", "AWAY", "NIGHT", "LHP", "XTRA"]);

    return (
        <div className={compact ? "overflow-x-auto" : ""}>
            <table className={`w-full border-collapse ${compact ? "table-fixed" : ""}`}>
                {compact && (
                    <colgroup>
                        <col className="w-[220px]" /> {/* TEAM */}
                        {columns.slice(1).map((_, i) => (
                        <col key={i} className="w-[68px]" />
                        ))}
                    </colgroup>
                )}
                <thead>
                    <tr className="border-b border-gray-300">
                        {columns.map((col) => (
                            <th key={col} className={`text-left ${compact ? "text-xs px-2 py-1 whitespace-nowrap" : "py-2 px-3"}`}>
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
                                        <td key={col} className={`py-2 px-3 ${compact ? "text-xs" : ""} whitespace-nowrap`}>
                                            <div className="flex items-center gap-2">
                                                <img src={team.logo} alt={`${team.name} logo`} className={compact ? "w-4 h-4 object-contain" : "w-5 h-5 object-contain"} />
                                                <span className={`font-bold ${compact ? "truncate max-w-[140px]" : ""}`}>{team.name}</span>
                                            </div>
                                        </td>
                                    );
                                }

                                if (col === "DIFF") {
                                    const diffValue = team[col]
                                    const color = diffValue > 0 ? "text-green-600" : diffValue < 0 ? "text-red-600": "text-gray-800";
                                    return (
                                        <td key={col} className={`${compact ? "text-xs px-2 py-1" : "py-2 px-3"} font-medium ${color} ${divider} whitespace-nowrap tabular-nums`}>
                                            {diffValue > 0 ? `+${diffValue}` : diffValue}
                                        </td>
                                    )
                                }

                                if (col === "EXWL") {
                                    const { wins, losses } = team[col];
                                    return (
                                        <td key={col} className={`${compact ? "text-xs px-2 py-1" : "py-2 px-3"} font-medium ${divider} whitespace-nowrap tabular-nums`}>
                                        {`${wins}-${losses}`}
                                        </td>
                                    );
                                }
                            
                                return (
                                    <td key={col} className={`${compact ? "text-xs px-2 py-1" : "py-2 px-3"} font-medium ${divider} whitespace-nowrap tabular-nums`}>
                                        {value}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}