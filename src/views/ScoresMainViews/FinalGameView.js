import { teams } from "../../util/teamDefinitions";
import { useState } from "react";
import { hitterStats } from "../../components/HitterStats";
import React from "react";

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

export const FinalGameView = ({ game }) => {
    const [view, setView] = useState('recap');

    const away = teams[game.awayTeam];
    const home = teams[game.homeTeam];

    return (
        <div className="max-w-4xl mx-auto px-4 space-y-8">

            {/* Score Block */}
            <div className="text-center space-y-1">
                <div className="flex justify-center items-center gap-4 text-3xl font-bold">
                    <span>{game.awayTeam}</span>
                    <img src={away.logo} alt={away.abbreviation} className="w-12 h-12" />
                    <span>{game.linescore.away.R}</span>            
                    <span className="text-2xl">
                        {game.status.startsWith('F/') ? `FINAL/${game.status.slice(2)}` : 'FINAL'}
                    </span>
                    <span>{game.linescore.home.R}</span>
                    <img src={home.logo} alt={home.abbreviation} className="w-12 h-12" />
                    <span>{game.homeTeam}</span>
                </div>
                <div className="flex justify-center items-center gap-4 text-base font-semibold">
                    <span>W: {game.winningPitcher}</span>
                    <span>L: {game.losingPitcher}</span>
                    {game.savePitcher && <span>S: {game.savePitcher}</span>}
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
                                    <td key={j}>{inning[team] != null && inning[team] !== undefined ? inning[team] : '-'}
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

            {/* Toggle Recap | Box */}
            <div>
                <div className="flex justify-center gap-4 text-sm sm:text-base font-semibold mb-4">
                    <button className={`px-4 py-2 rounded-full transition ${view === 'recap' ? 'bg-blue-200 text-blue-800' : 'text-gray-800 hover:bg-gray-100'}`} onClick={() => setView('recap')}>Recap</button>
                    <button className={`px-4 py-2 rounded-full transition ${view === 'box' ? 'bg-blue-200 text-blue-800' : 'text-gray-800 hover:bg-gray-100'}`} onClick={() => setView('box')}>Box</button>
                </div>
                
                {/* Recap */}
                {view === 'recap' && (
                    <div className="text-base text-gray-700 bg-gray-50 p-4 rounded border">
                        {game.recap}
                    </div>
                )}

                {/* Box */}
                {view === 'box' && (
                    <div className='space-y-6'>
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
                                                                <tr key={`${sub.player}-${j}`} className="border-t text-xs text-gray-600 italic">
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
                )}
            </div>
        </div>
    )
}