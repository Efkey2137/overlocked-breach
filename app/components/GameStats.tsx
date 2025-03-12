import React from 'react';

interface GameStatsProps {
    score: number,
    timeLeft: number,
    pointsCollected: number
}
const GameStats: React.FC<GameStatsProps> = ({ score, timeLeft, pointsCollected }) => {
    return (
        <div className="flex justify-between mb-4">
            <div>Score: {score}</div>
            <div>Time Left: {timeLeft}s</div>
            <div>Points Collected: {pointsCollected}</div>
        </div>
    )
}

export default GameStats;
