// GameBoard.tsx
import React, { useEffect, useState } from 'react';
import Wall from './Wall'; // Import the Wall component

interface GameBoardProps {
    player: { x: number; y: number };
    mysteryPoint: { x: number; y: number };
    walls: { x: number; y: number; w: number; h: number }[];
    cellSize: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ player, mysteryPoint, walls, cellSize: defaultCellSize }) => {
    const [cellSize, setCellSize] = useState(defaultCellSize);
    
    // Responsive sizing based on viewport
    useEffect(() => {
        const updateSize = () => {
            // Get viewport width and height
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            
            // Calculate available space (accounting for other UI elements)
            // Assume we want to use at most 85% of the screen height for the game board on mobile
            // and have some space for controls
            const orientation = vw > vh ? 'landscape' : 'portrait';
            
            if (orientation === 'portrait') {
                // For portrait: use width as limiting factor, leave room for controls at bottom
                const maxBoardSize = Math.min(vw - 32, (vh * 0.6)); // 60% of height for board
                const newCellSize = Math.floor(maxBoardSize / 15); // 15 is GRID_SIZE
                setCellSize(newCellSize);
            } else {
                // For landscape: can use more height, controls on the side
                const maxBoardSize = Math.min(vh - 200, vw * 0.6); // 60% of width for board
                const newCellSize = Math.floor(maxBoardSize / 15);
                setCellSize(newCellSize);
            }
        };
        
        // Initial sizing
        updateSize();
        
        // Update on resize
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    
    return (
        <div
            className="relative mx-auto border-2 border-gray-700 shadow-lg"
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