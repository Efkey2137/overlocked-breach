'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';

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
  const [lastDirection, setLastDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isColliding = useCallback((pos: { x: number, y: number }) => {
    return walls.some(wall =>  
      pos.x >= wall.x &&
      pos.x < wall.x + wall.w &&
      pos.y >= wall.y &&
      pos.y < wall.y + wall.h
    );
  }, [walls]);

  const isWithinBounds = useCallback((pos: { x: number, y: number }) => {
    return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
  }, []);

  const checkPlayerCatch = useCallback((enemyPos: { x: number, y: number }) => {
    if (enemyPos.x === player.x && enemyPos.y === player.y) {
      onCatchPlayer();
    }
  }, [player, onCatchPlayer]);

  const getAvailableDirections = useCallback((pos: { x: number, y: number }) => {
    const directions = [
      { name: 'up', newPos: { x: pos.x, y: pos.y - 1 } },
      { name: 'down', newPos: { x: pos.x, y: pos.y + 1 } },
      { name: 'left', newPos: { x: pos.x - 1, y: pos.y } },
      { name: 'right', newPos: { x: pos.x + 1, y: pos.y } }
    ];
    return directions.filter(dir => isWithinBounds(dir.newPos) && !isColliding(dir.newPos));
  }, [isWithinBounds, isColliding]);

  const moveEnemy = useCallback(() => {
    setPosition(prev => {
      const availableDirections = getAvailableDirections(prev);
      if (availableDirections.length === 0) {
        return prev;
      }
      let newDirection;
      if (lastDirection) {
        const canContinue = availableDirections.find(dir => dir.name === lastDirection);
        if (canContinue) {
          newDirection = canContinue;
        }
      }
      if (!newDirection) {
        let oppositeDirection = null;
        if (lastDirection === 'up') oppositeDirection = 'down';
        else if (lastDirection === 'down') oppositeDirection = 'up';
        else if (lastDirection === 'left') oppositeDirection = 'right';
        else if (lastDirection === 'right') oppositeDirection = 'left';
        const filteredDirections = availableDirections.length > 1 ? availableDirections.filter(dir => dir.name !== oppositeDirection) : availableDirections;
        const randomIndex = Math.floor(Math.random() * filteredDirections.length);
        newDirection = filteredDirections[randomIndex];
      }
      setLastDirection(newDirection.name as 'up' | 'down' | 'left' | 'right');
      const newPos = newDirection.newPos;
      checkPlayerCatch(newPos);
      return newPos;
    });
  }, [getAvailableDirections, lastDirection, checkPlayerCatch]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isGameActive) {
      intervalRef.current = setInterval(moveEnemy, 500);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isGameActive, moveEnemy]);

  useEffect(() => {
    if (position.x === player.x && position.y === player.y) {
      onCatchPlayer();
    }
  }, [position, player, onCatchPlayer]);

  return (
    <div  
      className="absolute rounded-full bg-red-600" 
      style={{ 
        width: `${cellSize - 4}px`,
        height: `${cellSize - 4}px`, 
        left: `${position.x * cellSize + 2}px`, 
        top: `${position.y * cellSize + 2}px`, 
        transition: 'left 0.2s, top 0.2s', 
        zIndex: 10 
      }} 
    />
  );
};

export default Enemy;
