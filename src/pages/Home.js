//import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getYesterdayDate } from "../util/dateHelper";
import { Header } from '../components/Header';
import { MiniGameCard } from '../components/MiniGameCard';
import { NewsCard } from '../components/NewsCard';
import { RecapGameCard } from '../components/RecapGameCard';
import { StandingsCard } from '../components/StandingsCard';
import { RecapData } from '../data/RecapData';
import { ScoresData } from '../data/ScoresData';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const Home = () => {
    const navigate = useNavigate();
    //const today = getTodayDate();
    const yesterday = getYesterdayDate();

    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchArticles = async () => {
            try{
                const response = await axios.get('api/news');
                setArticles(response.data);
            } catch(error) {
                console.error("Error fetching articles:", error);
            }
        };

        fetchArticles();
    }, []);

    return (
        <>
            <Header />
            <div className="overflow-x-auto whitespace-nowrap bg-white py-3 px-4 shadow-md">
                <div className="inline-flex space-x-4">
                    {ScoresData.map((game) => (
                        <div key={game.id}>
                            <MiniGameCard
                                key={game.id}
                                team1={game.awayTeam}
                                team2={game.homeTeam}
                                startTime={game.time}
                                gameID={game.id}
                                status={game.status}
                                inning={game.inning}
                                team1Score={game.score.away}
                                team2Score={game.score.home}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 px-6 py-6">
                {/* Left 2/3 */}
                <div className="md:w-2/3 space-y-6">
                    {/* News Section */}
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">News</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {articles.slice(0, 4).map((article) => (
                                <NewsCard
                                    key={article.id}
                                    id={article.id}
                                    image={article.image}
                                    title={article.title}
                                    summary={article.summary}
                                    onClick={() => navigate (`/news?id=${article.id}`)}
                                    showButton={false}
                                    variant="home"
                                />
                            ))}
                        </div>
                        <div className="text-right mt-2">
                            <button className="text-blue-500 hover:underline text-sm" onClick={() => navigate("/News")}>More &rarr;</button>
                        </div>
                    </div>
                    {/* Game Recap Section */}
                    <div className="bg-white p-4 rounded shadow space-y-r max-h-[400px] overflow-y-auto">
                        <h2 className="text-xl font-semibold">Game Recaps</h2>
                        <div className="flex flex-col gap-4">
                            {RecapData.map((recap) => (
                                <RecapGameCard 
                                    key={recap.id}
                                    team1={recap.team1}
                                    team2={recap.team2}
                                    score={recap.score}
                                    gameID={recap.id}
                                    blurb={recap.blurb}
                                    pitchers={recap.pitchers}
                                    status={recap.status}
                                />
                            ))}
                        </div>
                        <button className="text-blue-500 text-sm" onClick={() => navigate(`/scores/${yesterday}`)}>More &rarr;</button>
                    </div>
                </div>
                {/* Right 1/3 */}
                <div className="w-1/3 bg-white p-4 rounded shadow space-y-4">
                    <StandingsCard />
                    <button className="text-blue-500 text-sm" onClick={() => navigate("/Standings")}>See Full Standings &rarr;</button>
                </div>
            </div>
        </>
    );
}