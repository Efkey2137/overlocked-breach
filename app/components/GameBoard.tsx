// GameBoard.tsx
import React from 'react';
import Wall from './Wall'; // Import the Wall component

interface GameBoardProps {
    player: { x: number; y: number };
    mysteryPoint: { x: number; y: number };
    walls: { x: number; y: number; w: number; h: number }[];
    cellSize: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ player, mysteryPoint, walls, cellSize }) => {
    return (
        <div
            className="relative mx-auto border-2 border-gray-700"
            style={{
                width: 15 * cellSize,
                height: 15 * cellSize,
            }}
        >
            {/* Walls */}
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
            {/* Player */}
            <div
                className="absolute bg-blue-500 rounded-full transition-all duration-200"
                style={{
                    width: cellSize - 4,
                    height: cellSize - 4,
                    left: player.x * cellSize + 2,
                    top: player.y * cellSize + 2,
                }}
            />
            {/* Mystery Point */}
            <div
                className="absolute bg-yellow-500 rounded-full transition-all duration-200"
                style={{
                    width: cellSize - 4,
                    height: cellSize - 4,
                    left: mysteryPoint.x * cellSize + 2,
                    top: mysteryPoint.y * cellSize + 2,
                }}
            />
        </div>
    );
};

export default GameBoard;
