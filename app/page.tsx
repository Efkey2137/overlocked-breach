'use client';
import { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameStats from './components/GameStats';
import Instructions from './components/Instructions';
import GameOver from './components/GameOver';

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 40;

// Example walls -> will be randomly created in the final game
const WALLS = [
    // Outer walls
    {x: 0, y: 0, w: GRID_SIZE, h: 1}, // Top
    {x: 0, y: GRID_SIZE-1, w: GRID_SIZE, h: 1}, // Bottom
    {x: 0, y: 0, w: 1, h: GRID_SIZE}, // Left
    {x: GRID_SIZE-1, y: 0, w: 1, h: GRID_SIZE}, // Right

    // Inner vertical walls
    {x: 2, y: 2, w: 1, h: 6},
    {x: 4, y: 4, w: 1, h: 5},
    // ... (rest of the wall definitions)
];

//Add this helper function after the WALLS constant
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


const isColliding = (playerPos: {x: number, y: number}) => {
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
  
    // Modify handleMysteryPoint to update mystery point position
    const handleMysteryPoint = useCallback((newPos: {x: number, y: number}) => {
        if (newPos.x === mysteryPoint.x && newPos.y === mysteryPoint.y) {
            setScore(prev => prev + 50);
            setPointsCollected(prev => prev + 0.5);
            setMysteryPoint(getRandomPosition());
            setTimeLeft(prev => prev + 2.5);
        }
    }, [mysteryPoint]);
  // Keyboard Event Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPlayer(prev => { 
        const newPos = { ...prev };
        switch (e.key.toLowerCase()) {
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
        // Check for wall collision
        const finalPos = isColliding(newPos) ? prev : newPos;
        // Check for mystery point
        handleMysteryPoint(finalPos);
        return finalPos;
    });
  }, [handleMysteryPoint]);

  // Touch Event Handler
  const handleTouch: React.TouchEventHandler<HTMLElement> = useCallback((e) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement; // Cast e.target to HTMLElement
    const rect = target.getBoundingClientRect(); // Now TypeScript recognizes getBoundingClientRect

    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setPlayer(prev => {
        const newPos = { ...prev };

        if (touchX < centerX) newPos.x = Math.max(0, prev.x - 1);
        if (touchX > centerX) newPos.x = Math.min(GRID_SIZE - 1, prev.x + 1);
        if (touchY < centerY) newPos.y = Math.max(0, prev.y - 1);
        if (touchY > centerY) newPos.y = Math.min(GRID_SIZE - 1, prev.y + 1);

        const finalPos = isColliding(newPos) ? prev : newPos;
        handleMysteryPoint(finalPos);
        return finalPos;
    });
}, [handleMysteryPoint]);




  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown); 
  }, [handleKeyDown]); 

  // Add this after your existing useEffect
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
        <main 
            onTouchStart={handleTouch} 
            onTouchMove={handleTouch}  
            className="min-h-screen bg-gray-900 text-white p-8"
        >

        <h1 className='text-4xl font-bold text-center mb-8'>Overlocked Breach</h1>
            
            {/* Game Stats */}
            <GameStats score={score} timeLeft={timeLeft} pointsCollected={pointsCollected}/>

            {/* Game Grid */}
            <GameBoard 
                player={player} 
                mysteryPoint={mysteryPoint} 
                walls={WALLS} 
                cellSize={CELL_SIZE}
            />

            {/* Instructions */}
            <Instructions 
                showInstructions={showInstructions} 
                onStartGame={handleStartGame} 
            />

            {/* Game Over Popup */}
            <GameOver 
                isGameOver={isGameOver} 
                score={score} 
                pointsCollected={pointsCollected} 
                onPlayAgain={handlePlayAgain} 
            />
    </main>
  );
};

export default ShadowRunPage;
