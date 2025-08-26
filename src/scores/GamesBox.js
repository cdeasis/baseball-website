import { getTeamRecord } from '../util/getTeamRecord';
import { teams } from '../util/teamDefinitions';
import { Link } from 'react-router-dom';
import { getTodayDate } from '../util/dateHelper';

export const GamesBox = ({ game }) => {
    const away = teams[game.awayTeam];
    const home = teams[game.homeTeam];
    const awayRecord = getTeamRecord(game.awayTeam);
    const homeRecord = getTeamRecord(game.homeTeam);
    const isFinal = game.status?.startsWith('F');
    const isLive = game.status === 'LIVE';
    const isPreview = game.status === 'Preview';

    const today = getTodayDate();

    return (
        <Link to={`/scores/${game.date}/${game.id}`} className="block h-full">
            <div className="relative group h-full">
                <div className="bg-white p-4 rounded-lg border border-gray-500 shadow-sm transition-all duration-300 ease-in-out transform group-hover:scale-105 group-hover:shadow-lg group-hover:z-10">

                    {/*Header: Time / Status */}
                    <p className="text-base font-medium text-gray-500 mb-1 text-center">
                        {isPreview && <span className="font-semibold text-gray-500">{game.time}</span>}
                        {isLive && <span className="font-semibold text-red-600">LIVE - {game.inning}</span>}
                        {isFinal && <span className="font-semibold text-black">{game.status.startsWith('F/') ? `F/${game.status.slice(2)}` : 'F'}</span>}
                    </p>

                    {/* Teams + (Score for live aand final) */}
                    <div className="mb-2">
                        {[{team: away, record: awayRecord, score: game.score?.away}, {team: home, record: homeRecord, score:game.score?.home}].map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                    <img src={entry.team.logo} alt={entry.team.nickname[0]} className="w-5 h-5 object contain" />
                                    <p className="text-lg font-semibold">{entry.team.abbreviation} ({entry.record})</p>
                                </div>
                                {(isLive || isFinal) && (
                                    <span className="text-lg font-bold text-gray-800">{entry.score}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Hover Box */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2">
                        {!isFinal && (
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Watch on:</span> {(game.networks?.length ? game.networks : [teams[game.awayTeam].network, teams[game.homeTeam].network]).join(", ")}
                            </p>
                        )}
                        <p className="text-sm text-gray-700">
                            {game.betting.spread} vs. {game.betting.moneyline} {game.betting.overUnder}
                        </p>
                    </div>

                    {/* Stadium */}
                    <p className="text-sm text-gray-600 mb-2">
                        {home.stadium}, {home.city}, {home.state}
                    </p>

                    <hr className="my-2 border-gray-300" />

                    {/* Preview */}
                    {isPreview && (
                        <>
                            <div className="flex justify-between items-center mb-1">
                                <img src={game.pitchers.away.face} alt={game.pitchers.away.lastName} className="w-10 h-10 rounded-full object-cover" />
                                <img src={game.pitchers.home.face} alt={game.pitchers.home.lastName} className="w-10 h-10 rounded-full object-cover" />
                            </div>
                            <div className="flex justify-between text-base text-gray-800 ml-1">
                                <span>{game.pitchers.away.lastName}</span>
                                <span>{game.pitchers.home.lastName}</span>
                            </div>
                            <div className="flex justify-between text-baase text-gray-500">
                                <span>{game.pitchers.away.record} | {game.pitchers.away.era} ERA</span>
                                <span>{game.pitchers.home.record} | {game.pitchers.home.era} ERA</span>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                <button className="text-sm text-blue-600 hover:underline">Preview</button>
                            </div>
                        </>
                    )}

                    {/* LIVE */}
                    {isLive && (
                        <>
                            <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs">
                                Baserunner Diamond
                            </div>
                            <div className="w-24 h-6 mx-auto mb-2 bg-gray-100 border border-gray-300 flex items-center justify-center text-xs">
                                Outs Indicator
                            </div>

                            <p className="text-sm text-center text-gray-800 mb-1">
                                <strong>At Bat:</strong> {game.atBat} ({game.atBatToday})
                            </p>
                            <p className="text-sm text-center text-gray-900 mb-1">
                                <strong>Count:</strong> {game.count}
                            </p>
                            <p className="text-sm text-center text-gray-600 mb-1">
                                <strong>Pitching:</strong> {game.currentPitcher}
                            </p>
                            {game.runnersOn?.length > 0 ? (
                                <p className="text-sm text-center text-gray-500">
                                    <strong>Runners:</strong> {game.runnersOn.map(r => `${r.runner} (${r.base})`).join(', ')}
                                </p>
                            ) : (
                                <p className="text-sm text-center text-gray-400">Bases Empty</p>
                            )}
                            <div className="flex justify-center gap-4 mt-2">
                                <button className="text-sm text-blue-600 hover:underline">Gameday</button>
                            </div>
                        </>
                    )}

                    {/* FINAL */}
                    {isFinal && (
                        <>
                            <p className="text-sm text-center text-gray-700 mb-1">
                                Final Score: {game.awayTeam} {game.score.away}, {game.homeTeam} {game.score.home}
                            </p>
                            <p className="text-xs text-center text-gray-500">
                                W: {game.winningPitcher} | L: {game.losingPitcher}
                                {game.savePitcher && ` | S: ${game.savePitcher}`}
                            </p>
                            <div className="flex justify-center gap-4 mt-2">
                                <button className="text-sm text-blue-600 hover:underline">Recap</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}