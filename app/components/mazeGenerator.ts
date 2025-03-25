import { useMemo } from 'react';

interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GRID_SIZE = 15;

export const generateMaze = (): Wall[] => {
  const mazeWalls: Wall[] = [];
  
  // Funkcja sprawdzająca, czy nowa ściana koliduje z istniejącymi
  const isColliding = (newWall: Wall): boolean => {
    return mazeWalls.some(wall => 
      (newWall.x >= wall.x - 1 && newWall.x < wall.x + wall.w + 1) &&
      (newWall.y >= wall.y - 1 && newWall.y < wall.y + wall.h + 1)
    );
  };

  // Ściany graniczne
  for (let x = 0; x < GRID_SIZE; x++) {
    mazeWalls.push({ x, y: 0, w: 1, h: 1 });
    mazeWalls.push({ x, y: GRID_SIZE-1, w: 1, h: 1 });
  }
  for (let y = 0; y < GRID_SIZE; y++) {
    mazeWalls.push({ x: 0, y, w: 1, h: 1 });
    mazeWalls.push({ x: GRID_SIZE-1, y, w: 1, h: 1 });
  }

  // Generowanie wewnętrznych ścian
  const numberOfWalls = Math.floor(Math.random() * 10) + 15; // 15-25 ścian
  
  for (let i = 0; i < numberOfWalls; i++) {
    let newWall: Wall;
    let attempts = 0;
    do {
      const x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      const y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      const isHorizontal = Math.random() > 0.5;
      
      if (isHorizontal) {
        const width = Math.floor(Math.random() * 3) + 2;
        newWall = { x, y, w: width, h: 1 };
      } else {
        const height = Math.floor(Math.random() * 3) + 2;
        newWall = { x, y, w: 1, h: height };
      }
      attempts++;
    } while (isColliding(newWall) && attempts < 50);

    if (attempts < 50) {
      mazeWalls.push(newWall);
    }
  }
  
  return mazeWalls;
};

export const useGenerateMaze = () => {
  return useMemo(() => generateMaze(), []);
};
