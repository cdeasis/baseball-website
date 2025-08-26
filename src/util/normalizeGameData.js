import { RecapData } from "../data/RecapData";
import { ScoresData } from "../data/ScoresData";
import { ScheduleData } from "../data/ScheduleData";
import * as dateHelper from '../util/dateHelper';

export const normalizeGameData = (date) => {
    // recap and scores data index by ID
    const recapMap = Object.fromEntries(RecapData.map(r => [r.id, r]));
    const scoresMap = Object.fromEntries(ScoresData.map(s => [s.id, s]));

    // games from schedule data
    const today = dateHelper.getTodayDate();
    const isToday = date === today;

    let baseGames = [];

    // case 1: today -> use scoresdata only
    if (isToday) {
        baseGames = ScoresData.filter(game => game.date === date);
    } else {
        // case 2: other days - use schedule data
        baseGames = ScheduleData[date] ?? [];
        
        // case 3: return empty if no games, no need to process
        if (baseGames.length === 0) return [];
    }

    const mergedGames = baseGames.map(game => {
        const scoreData = scoresMap[game.id];
        const recapData = recapMap[game.id];

        const base = isToday ? game : (scoreData?.date === date ? scoreData : game);

        const merged = {
            ...base,
            ...game,
            ...recapData,
            date: game.date || scoreData?.date || date,
        };

        merged.betting = merged.betting ?? {
            spread: '-',
            moneyline: '-',
            overUnder: '-',
        };

        merged.pitchers = merged.pitchers ?? {
            away: '',
            home: ''
        };

        merged.score = merged.score ?? {
            away: 0,
            home: 0
        };

        return merged;
    });

    return mergedGames;
}