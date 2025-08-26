import { useState } from "react";
import { useNavigate, useParams, Link} from 'react-router-dom';
import * as dateHelper from '../util/dateHelper';
import { Header } from '../components/Header';
import { ToggleScoresSchedule } from "../components/ToggleScoresSchedule";
import { CalendarPopup } from "../components/CalendarPopup";
import calendarIcon from '../assets/calendar-icon.png';
import { ScheduleData } from "../data/ScheduleData";
import { teams } from "../util/teamDefinitions";

export const Schedule = () => {
    const { date } = useParams();
    const initialDate = date ?? dateHelper.getTodayDate();
    const [startDate, setStartDate] = useState(initialDate);
    const navigate = useNavigate();

    const selectedDate = date ?? dateHelper.getTodayDate();

    const [showCalendar, setShowCalendar] = useState(false);

    const handlePrev = () => setStartDate(dateHelper.getDateOffset(startDate, -3));
    const handleNext = () => setStartDate(dateHelper.getDateOffset(startDate, 3));
    const handleToday = () => {
        const today = dateHelper.getTodayDate();
        navigate(`/schedule/${today}`);
        setStartDate(today);
    }

    const selectedDates = [
        startDate,
        dateHelper.getDateOffset(startDate, 1),
        dateHelper.getDateOffset(startDate, 2),
    ]

    return (
        <div>
            <Header />
            <ToggleScoresSchedule />

            {/* Date Header */}
            <div className="px-6 py-4 max-w-screen-2xl mx-auto">
                <div className="flex items-center justify-center gap-20 mb-12 text-xl font-semibold relative">
                    <button onClick={handlePrev} className="text-5xl text-blue-600 hover:text-blue-800 transition">&larr;</button>
                    <h2 className="mx-6 px-6 py-2 bg-blue-100 text-blue-900 rounded-lg shadow-sm text-2xl font-semibold">
                        {dateHelper.getFormattedDate(startDate)} -  {dateHelper.getFormattedDate(selectedDates[2])}
                    </h2>
                    <button onClick={handleNext} className="text-5xl text-blue-600 hover:text-blue-800 transition">&rarr;</button>

                    {/* Calendar Icon */}
                    <div className="relative">
                            <button onClick={() => setShowCalendar(!showCalendar)} className="ml-2">
                                <img src={calendarIcon} alt="Calendar" className="w-6 h-6" />
                            </button>

                            {showCalendar && (
                                <div className="absolute top-full right-0 z-50 mt-2">
                                    <CalendarPopup 
                                        selectedDate={selectedDate} 
                                        onSelectDate={(date) => {
                                            const iso = dateHelper.toISODate(date);
                                            navigate(`/schedule/${iso}`);
                                            setStartDate(iso);
                                            setShowCalendar(false);
                                        }}
                                        onClose={() => setShowCalendar(false)}
                                    />
                                </div>
                            )}
                    </div>
                </div>

                <hr className="border-t border-gray-200 my-2" />

                {/* Games Slate */}

                {selectedDates.map(date => {
                    const games = ScheduleData[date] || [];

                    return (
                        <div key={date} className="mb-8">
                            <h3 className="text-lg mb-2 text-gray-800">
                                <span className="font-bold">{dateHelper.getWeekday(date)}</span>
                                <span className="font-semibold text-base text-gray-600"> {dateHelper.getMonthDay(date)}</span>
                            </h3>

                            {games.length === 0 ? (
                                <p className="text-gray-500 italic px-4 py-2">No Games Scheduled Today.</p>
                            ) : (
                                <div className="border border-gray-300 rounded-md divide-y divide-gray-200 bg-white shadow-sm">
                                    {games.map(game => {
                                        const away = teams[game.awayTeam];
                                        const home = teams[game.homeTeam];

                                        const isPreview = game.status === 'Preview';
                                        const isLive = game.status === 'LIVE';
                                        const isFinal = game.status.startsWith('F');

                                        const liveScoreLine =
                                            game.score.away === game.score.home
                                                ? `${away.abbreviation} ${game.score.away}, ${home.abbreviation} ${game.score.home}`
                                                : game.score.away > game.score.home
                                                ? `${away.abbreviation} ${game.score.away}, ${home.abbreviation} ${game.score.home}`
                                                : `${home.abbreviation} ${game.score.home}, ${away.abbreviation} ${game.score.away}`;

                                        
                                        return (
                                            <Link key={game.id} to={`/scores/${game.date}/${game.id}`} className="block hover:bg-gray-100 transition cursor-pointer">
                                                <div className="flex items-center gap-4 px-4 py-2 text-sm text-gray-800">
                                                    {/* Logos and Matchup */}
                                                    <div className="flex itemx-center gap-2 w-1/4 min-w-[180px]">
                                                        <img src={away.logo} alt={away.abbreviation} className="w-6 h-6" />
                                                        <span className="text-base font-semibold">{away.abbreviation} @ {home.abbreviation}</span>
                                                        <img src={home.logo} alt={home.abbreviation} className="w-6 h-6" />
                                                    </div>

                                                    {/* Time / Score Line */}
                                                    <div className="w-1/5 text-gray-700">
                                                        {isPreview && game.time}
                                                        {isLive && `${liveScoreLine} | ${game.inning}`}
                                                        {isFinal && liveScoreLine}
                                                    </div>

                                                    {/* Networks */}
                                                    <div className="w-1/6 text-gray-700">
                                                        {(isPreview || isLive) && [away.network, home.network].filter(Boolean).join(', ')}
                                                    </div>

                                                    {/* Pitcher Conditional Info */}
                                                    <div className="w-1/2 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {isPreview && (
                                                            <>
                                                                {game.pitchers.away}{' '}
                                                                <span className="font-semibold">vs</span> {game.pitchers.home}
                                                            </>
                                                        )}
                                                        {isLive && (
                                                            <>
                                                                <span className="font-semibold">AB:</span> {game.atBat}{' '}
                                                                <span className="font-semibold">P:</span> {game.currentPitcher}
                                                            </>
                                                        )}
                                                        {isFinal && game.winningPitcher && (
                                                            <>
                                                                <span className="font-semibold">W:</span> {game.winningPitcher}{' '}
                                                                <span className="font-semibold">L:</span> {game.losingPitcher}{' '}
                                                                {game.savePitcher && (
                                                                    <>
                                                                        <span className="font-semibold">S:</span> {game.savePitcher}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}