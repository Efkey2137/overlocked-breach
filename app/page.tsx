'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateMaze } from './components/mazeGenerator';
import GameStats from './components/GameStats';
import Instructions from './components/Instructions';
import GameOver from './components/GameOver';
import GameBoard from './components/GameBoard';
import DirectionalControls from './components/DirectionalControls';
import Enemy from './components/Enemy';
import Puzzle from './components/Puzzle';

const GRID_SIZE = 15;
const DEFAULT_CELL_SIZE = 40;
const MIN_START_DISTANCE_FROM_ENEMY = 5;

const getManhattanDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

export default function OverlockedBreachPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'caught'>('time');
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [mysteryPoint, setMysteryPoint] = useState(() => ({ x: 10, y: 10 }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastMoveDirection, setLastMoveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mazeKey, setMazeKey] = useState(0);
  const [enemyPosition, setEnemyPosition] = useState({ x: GRID_SIZE - 2, y: GRID_SIZE - 2 });
  const [dynamicCellSize, setDynamicCellSize] = useState(DEFAULT_CELL_SIZE);
  const [walls, setWalls] = useState(() => generateMaze());
  const [isPuzzleActive, setIsPuzzleActive] = useState(false);
  const [isPuzzleRequired, setIsPuzzleRequired] = useState(false);



  useEffect(() => {
    setIsClientSide(true);
    setIsLargeScreen(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const orientation = vw > vh ? 'landscape' : 'portrait';
      let maxBoardSize;
      if (orientation === 'portrait') {
        maxBoardSize = Math.min(vw - 32, vh * 0.6);
      } else {
        maxBoardSize = Math.min(vh - 200, vw * 0.6);
      }
      setDynamicCellSize(Math.floor(maxBoardSize / GRID_SIZE));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPositionValid = (pos: { x: number, y: number }, walls: any[]) => {
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
      return false;
    }
    return !walls.some(wall =>
      pos.x >= wall.x &&
      pos.x < wall.x + wall.w &&
      pos.y >= wall.y &&
      pos.y < wall.y + wall.h
    );
  };

  const getRandomPosition = useCallback(() => {
    const availablePositions = [];
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        const pos = { x, y };
        if (isPositionValid(pos, walls)) {
          availablePositions.push(pos);
        }
      }
    }
    if (availablePositions.length === 0) {
      return { x: 1, y: 1 };
    }
    return availablePositions[Math.floor(Math.random() * availablePositions.length)];
  }, [walls]);

  const updateEnemyPosition = useCallback((pos: { x: number, y: number }) => {
    setEnemyPosition(pos);
  }, []);

  const handleGameLose = useCallback(() => {
    setIsGameOver(true);
    setIsGameActive(false);
    setGameOverReason('caught');
    
    // Resetuj stany zagadki
    setIsPuzzleActive(false);
    setIsPuzzleRequired(false);
  }, []);
  

  const handleEnemyMoveComplete = useCallback(() => {
    setIsPlayerTurn(true);
  }, []);

  const handlePointCollected = useCallback(() => {
    if (!isPuzzleActive) {
      setIsPuzzleActive(true);
    }
    setScore(prev => prev + 50);
    setPointsCollected(prev => prev + 1);
    setTimeLeft(prev => Math.min(prev + 5, 120));
    setIsTransitioning(true);

    setTimeout(() => {
      const newWalls = generateMaze();

      const currentPlayerPos = { ...player };
      if (!isPositionValid(currentPlayerPos, newWalls)) {
        const safePlayerPos = getRandomPosition();
        setPlayer(safePlayerPos);
      }

      let safePointPos;
      do {
        safePointPos = getRandomPosition();
      } while (
        (safePointPos.x === player.x && safePointPos.y === player.y) ||
        !isPositionValid(safePointPos, newWalls)
      );

      setMysteryPoint(safePointPos);
      setMazeKey(prev => prev + 1);
      setWalls(newWalls);

      setIsTransitioning(false);
      setIsPlayerTurn(true);
    }, 1000);
  }, [getRandomPosition, player]);

  const handlePuzzleSolved = useCallback(() => {
    setIsPuzzleActive(false);
    setIsPuzzleRequired(false); 
    setScore(prev => prev + 50);
    setPointsCollected(prev => prev + 1);
    setTimeLeft(prev => Math.min(prev + 5, 120));
    setIsTransitioning(true);
  
    setTimeout(() => {
      const newWalls = generateMaze();
  
      const currentPlayerPos = { ...player };
      if (!isPositionValid(currentPlayerPos, newWalls)) {
        const safePlayerPos = getRandomPosition();
        setPlayer(safePlayerPos);
      }
  
      let safePointPos;
      do {
        safePointPos = getRandomPosition();
      } while (
        (safePointPos.x === player.x && safePointPos.y === player.y) ||
        !isPositionValid(safePointPos, newWalls)
      );
  
      setMysteryPoint(safePointPos);
      setMazeKey(prev => prev + 1);
      setWalls(newWalls);
  
      setIsTransitioning(false);
      setIsPlayerTurn(true);
    }, 1000);
  }, [getRandomPosition, player, isPositionValid]);
  
  const handlePuzzleFailed = useCallback(() => {
    setIsPuzzleActive(false);
    // Nie resetujemy isPuzzleRequired, ponieważ gracz nadal musi rozwiązać zagadkę
    setIsPlayerTurn(false);
    
    // Po ruchu przeciwnika, ponownie aktywuj zagadkę
    // ALE nie generuj nowego labiryntu ani nie zmieniaj pozycji punktu
    setTimeout(() => {
      setIsPuzzleActive(true);
    }, 1000); // Daj czas na ruch przeciwnika
  }, []);
  
  const handlePuzzleTimeout = useCallback(() => {
    // Podobnie jak w przypadku niepowodzenia
    setIsPuzzleActive(false);
    setIsPlayerTurn(false);
    
    setTimeout(() => {
      setIsPuzzleActive(true);
    }, 1000);
  }, []);
  
  const handleMovement = useCallback((e: KeyboardEvent) => {
    if (!isGameActive || !isPlayerTurn || isTransitioning || isPuzzleActive || isPuzzleRequired) return;
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
        default:
          return prev;
      }
      setLastMoveDirection(direction);
      const finalPos = isPositionValid(newPos, walls) ? newPos : prev;
      if (finalPos.x !== prev.x || finalPos.y !== prev.y) {
        setIsPlayerTurn(false);
        if (finalPos.x === mysteryPoint.x && finalPos.y === mysteryPoint.y) {
          handlePointCollected();
        }
      }
      return finalPos;
    });
  }, [isGameActive, mysteryPoint, walls, isPlayerTurn, isTransitioning, isPuzzleActive, isPuzzleRequired, handlePointCollected]);

  const handleDirectionalControl = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlayerTurn || isTransitioning) return;
    const keyMap = {
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight'
    };
    const event = new KeyboardEvent('keydown', { key: keyMap[direction] });
    handleMovement(event);
  }, [handleMovement, isPlayerTurn, isTransitioning]);

  useEffect(() => {
    if (isGameActive && !isGameOver) {
      window.addEventListener('keydown', handleMovement);
      return () => {
        window.removeEventListener('keydown', handleMovement);
      };
    }
  }, [isGameActive, isGameOver, handleMovement]);

  useEffect(() => {
    if (isGameActive && !isGameOver && timeLeft > 0 && !isTransitioning) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && isGameActive) {
      setIsGameOver(true);
      setIsGameActive(false);
      setGameOverReason('time');
    }
  }, [timeLeft, isGameActive, isGameOver, isTransitioning]);

  const handleStartGame = useCallback(() => {
    setShowInstructions(false);
    setTimeLeft(120);
    setScore(0);
    setPointsCollected(0);
    setMazeKey(prev => prev + 1);
    
    const initialEnemyPos = { x: GRID_SIZE - 2, y: GRID_SIZE - 2 };
    setEnemyPosition(initialEnemyPos);
    
    setTimeout(() => {
      // Get safe position away from enemy at game start
      let safePlayerPos;
      do {
        safePlayerPos = getRandomPosition();
      } while (
        !isPositionValid(safePlayerPos, walls) || 
        getManhattanDistance(safePlayerPos, initialEnemyPos) < MIN_START_DISTANCE_FROM_ENEMY
      );
      
      setPlayer(safePlayerPos);
      
      // Get mystery point position
      let safePointPos;
      do {
        safePointPos = getRandomPosition();
      } while (safePointPos.x === safePlayerPos.x && safePointPos.y === safePlayerPos.y);
      
      setMysteryPoint(safePointPos);
      setIsGameActive(true);
      setIsGameOver(false);
      setIsPlayerTurn(true);
    }, 500);
  }, [getRandomPosition, walls]);

  const handlePlayAgain = useCallback(() => {
    setTimeLeft(120);
    setScore(0);
    setPointsCollected(0);
    setMazeKey(prev => prev + 1);
    setEnemyPosition({ x: GRID_SIZE - 2, y: GRID_SIZE - 2 });
    setTimeout(() => {
      const safePlayerPos = getRandomPosition();
      setPlayer(safePlayerPos);
      let safePointPos;
      do {
        safePointPos = getRandomPosition();
      } while (safePointPos.x === safePlayerPos.x && safePointPos.y === safePlayerPos.y);
      setMysteryPoint(safePointPos);
      setIsGameOver(false);
      setIsGameActive(true);
      setIsPlayerTurn(true);
    }, 500);
  }, [getRandomPosition]);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col select-none">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 select-none">Overlocked Breach</h1>
      <div className="mb-2 sm:mb-4 select-none">
        <GameStats score={score} timeLeft={timeLeft} pointsCollected={pointsCollected} />
      </div>
      <div className="text-center mb-2">
        {isGameActive && !isGameOver && !isTransitioning && (
          <div className={`py-1 px-3 rounded-md inline-block ${isPlayerTurn ? 'bg-green-600' : 'bg-red-600'}`}>
            {isPlayerTurn ? 'Twoja tura' : 'Tura przeciwnika'}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center select-none">
        <div className="mb-4 lg:mb-0 select-none relative">
          {isTransitioning ? (
            <div 
              className="bg-black transition-opacity duration-500 ease-in-out opacity-100"
              style={{
                width: `${GRID_SIZE * dynamicCellSize}px`,
                height: `${GRID_SIZE * dynamicCellSize}px`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
            </div>
          ) : (
            <GameBoard 
              key={mazeKey}
              player={player}
              mysteryPoint={mysteryPoint}
              walls={walls}
              cellSize={dynamicCellSize}
            >
              {isClientSide && isGameActive && !isGameOver && !isTransitioning && (
                <Enemy 
                  player={player}
                  walls={walls}
                  cellSize={dynamicCellSize}
                  onCatchPlayer={handleGameLose}
                  isGameActive={isGameActive && !isGameOver}
                  isPlayerTurn={isPlayerTurn}
                  onEnemyMoveComplete={handleEnemyMoveComplete}
                  initialPosition={enemyPosition}
                  onPositionUpdate={updateEnemyPosition}
                />
              )}
            </GameBoard>
          )}
        </div>
        <div className="lg:ml-6 mt-2 lg:mt-0 select-none lg:hidden md:block">
          <DirectionalControls 
            onMove={handleDirectionalControl}
            currentDirection={lastMoveDirection}
            layout={isLargeScreen ? 'horizontal' : 'vertical'}
          />
        </div>
      </div>
      <Instructions showInstructions={showInstructions} onStartGame={handleStartGame} />
      <GameOver 
        isGameOver={isGameOver}
        score={score}
        pointsCollected={pointsCollected}
        onPlayAgain={handlePlayAgain}
        reason={gameOverReason}
      />
      <Puzzle 
      isActive={isPuzzleActive}
      onSolve={handlePuzzleSolved}
      onFail={handlePuzzleFailed}
      onTimeout={handlePuzzleTimeout}
      difficulty={Math.min(3, Math.ceil(pointsCollected / 3))} // Zwiększanie trudności z czasem
    />
    </main>
  );
}
