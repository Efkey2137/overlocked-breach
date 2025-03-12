import React from 'react'

interface GameOverProps {
    isGameOver: boolean,
    score: number,
    pointsCollected: number,
    onPlayAgain: () => void,
}

const GameOver: React.FC<GameOverProps> = ({ isGameOver, score, pointsCollected, onPlayAgain }) => {
    return (
        <>
        {isGameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg max-w-md">
                    <h2 className="text-2xl mb-4">Game Over!</h2>
                    <div className="space-y-2">
                        <p>Final Score: {score}</p>
                        <p>Mystery Points Collected: {pointsCollected}</p>
                        <p>Time's Up!</p>
                    </div>
                    <button 
                        className="mt-6 px-4 py-2 bg-blue-500 rounded"
                        onClick={onPlayAgain}
                    >
                        Play Again
                    </button>
                </div>
            </div>
        )}
        </>
    )
}

export default GameOver;
