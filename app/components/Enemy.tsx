'use client';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';

interface EnemyProps {
  player: { x: number, y: number };
  walls: { x: number, y: number, w: number, h: number }[];
  cellSize: number;
  onCatchPlayer: () => void;
  isGameActive: boolean;
  isPlayerTurn: boolean;
  onEnemyMoveComplete: () => void;
  initialPosition?: { x: number, y: number };
  onPositionUpdate?: (pos: { x: number, y: number }) => void;
}

const GRID_SIZE = 15;

const Enemy: React.FC<EnemyProps> = ({ 
  player, 
  walls, 
  cellSize, 
  onCatchPlayer, 
  isGameActive,
  isPlayerTurn,
  onEnemyMoveComplete,
  initialPosition,
  onPositionUpdate
}) => {
  const [position, setPosition] = useState(initialPosition || { x: GRID_SIZE - 2, y: GRID_SIZE - 2 });
  const positionRef = useRef(position);

  // Aktualizuj referencję pozycji przy zmianie
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Aktualizuj pozycję w komponencie nadrzędnym, jeśli funkcja została przekazana
  useEffect(() => {
    if (onPositionUpdate) {
      onPositionUpdate(position);
    }
  }, [position, onPositionUpdate]);

  // Sprawdź, czy aktualna pozycja koliduje ze ścianami nowego labiryntu
  useEffect(() => {
    const currentPos = positionRef.current;
    
    const isCurrentPosColliding = walls.some(wall =>
      currentPos.x >= wall.x &&
      currentPos.x < wall.x + wall.w &&
      currentPos.y >= wall.y &&
      currentPos.y < wall.y + wall.h
    );
    
    // Jeśli pozycja koliduje, znajdź najbliższe wolne miejsce
    if (isCurrentPosColliding) {
      // Szukamy najbliższego wolnego miejsca
      const directions = [
        { dx: 0, dy: -1 }, // góra
        { dx: 0, dy: 1 },  // dół
        { dx: -1, dy: 0 }, // lewo
        { dx: 1, dy: 0 },  // prawo
        { dx: -1, dy: -1 }, // lewo-góra
        { dx: 1, dy: -1 },  // prawo-góra
        { dx: -1, dy: 1 },  // lewo-dół
        { dx: 1, dy: 1 }    // prawo-dół
      ];
      
      // Sprawdzamy coraz dalsze pozycje, aż znajdziemy wolną
      let found = false;
      let distance = 1;
      
      while (!found && distance < 5) { // Ograniczamy do rozsądnej odległości
        for (const dir of directions) {
          const newPos = {
            x: currentPos.x + dir.dx * distance,
            y: currentPos.y + dir.dy * distance
          };
          
          // Sprawdź, czy pozycja jest w granicach i nie koliduje
          if (
            newPos.x >= 0 && newPos.x < GRID_SIZE &&
            newPos.y >= 0 && newPos.y < GRID_SIZE &&
            !walls.some(wall =>
              newPos.x >= wall.x &&
              newPos.x < wall.x + wall.w &&
              newPos.y >= wall.y &&
              newPos.y < wall.y + wall.h
            )
          ) {
            // Znaleziono wolną pozycję
            setPosition(newPos);
            positionRef.current = newPos;
            found = true;
            break;
          }
        }
        distance++;
      }
      
      // Jeśli nie znaleziono wolnej pozycji, użyj domyślnej
      if (!found) {
        const defaultPos = { x: GRID_SIZE - 2, y: GRID_SIZE - 2 };
        setPosition(defaultPos);
        positionRef.current = defaultPos;
      }
    }
  }, [walls]);

  // Precompute wall positions for faster collision checks
  const wallPositions = useMemo(() => {
    const positions = new Set<string>();
    walls.forEach(wall => {
      for (let dx = 0; dx < wall.w; dx++) {
        for (let dy = 0; dy < wall.h; dy++) {
          positions.add(`${wall.x + dx},${wall.y + dy}`);
        }
      }
    });
    return positions;
  }, [walls]);

  const isColliding = useCallback((pos: { x: number, y: number }) => {
    return wallPositions.has(`${pos.x},${pos.y}`);
  }, [wallPositions]);

  const isWithinBounds = useCallback((pos: { x: number, y: number }) => {
    return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
  }, []);

  const checkPlayerCatch = useCallback((enemyPos: { x: number, y: number }) => {
    if (enemyPos.x === player.x && enemyPos.y === player.y) {
      onCatchPlayer();
    }
  }, [player, onCatchPlayer]);

  // BFS to find the shortest path to the player
  const findPathToPlayer = useCallback((startPos: { x: number, y: number }) => {
    const directions = [
      { name: 'up', dx: 0, dy: -1 },
      { name: 'down', dx: 0, dy: 1 },
      { name: 'left', dx: -1, dy: 0 },
      { name: 'right', dx: 1, dy: 0 }
    ];

    const queue: { pos: { x: number, y: number }, path: string[] }[] = [{ pos: startPos, path: [] }];
    const visited = new Set<string>();
    visited.add(`${startPos.x},${startPos.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const { pos, path } = current;

      if (pos.x === player.x && pos.y === player.y) {
        return path; // Found the shortest path
      }

      for (const dir of directions) {
        const newPos = { x: pos.x + dir.dx, y: pos.y + dir.dy };
        if (
          isWithinBounds(newPos) &&
          !isColliding(newPos) &&
          !visited.has(`${newPos.x},${newPos.y}`)
        ) {
          visited.add(`${newPos.x},${newPos.y}`);
          queue.push({ pos: newPos, path: [...path, dir.name] });
        }
      }
    }

    return []; // No path found
  }, [player, isWithinBounds, isColliding]);

  // Zmodyfikowana funkcja moveEnemy
  const moveEnemy = useCallback(() => {
    if (isPlayerTurn) return; // Nie ruszaj się, jeśli to tura gracza
    
    const currentPosition = positionRef.current;
    const pathToPlayer = findPathToPlayer(currentPosition);

    if (pathToPlayer.length > 0) {
      const nextMove = pathToPlayer[0];
      let newPos = {...currentPosition};

      switch (nextMove) {
        case 'up':
          newPos = { x: currentPosition.x, y: currentPosition.y - 1 };
          break;
        case 'down':
          newPos = { x: currentPosition.x, y: currentPosition.y + 1 };
          break;
        case 'left':
          newPos = { x: currentPosition.x - 1, y: currentPosition.y };
          break;
        case 'right':
          newPos = { x: currentPosition.x + 1, y: currentPosition.y };
          break;
      }

      positionRef.current = newPos;
      setPosition(newPos);
      checkPlayerCatch(newPos);
      
      // Po ruchu przeciwnika, przekaż turę z powrotem do gracza
      setTimeout(() => {
        onEnemyMoveComplete();
      }, 300); // Krótkie opóźnienie dla lepszej widoczności ruchu
    } else {
      // Jeśli nie ma ścieżki, również przekaż turę
      onEnemyMoveComplete();
    }
  }, [findPathToPlayer, checkPlayerCatch, isPlayerTurn, onEnemyMoveComplete]);

  // Zmodyfikowany useEffect
  useEffect(() => {
    if (isGameActive && !isPlayerTurn) {
      // Wykonaj ruch przeciwnika po krótkim opóźnieniu
      const timer = setTimeout(() => {
        moveEnemy();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isGameActive, isPlayerTurn, moveEnemy]);

  // Check if enemy catches the player immediately after moving
  useEffect(() => {
    checkPlayerCatch(position);
  }, [position, checkPlayerCatch]);

  return (
    <div  
      className="absolute rounded-full bg-red-600" 
      style={{ 
        width: `${cellSize - 4}px`,
        height: `${cellSize - 4}px`, 
        left: `${position.x * cellSize + 2}px`, 
        top: `${position.y * cellSize + 2}px`, 
        transition: 'left 0.2s linear, top 0.2s linear', 
        zIndex: 10 
      }} 
    />
  );
};

export default Enemy;
