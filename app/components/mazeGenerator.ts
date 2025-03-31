import { useMemo } from 'react';

interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 15;

// Funkcja sprawdzająca, czy pozycja jest w ścianie
const isPosInWall = (pos: Position, wall: Wall): boolean => {
  return pos.x >= wall.x && pos.x < wall.x + wall.w && 
         pos.y >= wall.y && pos.y < wall.y + wall.h;
};

// Funkcja zapewniająca połączenie wszystkich obszarów
function ensureConnectivity(walls: Wall[], gridSize: number): Wall[] {
  // Tworzymy mapę dostępności
  const grid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(true));
  
  // Zaznaczamy ściany na mapie
  walls.forEach(wall => {
    for (let dx = 0; dx < wall.w; dx++) {
      for (let dy = 0; dy < wall.h; dy++) {
        if (wall.x + dx < gridSize && wall.y + dy < gridSize) {
          grid[wall.y + dy][wall.x + dx] = false;
        }
      }
    }
  });
  
  // Sprawdzamy połączenie używając BFS
  const visited = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));
  const queue: Position[] = [];
  
  // Znajdź pierwszy dostępny punkt
  let startFound = false;
  for (let y = 1; y < gridSize - 1 && !startFound; y++) {
    for (let x = 1; x < gridSize - 1 && !startFound; x++) {
      if (grid[y][x]) {
        queue.push({ x, y });
        visited[y][x] = true;
        startFound = true;
      }
    }
  }
  
  // BFS
  const directions = [
    { dx: 0, dy: -1 }, // góra
    { dx: 0, dy: 1 },  // dół
    { dx: -1, dy: 0 }, // lewo
    { dx: 1, dy: 0 }   // prawo
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && 
          grid[ny][nx] && !visited[ny][nx]) {
        visited[ny][nx] = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  
  // Znajdź izolowane obszary i usuń ściany, aby je połączyć
  const wallsToRemove: number[] = [];
  
  // Sprawdź, czy są izolowane obszary
  let hasIsolatedAreas = false;
  for (let y = 1; y < gridSize - 1; y++) {
    for (let x = 1; x < gridSize - 1; x++) {
      if (grid[y][x] && !visited[y][x]) {
        hasIsolatedAreas = true;
        break;
      }
    }
    if (hasIsolatedAreas) break;
  }
  
  // Jeśli są izolowane obszary, usuń losowe ściany, aby je połączyć
  if (hasIsolatedAreas) {
    // Znajdź ściany, które nie są ścianami granicznymi
    const internalWalls = walls.filter((wall, index) => {
      return wall.x > 0 && wall.y > 0 && 
             wall.x + wall.w < gridSize && 
             wall.y + wall.h < gridSize;
    });
    
    // Usuń losowe ściany (około 20% wewnętrznych ścian)
    const numWallsToRemove = Math.max(1, Math.floor(internalWalls.length * 0.2));
    for (let i = 0; i < numWallsToRemove; i++) {
      const randomIndex = Math.floor(Math.random() * internalWalls.length);
      const wallToRemove = internalWalls[randomIndex];
      
      // Znajdź indeks tej ściany w oryginalnej tablicy
      const originalIndex = walls.findIndex(w => 
        w.x === wallToRemove.x && w.y === wallToRemove.y && 
        w.w === wallToRemove.w && w.h === wallToRemove.h
      );
      
      if (originalIndex !== -1 && !wallsToRemove.includes(originalIndex)) {
        wallsToRemove.push(originalIndex);
      }
      
      // Usuń z tablicy wewnętrznych ścian
      internalWalls.splice(randomIndex, 1);
    }
  }
  
  // Usuń ściany
  return walls.filter((_, index) => !wallsToRemove.includes(index));
}

export const generateMaze = (playerPos?: Position, enemyPos?: Position): Wall[] => {
  const mazeWalls: Wall[] = [];
  
  // Funkcja sprawdzająca kolizję
  const isColliding = (newWall: Wall): boolean => {
    return mazeWalls.some(wall =>
      (newWall.x >= wall.x - 1 && newWall.x < wall.x + wall.w + 1) &&
      (newWall.y >= wall.y - 1 && newWall.y < wall.y + wall.h + 1)
    );
  };

  const isWithinBounds = (wall: Wall): boolean => {
    return wall.x >= 1 && wall.y >= 1 && wall.x + wall.w <= GRID_SIZE - 1 && wall.y + wall.h <= GRID_SIZE - 1;
  };

  // Ściany graniczne
  for (let x = 0; x < GRID_SIZE; x++) {
    mazeWalls.push({ x, y: 0, w: 1, h: 1 });
    mazeWalls.push({ x, y: GRID_SIZE - 1, w: 1, h: 1 });
  }
  for (let y = 0; y < GRID_SIZE; y++) {
    mazeWalls.push({ x: 0, y, w: 1, h: 1 });
    mazeWalls.push({ x: GRID_SIZE - 1, y, w: 1, h: 1 });
  }

  // Generowanie wewnętrznych ścian
  const numberOfWalls = Math.floor(Math.random() * 10) + 15;
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
      
      // Sprawdź, czy ściana nie koliduje z graczem lub przeciwnikiem
      const collidesWithPlayer = playerPos && isPosInWall(playerPos, newWall);
      const collidesWithEnemy = enemyPos && isPosInWall(enemyPos, newWall);
      
      attempts++;
    } while ((isColliding(newWall) || !isWithinBounds(newWall) || 
             (playerPos && isPosInWall(playerPos, newWall)) || 
             (enemyPos && isPosInWall(enemyPos, newWall))) && 
             attempts < 50);
    
    if (attempts < 50) {
      mazeWalls.push(newWall);
    }
  }
  
  // Zapewnij połączenie wszystkich obszarów
  const connectedWalls = ensureConnectivity(mazeWalls, GRID_SIZE);
  
  // Upewnij się, że żadna ściana nie koliduje z graczem lub przeciwnikiem
  if (playerPos || enemyPos) {
    return connectedWalls.filter(wall => {
      const collidesWithPlayer = playerPos && isPosInWall(playerPos, wall);
      const collidesWithEnemy = enemyPos && isPosInWall(enemyPos, wall);
      return !collidesWithPlayer && !collidesWithEnemy;
    });
  }
  
  return connectedWalls;
};

export const useGenerateMaze = (playerPos?: Position, enemyPos?: Position) => {
  return useMemo(() => generateMaze(playerPos, enemyPos), [playerPos, enemyPos]);
};
