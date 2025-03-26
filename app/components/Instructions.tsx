import React from 'react';

interface InstructionsProps {
  showInstructions: boolean,
  onStartGame: () => void,
}

const Instructions: React.FC<InstructionsProps> = ({ showInstructions, onStartGame }) => {
  return (
    <>
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md">
            <h2 className="text-2xl mb-4">How to Play</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use arrow keys or WASD to move</li>
              <li>Avoid gray walls - you cannot pass through them</li>
              <li>Escape from guards</li>
              <li>Solve runic puzzles</li>
              <li>Collect power-ups</li>
            </ul>
            <button  
              className="mt-6 px-4 py-2 bg-blue-500 rounded" 
              onClick={onStartGame}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Instructions;
