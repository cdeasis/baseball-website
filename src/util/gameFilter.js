export const getScoresForDate = (scoresData, selectedDate) => {
    return scoresData.filter(game => game.date === selectedDate);
}