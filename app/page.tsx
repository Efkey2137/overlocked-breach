'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateMaze } from './components/mazeGenerator';
import GameStats from './components/GameStats';
import Instructions from './components/Instructions';
import GameOver from './components/GameOver';
import GameBoard from './components/GameBoard';
import DirectionalControls from './components/DirectionalControls';
import Enemy from './components/Enemy';

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 40; // Base cell size, will be adjusted responsively

export default function OverlockedBreachPage() {
  // Safe initial state
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Initialize after mount
  useEffect(() => {
    setIsClientSide(true);
    setIsLargeScreen(window.innerWidth >= 1024);
    
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Generate random walls after client-side hydration
  const walls = useMemo(() => {
    if (!isClientSide) return [];
    return generateMaze();
  }, [isClientSide]);
  
  // Collision detection
  const isColliding = useCallback((pos: { x: number, y: number }) => {
    return walls.some(wall => 
      pos.x >= wall.x && 
      pos.x < wall.x + wall.w && 
      pos.y >= wall.y && 
      pos.y < wall.y + wall.h
    );
  }, [walls]);
  
  // Get a position that doesn't collide with walls
  const getRandomPosition = useCallback(() => {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
      };
    } while (isColliding(pos));
    return pos;
  }, [isColliding]);
  
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [mysteryPoint, setMysteryPoint] = useState(() => ({ x: 10, y: 10 }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastMoveDirection, setLastMoveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  
  // Prevent context menu (right-click) on the entire game
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  
  // Prevent touch selection highlighting
  useEffect(() => {
    // Add global styles to prevent selection
    const style = document.createElement('style');
    style.innerHTML = `
      body, html {
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      * {
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Movement with collision detection
  const handleMovement = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setPlayer(prev => {
      const newPos = { ...prev };
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      
      switch (key) {
        case 'arrowup':
        case 'w':
          newPos.y = Math.max(0, prev.y - 1);
          direction = 'up';
          break;
        case 'arrowdown':
        case 's':
          newPos.y = Math.min(GRID_SIZE - 1, prev.y + 1);
          direction = 'down';
          break;
        case 'arrowleft':
        case 'a':
          newPos.x = Math.max(0, prev.x - 1);
          direction = 'left';
          break;
        case 'arrowright':
        case 'd':
          newPos.x = Math.min(GRID_SIZE - 1, prev.x + 1);
          direction = 'right';
          break;
      }
      
      // Update last move direction for highlighting
      setLastMoveDirection(direction);
      
      // Check for collision
      const finalPos = isColliding(newPos) ? prev : newPos;
      
      // Check for mystery point collection
      if (finalPos.x === mysteryPoint.x && finalPos.y === mysteryPoint.y) {
        setScore(prev => prev + 50);
        setPointsCollected(prev => prev + 1);
        setMysteryPoint(getRandomPosition());
        setTimeLeft(prev => prev + 1);
      }
      
      return finalPos;
    });
  }, [mysteryPoint, isColliding, getRandomPosition]);
  
  // Handle direct control from buttons
  const handleDirectionalControl = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const keyMap = {
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight'
    };
    
    const event = new KeyboardEvent('keydown', { key: keyMap[direction] });
    handleMovement(event);
  }, [handleMovement]);
  
  // Set up keyboard listener
  useEffect(() => {
    if (!showInstructions && !isGameOver) {
      window.addEventListener('keydown', handleMovement);
      return () => window.removeEventListener('keydown', handleMovement);
    }
  }, [handleMovement, showInstructions, isGameOver]);
  
  // Set up timer
  useEffect(() => {
    if (!showInstructions && !isGameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && !showInstructions) {
      setIsGameOver(true);
    }
  }, [timeLeft, showInstructions, isGameOver]);
  
  const handleStartGame = useCallback(() => {
    setShowInstructions(false);
    setTimeLeft(30);
    setScore(0);
    setPointsCollected(0);
    setPlayer({ x: 1, y: 1 });
    setMysteryPoint(getRandomPosition());
  }, [getRandomPosition]);
  
  const handlePlayAgain = useCallback(() => {
    setTimeLeft(30);
    setScore(0);
    setPointsCollected(0);
    setPlayer({ x: 1, y: 1 });
    setMysteryPoint(getRandomPosition());
    setIsGameOver(false);
  }, [getRandomPosition]);

  // Add selection prevention classes globally
  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col select-none">
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 select-none'>Overlocked Breach</h1>
      
      {/* Game Stats - more compact on mobile */}
      <div className="mb-2 sm:mb-4 select-none">
        <GameStats score={score} timeLeft={timeLeft} pointsCollected={pointsCollected} />
      </div>
      
      {/* Responsive layout switching */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center select-none">
        {/* Game Board - centered and responsive */}
        <div className="mb-4 lg:mb-0 select-none">
          <GameBoard player={player} mysteryPoint={mysteryPoint} walls={walls} cellSize={CELL_SIZE} />
        </div>
        
        {/* Controls - changes position based on screen size */}
        <div className="lg:ml-6 mt-2 lg:mt-0 select-none">
          <DirectionalControls 
            onMove={handleDirectionalControl}
            currentDirection={lastMoveDirection}
            layout={isLargeScreen ? 'horizontal' : 'vertical'}
          />
        </div>
      </div>
      
      {/* Instructions */}
      <Instructions showInstructions={showInstructions} onStartGame={handleStartGame} />
      
      {/* Game Over */}
      <GameOver isGameOver={isGameOver} score={score} pointsCollected={pointsCollected} onPlayAgain={handlePlayAgain} />
    </main>
  );
}