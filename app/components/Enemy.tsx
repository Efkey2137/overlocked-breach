'use client';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';

interface EnemyProps {
  player: { x: number, y: number };
  walls: { x: number, y: number, w: number, h: number }[];
  cellSize: number;
  onCatchPlayer: () => void;
  isGameActive: boolean;
}

const GRID_SIZE = 15;

const Enemy: React.FC<EnemyProps> = ({ player, walls, cellSize, onCatchPlayer, isGameActive }) => {
  const [position, setPosition] = useState({ x: GRID_SIZE - 2, y: GRID_SIZE - 2 });
  const positionRef = useRef(position); // Ref to track the current position without causing re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const moveEnemy = useCallback(() => {
    const currentPosition = positionRef.current; // Use the ref to get the current position
    const pathToPlayer = findPathToPlayer(currentPosition);

    if (pathToPlayer.length > 0) {
      const nextMove = pathToPlayer[0]; // Take the first step in the path
      let newPos = currentPosition;

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

      positionRef.current = newPos; // Update the ref with the new position
      setPosition(newPos); // Update state for rendering
      checkPlayerCatch(newPos);
    }
  }, [findPathToPlayer, checkPlayerCatch]);

  // Ensure enemy movement runs independently of external updates
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isGameActive) {
      intervalRef.current = setInterval(moveEnemy, 500); // Adjust interval as needed
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isGameActive, moveEnemy]);

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
