import { useParams } from 'react-router-dom';
import { ScoresData } from '../data/ScoresData';
import { Header } from '../components/Header';
import { MiniGameCard } from '../components/MiniGameCard';
import { PreviewGameView } from '../views/ScoresMainViews/PreviewGameView';
import { LiveGameView } from '../views/ScoresMainViews/LiveGameView';
import { FinalGameView } from '../views/ScoresMainViews/FinalGameView';

export const GameBoxMain = () => {
    const { gameId } = useParams();

    const game = ScoresData.find (g => g.id === gameId);

    if (!game) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 text-center text-red-600">
                <h2 className="text-2xl font-bold-mb-2">Game Not Found</h2>
                <p>We couldn't find the game you're looking for. It may be from a past date or recap-only data.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header and MiniScoreCard Blocks */}
            <Header />
            <div className="overflow-x-auto flex gap-3 py-2 px-2 border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {ScoresData.map((g) => (
                    <div key={g.id}>
                        <MiniGameCard
                            team1={g.awayTeam}
                            team2={g.homeTeam}
                            startTime={g.time}
                            gameID={g.id}
                            status={g.status}
                            inning={g.inning}
                            team1Score={g.score.away}            
                            team2Score={g.score.home}
                            selected={g.id === gameId}
                        />
                    </div>
                ))}
            </div>

            {/* Views (Conditional based on status) */}
            {game.status === 'Preview' && <PreviewGameView game={game} />}
            {game.status === 'LIVE' && <LiveGameView game={game} />}
            {game.status.startsWith('F') && <FinalGameView game={game} />}
        </div>
    )
}