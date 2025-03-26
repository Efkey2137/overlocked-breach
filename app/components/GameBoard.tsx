import React from 'react';
import Wall from './Wall';

interface GameBoardProps {
  player: { x: number; y: number };
  mysteryPoint: { x: number; y: number };
  walls: Array<{ x: number; y: number; w: number; h: number }>;
  cellSize: number;
  children?: React.ReactNode;
}

const GameBoard: React.FC<GameBoardProps> = ({ player, mysteryPoint, walls, cellSize, children }) => {
  return (
    <div 
      className="relative mx-auto border-2 border-gray-700 shadow-lg" 
      style={{ width: 15 * cellSize, height: 15 * cellSize }}
    >
      {/* Ściany labiryntu */}
      {walls.map((wall, index) => (
        <Wall 
          key={index}
          x={wall.x}
          y={wall.y}
          width={wall.w}
          height={wall.h}
          cellSize={cellSize}
        />
      ))}
      {/* Gracz */}
      <div 
        className="absolute bg-blue-500 rounded-full transition-all duration-200" 
        style={{ width: cellSize - 4, height: cellSize - 4, left: player.x * cellSize + 2, top: player.y * cellSize + 2 }}
      />
      {/* Mystery Point */}
      <div 
        className="absolute bg-yellow-500 rounded-full transition-all duration-200" 
        style={{ width: cellSize - 4, height: cellSize - 4, left: mysteryPoint.x * cellSize + 2, top: mysteryPoint.y * cellSize + 2 }}
      />
      {children}
    </div>
  );
};

export default GameBoard;
