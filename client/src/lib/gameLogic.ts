export interface CellData {
  piece: 'X' | 'O' | null;
  placementOrder: number;
  isBlinking: boolean;
  fadeProgress: number;
}

export type GameGrid = CellData[][][]; // 3x3x3 grid

export function checkWinner(grid: GameGrid): 'X' | 'O' | null {
  const size = 3;
  
  // Check all possible winning lines in 3D
  for (let player of ['X', 'O'] as const) {
    // Check rows (along x-axis)
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        if (grid[0][y][z].piece === player && 
            grid[1][y][z].piece === player && 
            grid[2][y][z].piece === player) {
          return player;
        }
      }
    }
    
    // Check columns (along y-axis)
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        if (grid[x][0][z].piece === player && 
            grid[x][1][z].piece === player && 
            grid[x][2][z].piece === player) {
          return player;
        }
      }
    }
    
    // Check depth (along z-axis)
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (grid[x][y][0].piece === player && 
            grid[x][y][1].piece === player && 
            grid[x][y][2].piece === player) {
          return player;
        }
      }
    }
    
    // Check 2D diagonals in each layer (z-axis layers)
    for (let z = 0; z < size; z++) {
      // Main diagonal
      if (grid[0][0][z].piece === player && 
          grid[1][1][z].piece === player && 
          grid[2][2][z].piece === player) {
        return player;
      }
      // Anti-diagonal
      if (grid[0][2][z].piece === player && 
          grid[1][1][z].piece === player && 
          grid[2][0][z].piece === player) {
        return player;
      }
    }
    
    // Check 2D diagonals in each layer (y-axis layers)
    for (let y = 0; y < size; y++) {
      // Main diagonal
      if (grid[0][y][0].piece === player && 
          grid[1][y][1].piece === player && 
          grid[2][y][2].piece === player) {
        return player;
      }
      // Anti-diagonal
      if (grid[0][y][2].piece === player && 
          grid[1][y][1].piece === player && 
          grid[2][y][0].piece === player) {
        return player;
      }
    }
    
    // Check 2D diagonals in each layer (x-axis layers)
    for (let x = 0; x < size; x++) {
      // Main diagonal
      if (grid[x][0][0].piece === player && 
          grid[x][1][1].piece === player && 
          grid[x][2][2].piece === player) {
        return player;
      }
      // Anti-diagonal
      if (grid[x][0][2].piece === player && 
          grid[x][1][1].piece === player && 
          grid[x][2][0].piece === player) {
        return player;
      }
    }
    
    // Check 3D diagonals (4 total)
    // Diagonal from (0,0,0) to (2,2,2)
    if (grid[0][0][0].piece === player && 
        grid[1][1][1].piece === player && 
        grid[2][2][2].piece === player) {
      return player;
    }
    
    // Diagonal from (0,0,2) to (2,2,0)
    if (grid[0][0][2].piece === player && 
        grid[1][1][1].piece === player && 
        grid[2][2][0].piece === player) {
      return player;
    }
    
    // Diagonal from (0,2,0) to (2,0,2)
    if (grid[0][2][0].piece === player && 
        grid[1][1][1].piece === player && 
        grid[2][0][2].piece === player) {
      return player;
    }
    
    // Diagonal from (0,2,2) to (2,0,0)
    if (grid[0][2][2].piece === player && 
        grid[1][1][1].piece === player && 
        grid[2][0][0].piece === player) {
      return player;
    }
  }
  
  return null;
}

export function isGridFull(grid: GameGrid): boolean {
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (!grid[x][y][z].piece) {
          return false;
        }
      }
    }
  }
  return true;
}

export function countPieces(grid: GameGrid): number {
  let count = 0;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (grid[x][y][z].piece) {
          count++;
        }
      }
    }
  }
  return count;
}
