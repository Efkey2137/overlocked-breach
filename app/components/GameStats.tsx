import React from 'react';

interface GameStatsProps {
  score: number,
  timeLeft: number,
  pointsCollected: number
}

const GameStats: React.FC<GameStatsProps> = ({ score, timeLeft, pointsCollected }) => {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm sm:text-base px-1">
      <div className="bg-gray-800 rounded-md py-1 px-3 shadow">
        <span className="font-bold">Score:</span> {score}
      </div>
      <div className="bg-gray-800 rounded-md py-1 px-3 shadow">
        <span className="font-bold">Time:</span> {timeLeft}s
      </div>
      <div className="bg-gray-800 rounded-md py-1 px-3 shadow">
        <span className="font-bold">Points:</span> {pointsCollected}
      </div>
    </div>
  );
};

export default GameStats;
