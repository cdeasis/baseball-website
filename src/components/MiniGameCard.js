import { useNavigate } from "react-router-dom";
import { getTodayDate } from "../util/dateHelper";
import { getTeamRecord } from "../util/getTeamRecord";
import { teams } from "../util/teamDefinitions";


export const MiniGameCard = ({ team1, team2, startTime, gameID, status = "Preview", inning = "", team1Score = null, team2Score = null, selected }) => {
    const navigate = useNavigate();
    const date = getTodayDate();

    const handleClick = () => {
        navigate(`/scores/${date}/${gameID}`);
    }

    const team1Data = teams[team1];
    const team2Data = teams[team2];

    const team1Record = getTeamRecord(team1);
    const team2Record = getTeamRecord(team2);

    const displayStatus = status === 'LIVE' ? inning : status.startsWith('F/') ? `F/${status.slice(2)}` : status.startsWith('F') ? 'F' : startTime;

    const isScored = status === 'LIVE' || status.startsWith('F');

    const statusStyle = status === 'LIVE' ? "text-red-600 font-bold" : status.startsWith('F') ? "text-black font-bold" : "text-gray-500";

    return (
        <div onClick={handleClick} className={`${isScored ? "min-w-[150px]" : "min-w-[140px]"} max-w-[220px] border p-2 rounded bg-white text-sm hover:shadow cursor-pointer transition ${selected ? "border-blue-500 ring-2 ring-blue-300" : ""}`}>
            <p className={`mt-0.25 mb-1 text-sm ${statusStyle}`}>{displayStatus}</p>

            {/* Away Team */}
            <div className ="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <img src={team1Data.logo} alt={team1Data.nickname[0]} className="w-5 h-5 object-contain" />
                    <span className="font-semibold">
                        {team1Data.abbreviation} ({team1Record})
                    </span>
                </div>
                {isScored && (
                    <span className="mr-1 font-bold">{team1Score}</span>
                )}
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                    <img src={team2Data.logo} alt={team2Data.nickname[0]} className="w-5 h-5 object-contain" />
                    <span className="font-semibold">
                        {team2Data.abbreviation} ({team2Record})
                    </span>
                </div>
                {isScored && (
                    <span className="mr-1 font-bold">{team2Score}</span>
                )}
            </div>
        </div>
    );
}