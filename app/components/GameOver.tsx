import React from 'react';

interface GameOverProps {
  isGameOver: boolean;
  score: number;
  pointsCollected: number;
  onPlayAgain: () => void;
  reason?: 'time' | 'caught';
}

const GameOver: React.FC<GameOverProps> = ({ isGameOver, score, pointsCollected, onPlayAgain, reason = 'time' }) => {
  if (!isGameOver) return null;

  const handlePlayAgain = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onPlayAgain();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p className="mb-2">
          {reason === 'time' ? 'Czas się skończył!' : 'Zostałeś złapany przez przeciwnika!'}
        </p>
        <p className="mb-4">Twój wynik: {score} punktów</p>
        <p className="mb-6">Zebrane punkty: {pointsCollected}</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePlayAgain}>
          Zagraj ponownie
        </button>
      </div>
    </div>
  );
};

export default GameOver;
