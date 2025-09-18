import { useNavigate } from "react-router-dom";
import { getYesterdayDate } from "../util/dateHelper";
import { teams } from "../util/teamDefinitions";
import { useTeamRecord } from "../hooks/useTeamRecord";

export const RecapGameCard = ({ team1, team2, score, gameID, blurb, pitchers, status }) => {
    const navigate = useNavigate();
    const date = getYesterdayDate();

    const handleClick = () => {
        navigate(`/scores/${date}/${gameID}`);
    }

    const team1Data = teams[team1];
    const team2Data = teams[team2];

    const { record: t1Rec, loading: t1Loading } = useTeamRecord(team1);
    const { record: t2Rec, loading: t2Loading } = useTeamRecord(team2);

    return (
        <div onClick={handleClick} className="border p-3 rounded hover:shadow transition bg-white">
            {/* Game Info */}
            <div className="flex items-center justify-between mb-2 text-lg">
                <div className="flex items-center space-x-1">
                    <img src={team1Data.logo} alt={`${team1} logo`} className="w-5 h-5 object-contain" />
                    <p className="font-semibold">{team1Data.abbreviation} ({t1Loading ? "..." : t1Rec})</p>
                    <span className="mx-1">@</span>
                    <img src={team2Data.logo} alt={`${team2} logo`} className="w-5 h-5 object-contain" />
                    <p className="font-semibold">{team2Data.abbreviation} ({t2Loading ? "..." : t2Rec})</p>
                </div>
                
                <div className="text-lg font-semibold">
                    {team1Data.abbreviation} {score[team1.toLowerCase()]}, {team2Data.abbreviation} {score[team2.toLowerCase()]}
                    {status ? ` (${status})` : ' (F)'}
                </div>
            </div>


            {/* Pitcher Info */}
            <div className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">W:</span> {pitchers.winner} &nbsp;
                <span className="font-semibold">L:</span> {pitchers.loser}
                {pitchers.save && (
                    <>
                        &nbsp; <span className="font-semibold">S:</span> {pitchers.save}
                    </>
                )}
            </div>
            
            {/* Blurb */}
            <p className="text-base text-gray-600">{blurb}</p>
        </div>
    );
}