import { GameGrid, CellData } from "./stores/useTicTacToe2D";

export type Difficulty = 'easy' | 'medium' | 'hard';

// Check if a player can win in the next move
const findWinningMove = (grid: GameGrid, player: 'X' | 'O'): { row: number; col: number } | null => {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!grid[row][col].piece) {
        // Temporarily place the piece and check for win
        const testGrid = grid.map(r => r.map(c => ({ ...c })));
        testGrid[row][col] = { ...testGrid[row][col], piece: player };
        
        if (checkWinnerAI(testGrid) === player) {
          return { row, col };
        }
      }
    }
  }
  return null;
};

// Simple win checker for AI (copied from game logic)
const checkWinnerAI = (grid: GameGrid): 'X' | 'O' | null => {
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (grid[row][0].piece && 
        grid[row][0].piece === grid[row][1].piece && 
        grid[row][1].piece === grid[row][2].piece) {
      return grid[row][0].piece;
    }
  }
  
  // Check columns
  for (let col = 0; col < 3; col++) {
    if (grid[0][col].piece && 
        grid[0][col].piece === grid[1][col].piece && 
        grid[1][col].piece === grid[2][col].piece) {
      return grid[0][col].piece;
    }
  }
  
  // Check diagonals
  if (grid[0][0].piece && 
      grid[0][0].piece === grid[1][1].piece && 
      grid[1][1].piece === grid[2][2].piece) {
    return grid[0][0].piece;
  }
  
  if (grid[0][2].piece && 
      grid[0][2].piece === grid[1][1].piece && 
      grid[1][1].piece === grid[2][0].piece) {
    return grid[0][2].piece;
  }
  
  return null;
};

// Get all empty cells
const getEmptyCells = (grid: GameGrid): { row: number; col: number }[] => {
  const emptyCells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!grid[row][col].piece) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
};

// Strategic positions (center, corners, edges in order of preference)
const getStrategicMove = (grid: GameGrid): { row: number; col: number } | null => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  // Prefer center
  if (!grid[1][1].piece) {
    return { row: 1, col: 1 };
  }

  // Then corners
  const corners = [
    { row: 0, col: 0 }, { row: 0, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 2 }
  ];
  for (const corner of corners) {
    if (!grid[corner.row][corner.col].piece) {
      return corner;
    }
  }

  // Finally edges
  const edges = [
    { row: 0, col: 1 }, { row: 1, col: 0 },
    { row: 1, col: 2 }, { row: 2, col: 1 }
  ];
  for (const edge of edges) {
    if (!grid[edge.row][edge.col].piece) {
      return edge;
    }
  }

  return null;
};

export const getAIMove = (grid: GameGrid, difficulty: Difficulty = 'medium'): { row: number; col: number } | null => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  const aiPlayer = 'O';
  const humanPlayer = 'X';

  switch (difficulty) {
    case 'easy':
      // 70% random, 30% strategic
      if (Math.random() < 0.7) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
      return getStrategicMove(grid) || emptyCells[Math.floor(Math.random() * emptyCells.length)];

    case 'medium':
      // Always block winning moves, sometimes make winning moves
      const blockMove = findWinningMove(grid, humanPlayer);
      if (blockMove) return blockMove;

      const winMove = findWinningMove(grid, aiPlayer);
      if (winMove && Math.random() < 0.8) return winMove;

      return getStrategicMove(grid) || emptyCells[Math.floor(Math.random() * emptyCells.length)];

    case 'hard':
      // Always make winning moves, always block winning moves
      const winMoveHard = findWinningMove(grid, aiPlayer);
      if (winMoveHard) return winMoveHard;

      const blockMoveHard = findWinningMove(grid, humanPlayer);
      if (blockMoveHard) return blockMoveHard;

      return getStrategicMove(grid) || emptyCells[Math.floor(Math.random() * emptyCells.length)];

    default:
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
};