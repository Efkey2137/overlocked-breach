'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateMaze } from './components/mazeGenerator';
import GameStats from './components/GameStats';
import Instructions from './components/Instructions';
import GameOver from './components/GameOver';
import GameBoard from './components/GameBoard';
import DirectionalControls from './components/DirectionalControls';
import Enemy from './components/Enemy';

const GRID_SIZE = 15;
const DEFAULT_CELL_SIZE = 40;

export default function OverlockedBreachPage() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'caught'>('time');
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [mysteryPoint, setMysteryPoint] = useState(() => ({ x: 10, y: 10 }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastMoveDirection, setLastMoveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mazeKey, setMazeKey] = useState(0);

  // Dynamiczny cellSize – teraz wszyscy tańczą do tej samej muzyki.
  const [dynamicCellSize, setDynamicCellSize] = useState(DEFAULT_CELL_SIZE);

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

  const walls = useMemo(() => {
    if (!isClientSide) return [];
    return generateMaze();
  }, [isClientSide, mazeKey]);

  const isColliding = useCallback((pos: { x: number, y: number }) => {
    return walls.some(wall =>
      pos.x >= wall.x &&
      pos.x < wall.x + wall.w &&
      pos.y >= wall.y &&
      pos.y < wall.y + wall.h
    );
  }, [walls]);

  // Poprawiona funkcja getRandomPosition, która upewnia się, że punkt nie pojawi się w ścianie
  const getRandomPosition = useCallback(() => {
    // Tworzymy mapę dostępnych pozycji (nie będących ścianami)
    const availablePositions = [];
    
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        const pos = { x, y };
        // Sprawdź czy pozycja nie koliduje ze ścianą
        if (!isColliding(pos)) {
          availablePositions.push(pos);
        }
      }
    }
    
    // Jeśli nie ma dostępnych pozycji (co jest mało prawdopodobne), zwróć domyślną pozycję
    if (availablePositions.length === 0) {
      return { x: 1, y: 1 };
    }
    
    // Wybierz losową pozycję z dostępnych
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    return availablePositions[randomIndex];
  }, [isColliding]);

  const handleGameLose = useCallback(() => {
    setIsGameOver(true);
    setIsGameActive(false);
    setGameOverReason('caught');
  }, []);

  const handleEnemyMoveComplete = useCallback(() => {
    setIsPlayerTurn(true);
  }, []);

  const handlePointCollected = useCallback(() => {
    // Zwiększ punktację
    setScore(prev => prev + 50);
    setPointsCollected(prev => prev + 1);
    setTimeLeft(prev => Math.min(prev + 5, 30));
    
    // Rozpocznij przejście
    setIsTransitioning(true);
    
    // Po 1 sekundzie zakończ przejście i wygeneruj nowy labirynt
    setTimeout(() => {
      setMazeKey(prev => prev + 1); // Zmień klucz, aby wymusić regenerację labiryntu
      
      // Przesuń generowanie nowego punktu po regeneracji labiryntu
      setTimeout(() => {
        setMysteryPoint(getRandomPosition());
        setIsTransitioning(false);
        setIsPlayerTurn(true);
      }, 100); // Krótkie opóźnienie, aby upewnić się, że labirynt został wygenerowany
    }, 1000);
  }, [getRandomPosition]);

  const handleMovement = useCallback((e: KeyboardEvent) => {
    if (!isGameActive || !isPlayerTurn || isTransitioning) return;
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
      
      // Sprawdź kolizje ze ścianami
      const finalPos = isColliding(newPos) ? prev : newPos;
      
      // Jeśli gracz się poruszył (pozycja się zmieniła), zmień turę
      if (finalPos.x !== prev.x || finalPos.y !== prev.y) {
        setIsPlayerTurn(false);
        
        // Sprawdź, czy gracz zebrał punkt
        if (finalPos.x === mysteryPoint.x && finalPos.y === mysteryPoint.y) {
          handlePointCollected();
        }
      }
      
      return finalPos;
    });
  }, [isGameActive, mysteryPoint, isColliding, isPlayerTurn, isTransitioning, handlePointCollected]);

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
    setTimeLeft(30);
    setScore(0);
    setPointsCollected(0);
    setPlayer({ x: 1, y: 1 });
    setMazeKey(prev => prev + 1);
    
    // Generuj punkt po wygenerowaniu labiryntu
    setTimeout(() => {
      setMysteryPoint(getRandomPosition());
      setIsGameActive(true);
      setIsGameOver(false);
      setIsPlayerTurn(true);
    }, 100);
  }, [getRandomPosition]);

  const handlePlayAgain = useCallback(() => {
    setTimeLeft(30);
    setScore(0);
    setPointsCollected(0);
    setPlayer({ x: 1, y: 1 });
    setMazeKey(prev => prev + 1);
    
    // Generuj punkt po wygenerowaniu labiryntu
    setTimeout(() => {
      setMysteryPoint(getRandomPosition());
      setIsGameOver(false);
      setIsGameActive(true);
      setIsPlayerTurn(true);
    }, 100);
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
              {/* <div className="text-white text-xl">Generowanie nowego labiryntu...</div> */}
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
    </main>
  );
}
