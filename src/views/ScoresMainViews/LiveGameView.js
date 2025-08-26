import React from "react";
import { teams } from "../../util/teamDefinitions";
import { hitterStats } from "../../components/HitterStats";

const getDummyLineup = () => {
    const starters = hitterStats.slice(0,9);
    return { starters }
}

const mergeLineupWithGameStats = (starters, hittingSummary) => {
    return starters.map(hitter => {
        const fullName = `${hitter.firstName} ${hitter.lastName}`;
        const summary = hittingSummary.find(p => p.player === fullName);

        return {
            ...hitter,
            gameLine: summary ? summary.result : 'N/A',
        };
    });
}

const getPinchPlayMap = (pinchPlays) => {
    const map = {};
    const footnotes = [];
    let footnoteCharCode = 97;

    pinchPlays.forEach((play, index) => {
        const letter = String.fromCharCode(footnoteCharCode + index);
        map[play.for] = map[play.for] || [];
        map[play.for].push({
            ...play,
            letter
        });

        const action = play.type === 'PR' ? 'Ran for' : 'Hit for';
        footnotes.push(`${letter} - ${action} ${play.for} in the 8th`)
    });

    return { map, footnotes};
}

export const LiveGameView = ({ game }) => {
    const away = teams[game.awayTeam];
    const home = teams[game.homeTeam];

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
            {/* Score Block */}
            <div className="text-center space-y-1">
                <div className="flex justify-center items-center gap-4 text-3xl font-bold">
                    <span>{game.awayTeam}</span>
                    <img src={away.logo} alt={away.abbreviation} className="w-12 h-12" />
                    <span>{game.linescore.away.R}</span>
                    <span className="text-2xl"> {game.status} - {game.inning} </span>
                    <span>{game.linescore.home.R}</span>
                    <img src={home.logo} alt={home.abbreviation} className="w-12 h-12" />
                    <span>{game.homeTeam}</span>
                </div>
            </div>

            <hr />

            {/* Inning Recap */}
            <div>
                <table className="w-full text-center text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            {['', ...game.linescore.innings.map((_,i) => i + 1), 'R', 'H', 'E'].map((label, i) => ( 
                                <th key={i}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {['away', 'home'].map((team,  i) => (
                            <tr key={i}>
                            <td className="font-bold">{team === 'away' ? game.awayTeam : game.homeTeam}</td>
                            {game.linescore.innings.map((inning, j) => (
                                <td key={j}>
                                    {inning[team] != null && inning[team] !== undefined ? inning[team] : '-'}
                                    </td>
                            ))}
                            <td>{game.linescore[team].R}</td>
                            <td>{game.linescore[team].H}</td>
                            <td>{game.linescore[team].E}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <hr />

            {/* Play-by-Play Block */}
            <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">

                    {/* Left Column */}
                    <div className="space-y-2 w-1/2">
                        <p><strong>At Bat:</strong> {game.atBat} <span className="text-gray-500">({game.atBatToday})</span></p>
                        <p><strong>Count:</strong> {game.count}</p>
                        <p><strong>Pitching:</strong> {game.currentPitcher}</p>
                        {/* Runners Diamond Placeholder */}
                        <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs">
                            Runners Diamond
                        </div>
                        <div className="w-24 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs">
                            Outs Indicator
                        </div>
                        {/* Runners on Base Names */}
                        <p>
                            <strong>On Base:</strong>{" "}
                            {game.runnersOn.length > 0 ? game.runnersOn.map(r => `${r.runner} (${r.base})`).join(', ') : "None"}
                        </p>
                        <p><strong>On Deck:</strong> {game.onDeck} <span className="text-gray-500">({game.onDeckToday})</span></p>
                        <p><strong>In the Hole:</strong> {game.inHole} <span className="text-gray-500">({game.inHoleToday})</span></p>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/2 flex items-center justify center">
                        <div className="w-32 h-40 border border-gray-400 rounded bg-white flex items-center justify-center text-xs text-gray-500">
                            Strike Zone Grid
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    <button className="text-sm text-blue-600 hover:underline">Full Play-by-Play</button>
                </div>
            </div>
                
            {/* Lineups */}
            <div className="space-y-6">
                {[{ team: game.homeTeam }, { team: game.awayTeam }].map(({ team }, i) => {
                    const { starters } = getDummyLineup();
                    const mergedLineup = mergeLineupWithGameStats(starters, game.hittingSummary);
                    const { map: pinchMap, footnotes} = getPinchPlayMap(game.pinchPlays ?? []);

                    return (
                        <div key={i}>
                            <h3 className="text-center text-lg font-bold">{team} Lineup</h3>
                            <table className="w-full text-xs text-center border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th>Player</th>
                                        <th>POS</th>
                                        <th>Game Line</th>
                                        <th>AVG</th>
                                        <th>OPS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mergedLineup.map((player, index) => {
                                        const fullName = `${player.firstName} ${player.lastName}`;
                                        const subIns = pinchMap[fullName] || [];

                                        return (
                                            <React.Fragment key={fullName}>
                                                <tr className="border-t">
                                                    <td>{fullName}</td>
                                                    <td>{player.pos}</td>
                                                    <td>{player.gameLine}</td>
                                                    <td>{player.avg ?? '-'}</td>
                                                    <td>{player.ops ?? '-'}</td>
                                                </tr>

                                                {subIns.map((sub, j) => {
                                                    const subLine = game.hittingSummary.find(p => p.player === sub.player)?.result ?? '-';
                                                    return (
                                                        <tr key={`${sub.player}-${j}`} className="border-t text-sm text-gray-600 italic">
                                                            <td className="pl-4">
                                                                ({sub.letter}) {sub.player} ({sub.type})
                                                            </td>
                                                            <td>-</td>
                                                            <td>{subLine}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {footnotes.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500 spaace-y-1">
                                    {footnotes.map(note => (
                                        <p key={note}>{note}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}