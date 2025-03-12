// page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameStats from './components/GameStats';
import Instructions from './components/Instructions';
import GameOver from './components/GameOver';

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 40;

// Function to generate a random maze using Recursive Backtracking
const generateMaze = (gridSize: number) => {
    const walls: { x: number; y: number; w: number; h: number }[] = [];
    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    const carvePath = (x: number, y: number) => {
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }  // Left
        ];

        // Shuffle directions to ensure randomness
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        visited[y][x] = true;

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited[ny][nx]) {
                // Carve a wall between the current cell and the next cell
                walls.push({ x: Math.min(x, nx), y: Math.min(y, ny), w: Math.abs(nx - x) + 1, h: Math.abs(ny - y) + 1 });
                carvePath(nx, ny);
            }
        }
    };

    carvePath(1, 1); // Start carving from (1, 1)
    return walls;
};

// Generate walls for the maze
const WALLS = generateMaze(GRID_SIZE);

// Helper function to get a random position
const getRandomPosition = () => {
    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
            y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
        };
    } while (isColliding(newPos));
    return newPos;
};

// Player initial position
const INITIAL_PLAYER = { x: 1, y: 1 };

const isColliding = (playerPos: { x: number, y: number }) => {
    return WALLS.some(wall => {
        return playerPos.x >= wall.x &&
               playerPos.x < wall.x + wall.w &&
               playerPos.y >= wall.y &&
               playerPos.y < wall.y + wall.h;
    });
};

const ShadowRunPage = () => {
    const [player, setPlayer] = useState(INITIAL_PLAYER);
    const [mysteryPoint, setMysteryPoint] = useState(getRandomPosition());
    const [score, setScore] = useState(0);
    const [showInstructions, setShowInstructions] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isGameOver, setIsGameOver] = useState(false);
    const [pointsCollected, setPointsCollected] = useState(0);

    const isMysteryPoint = useCallback((playerPos: { x: number, y: number }) => {
        return playerPos.x === mysteryPoint.x && playerPos.y === mysteryPoint.y;
    }, [mysteryPoint]);

    const handleMysteryPoint = useCallback((newPos: { x: number, y: number }) => {
        if (isMysteryPoint(newPos)) {
            setScore(prev => prev + 50);
            setPointsCollected(prev => prev + 1);
            setMysteryPoint(getRandomPosition());
            setTimeLeft(prev => prev + 2.5);
        }
    }, [isMysteryPoint]);

    const handleMovement = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        setPlayer(prev => {
            const newPos = { ...prev };
            switch (key) {
                case 'arrowup':
                case 'w':
                    newPos.y = Math.max(0, prev.y - 1);
                    break;
                case 'arrowdown':
                case 's':
                    newPos.y = Math.min(GRID_SIZE - 1, prev.y + 1);
                    break;
                case 'arrowleft':
                case 'a':
                    newPos.x = Math.max(0, prev.x - 1);
                    break;
                case 'arrowright':
                case 'd':
                    newPos.x = Math.min(GRID_SIZE - 1, prev.x + 1);
                    break;
            }
            const finalPos = isColliding(newPos) ? prev : newPos;
            handleMysteryPoint(finalPos);
            return finalPos;
        });
    }, [handleMysteryPoint]);

    useEffect(() => {
        window.addEventListener('keydown', handleMovement);
        return () => window.removeEventListener('keydown', handleMovement);
    }, [handleMovement]);

    useEffect(() => {
        if (!showInstructions && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsGameOver(true);
        }
    }, [timeLeft, showInstructions]);

    const handleStartGame = () => {
        setShowInstructions(false);
        setTimeLeft(30);
        setScore(0);
        setPointsCollected(0);
        setPlayer(INITIAL_PLAYER);
        setMysteryPoint(getRandomPosition());
        setIsGameOver(false);
    };

    const handlePlayAgain = () => {
        setTimeLeft(30);
        setScore(0);
        setPointsCollected(0);
        setPlayer(INITIAL_PLAYER);
        setMysteryPoint(getRandomPosition());
        setIsGameOver(false);
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className='text-4xl font-bold text-center mb-8'>Overlocked Breach</h1>
            
            {/* Game Stats */}
            <GameStats score={score} timeLeft={timeLeft} pointsCollected={pointsCollected} />

            {/* Game Grid */}
            <GameBoard player={player} mysteryPoint={mysteryPoint} walls={WALLS} cellSize={CELL_SIZE} />

            {/* Instructions */}
            <Instructions showInstructions={showInstructions} onStartGame={handleStartGame} />

            {/* Game Over Popup */}
            <GameOver isGameOver={isGameOver} score={score} pointsCollected={pointsCollected} onPlayAgain={handlePlayAgain} />
        </main>
    );
};

export default ShadowRunPage;
