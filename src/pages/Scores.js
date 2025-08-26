import { Header } from '../components/Header';
import { ToggleScoresSchedule } from '../components/ToggleScoresSchedule';
import * as dateHelper from '../util/dateHelper';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScoresData } from '../data/ScoresData';
import { GamesBox } from '../scores/GamesBox';
import { CalendarPopup } from '../components/CalendarPopup';
import calendarIcon from '../assets/calendar-icon.png';
import { getScoresForDate } from '../util/gameFilter';
import { normalizeGameData } from '../util/normalizeGameData';

export const Scores = () => {
    const { date } = useParams();
    const navigate = useNavigate();

    const selectedDate = date ?? dateHelper.getTodayDate();
    
    const [showCalendar, setShowCalendar] = useState(false);
    const today = dateHelper.getTodayDate();
    const games = normalizeGameData(today);

    return (
        <div>
            {/* Main and Sub Header */}
            <Header />
            <ToggleScoresSchedule />
            
            <div className="px-6 py-4">
                <div className="flex items-center justify-center gap-20 mb-12 text-xl font-semibold relative">
                    <button onClick={() => navigate(`/scores/${dateHelper.getDateOffset(selectedDate, -1)}`)} className="min-w-[170px] px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-blue-400 transition">
                        &larr; {dateHelper.getFormattedDate(selectedDate, -1)}
                    </button>

                    <div className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg shadow-sm text-2xl">{dateHelper.getFormattedDate(selectedDate)}</div>

                    <button onClick={() => navigate(`/scores/${dateHelper.getDateOffset(selectedDate, 1)}`)} className="min-w-[170px] px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-blue-400 transition">
                        {dateHelper.getFormattedDate(selectedDate, 1)} &rarr; 
                    </button>

                    {/* Calendar Icon */}
                    <div className="relative">
                        <button onClick={() => setShowCalendar(!showCalendar)} className="ml-2">
                            <img src={calendarIcon} alt="Calendar" className="w-6 h-6" />
                        </button>

                        {showCalendar && (
                            <div className="absolute top-full left-0 z-50 mt-2">
                                <CalendarPopup 
                                    selectedDate={selectedDate} 
                                    onSelectDate={(date) => {
                                        navigate(`/scores/${dateHelper.toISODate(date)}`);
                                        setShowCalendar(false);
                                    }}
                                    onClose={() => setShowCalendar(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid go here */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap4 overflow-visible">
                        {games.map((game) => (
                            <GamesBox key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}