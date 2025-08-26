import { useState } from 'react';
import { pitcherStats } from '../../components/PitcherStats';
import { hitterStats } from '../../components/HitterStats';
import { PitcherVsHitter } from '../../components/PitcherVsHitter';
import { teams } from '../../util/teamDefinitions';

const getDummyLineup = () => {
    const starters = hitterStats.slice(0, 9);
    const bench = hitterStats.slice(9, 12);
    return { starters, bench }
}

export const PreviewGameView = ({ game }) => {
    const [view, setView] = useState('lineups');

    const awayPitcher = pitcherStats.find(p => p.firstName === game.pitchers.away.firstName && p.lastName === game.pitchers.away.lastName);

    const homePitcher = pitcherStats.find(p => p.firstName === game.pitchers.home.firstName && p.lastName === game.pitchers.home.lastName);

    const away = teams[game.awayTeam];
    const home = teams[game.homeTeam];

    const getMatchupStats = (hitter, pitcher) => {
        const match = PitcherVsHitter.find (
            match =>
                match.firstName === pitcher.firstName &&
                match.lastName === pitcher.lastName
            );
        if (!match) return {
            ab: null, h: null, hr: null, rbi: null, bb: null, k: null, avg: null, ops: null
        };
        const hitterMatch = match.hitters.find(
            h => h.firstName === hitter.firstName && h.lastName === hitter.lastName
        );

        return hitterMatch ?? {
            ab: null, h: null, hr: null, rbi: null, bb: null, k: null, avg: null, ops: null
        };
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
            {/* Game Info Block */}
            <div className="text-center space-y-1">
                <div className="flex justify-center items-center gap-4 text-3xl font-bold">
                    <span>{game.awayTeam}</span>
                    <img src={away.logo} alt={away.nickname[0]} className="w-12 h-12" />
                    <span>{game.time}</span>
                    <img src={home.logo} alt={home.nickname[0]} className="w-12 h-12" />
                    <span>{game.homeTeam}</span>
                </div>
                <div className="text-gray-500 text-sm">{game.date}</div>
            </div>

            < hr />

            {/* Newtork + Betting Block */}
            <div className="space-y-2 text-sm">
                <h2 className="text-lg font-bold">Networks and Betting Info:</h2>
                <div>
                    <span className="text-base font-semibold">Watch On:</span>
                    <ul className="list-disc list-inside">
                        <li>{teams[game.awayTeam]?.network}</li>
                        <li>{teams[game.homeTeam]?.network}</li>
                    </ul>
                </div>
                <div>
                    <span className="text-base font-semibold">Game Lines:</span>
                    <div>Spread: {game.betting.spread} </div>
                    <div>MoneyLine: {game.betting.moneyline}</div>
                    <div>Over/Under: {game.betting.overUnder}</div>
                </div>
            </div>

            <hr />

            {/* Pitching Matchup Block */}
            <div>
                <h2 className="text-lg font-bold">Probable Pitchers</h2>
                <div className="grid grid-cols-2 gap-4 items-center text-center text-lg font-semibold">
                    <div>
                        <img src={game.pitchers.away.face} className="w-60 h-36 mx-auto" />
                        <div>{game.pitchers.away.firstName} {game.pitchers.away.lastName}</div>
                        <div>{game.pitchers.away.record} | {game.pitchers.away.era}</div>
                    </div>
                    <div>
                        <img src={game.pitchers.home.face} className="w-60 h-36 mx-auto" />
                        <div>{game.pitchers.home.firstName} {game.pitchers.home.lastName}</div>
                        <div>{game.pitchers.home.record} | {game.pitchers.away.era}</div>
                    </div>
                </div>
            </div>
            <hr />

            {/* Pitching Mini Table */}
            <h2 className="text-lg font-semibold">Pitching Stats</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                {[awayPitcher, homePitcher].map((p, i) => (
                    <table key={i} className="w-full text-center border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th>W-L</th>
                                <th>ERA</th>
                                <th>WHIP</th>
                                <th>H</th>
                                <th>K</th>
                                <th>BB</th>
                                <th>HR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{p.w}-{p.l}</td>
                                <td>{p.era}</td>
                                <td>{p.whip}</td>
                                <td>{p.h}</td>
                                <td>{p.so}</td>
                                <td>{p.bb}</td>
                                <td>{p.hr}</td>
                            </tr>
                        </tbody>
                    </table>
                ))}
            </div>

            <hr />

            {/* Toggle Tabs */}
            <div className="flex justify-center gap-4 text-sm sm:text-base font-semibold">
                <button className={`px-4 py-2 rounded-full transition ${view=== 'lineups' ? 'bg-blue-200 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setView('lineups')}>
                    Lineups
                </button>
                <button className={`px-4 py-2 rounded-full transition ${view=== 'matchups' ? 'bg-blue-200 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setView('matchups')}>
                    Matchups
                </button>
            </div>
            
            {/* Lineups */}
            {view === 'lineups' && (
                <div className="space-y-6">
                    {[{ team: game.homeTeam }, { team: game.awayTeam }].map(({ team }, i) => {
                    const { starters } = getDummyLineup();
                        return (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-center mb-2">{team} Lineup</h3>
                                <table className="w-full text-sm text-center border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th>Player</th>
                                            <th>POS</th>
                                            <th>AVG</th>
                                            <th>H</th>
                                            <th>AB</th>
                                            <th>HR</th>
                                            <th>RBI</th>
                                            <th>OPS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {starters.map(player => (
                                            <tr key={`${player.firstName}-${player.lastName}`} className="border-t">
                                                <td>{player.firstName} {player.lastName}</td>
                                                <td>{player.pos}</td>
                                                <td>{player.avg}</td>
                                                <td>{player.h}</td>
                                                <td>{player.ab}</td>
                                                <td>{player.hr}</td>
                                                <td>{player.rbi}</td>
                                                <td>{player.ops}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Matchups */}
            {view === 'matchups' && (
                <div className="space-y-6">
                    {[{ team: game.homeTeam, pitcher: awayPitcher }, { team: game.awayTeam, pitcher: homePitcher }].map(({ team, pitcher }, i) => {
                        const { starters, bench } = getDummyLineup();
                        const hitters = [...starters, ...bench]
                        return (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-center mb-2">{team} vs {pitcher.lastName}</h3>
                                <table className="w-full text-sm text-center border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th>Player</th>
                                            <th>H</th>
                                            <th>AB</th>
                                            <th>HR</th>
                                            <th>RBI</th>
                                            <th>AVG</th>
                                            <th>OPS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hitters.map(hitter => {
                                            const stats = getMatchupStats(hitter, pitcher);
                                            return (
                                                <tr key={`${hitter.firstName}-${hitter.lastName}`} className="border-t">
                                                    <td>{hitter.lastName} - {hitter.pos}</td>
                                                    <td>{stats.h ?? '-'}</td>
                                                    <td>{stats.ab ?? '-'}</td>
                                                    <td>{stats.hr ?? '-'}</td>
                                                    <td>{stats.rbi ?? '-'}</td>
                                                    <td>{stats.avg ?? '-'}</td>
                                                    <td>{stats.ops ?? '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}