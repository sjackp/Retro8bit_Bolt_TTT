import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";

export type Player = 'X' | 'O';
export type GamePhase = 'playing' | 'ended' | 'draw';

export interface CellData {
  piece: 'X' | 'O' | null;
  placementOrder: number;
  isBlinking: boolean;
  fadeProgress: number;
}

export type GameGrid = CellData[][]; // 3x3 grid

interface TicTacToe2DState {
  grid: GameGrid;
  currentPlayer: Player;
  winner: Player | null;
  gamePhase: GamePhase;
  playerScores: { X: number; O: number };
  totalPieces: number;
  pieceQueue: Array<{ row: number; col: number; player: Player; order: number }>;
  placementOrder: number;
  
  // Actions
  placePiece: (row: number, col: number) => void;
  resetGame: () => void;
  switchPlayer: () => void;
}

// Initialize empty 3x3 grid
const createEmptyGrid = (): GameGrid => {
  const grid: GameGrid = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      grid[row][col] = {
        piece: null,
        placementOrder: 0,
        isBlinking: false,
        fadeProgress: 0
      };
    }
  }
  return grid;
};

// Check for winner in 2D
const checkWinner = (grid: GameGrid): 'X' | 'O' | null => {
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

export const useTicTacToe2D = create<TicTacToe2DState>()(
  subscribeWithSelector((set, get) => ({
    grid: createEmptyGrid(),
    currentPlayer: 'X',
    winner: null,
    gamePhase: 'playing',
    playerScores: { X: 0, O: 0 },
    totalPieces: 0,
    pieceQueue: [],
    placementOrder: 1,
    
    placePiece: (row: number, col: number) => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.grid[row][col].piece) {
        return;
      }
      
      const { playHit, playSuccess } = useAudio.getState();
      
      set((state) => {
        const newGrid = [...state.grid.map(row => [...row])];
        const newPieceQueue = [...state.pieceQueue];
        let newTotalPieces = state.totalPieces + 1;
        const currentOrder = state.placementOrder;
        
        // Place the new piece
        newGrid[row][col] = {
          piece: state.currentPlayer,
          placementOrder: currentOrder,
          isBlinking: false,
          fadeProgress: 0
        };
        
        // Add to queue
        newPieceQueue.push({
          row, col,
          player: state.currentPlayer,
          order: currentOrder
        });
        
        // Check if we need to remove old pieces (FIFO when grid gets full)
        if (newTotalPieces > 6) { // Start removing when more than 6 pieces
          const oldestPiece = newPieceQueue.shift();
          if (oldestPiece) {
            // Start blinking animation for the piece to be removed
            newGrid[oldestPiece.row][oldestPiece.col].isBlinking = true;
            
            // Remove the piece after blinking animation
            setTimeout(() => {
              set((currentState) => {
                const fadeGrid = [...currentState.grid.map(row => [...row])];
                const cellToFade = fadeGrid[oldestPiece.row][oldestPiece.col];
                
                // Start fade animation
                const startTime = performance.now();
                const fadeAnimation = () => {
                  const elapsed = performance.now() - startTime;
                  const progress = Math.min(elapsed / 1000, 1); // 1 second fade
                  
                  cellToFade.fadeProgress = progress;
                  cellToFade.isBlinking = false;
                  
                  if (progress < 1) {
                    requestAnimationFrame(fadeAnimation);
                  } else {
                    // Remove the piece completely
                    set((finalState) => {
                      const finalGrid = [...finalState.grid.map(row => [...row])];
                      finalGrid[oldestPiece.row][oldestPiece.col] = {
                        piece: null,
                        placementOrder: 0,
                        isBlinking: false,
                        fadeProgress: 0
                      };
                      
                      return {
                        grid: finalGrid,
                        totalPieces: finalState.totalPieces - 1
                      };
                    });
                  }
                };
                fadeAnimation();
                
                return { grid: fadeGrid };
              });
            }, 1500); // Wait 1.5 seconds before starting fade
            
            newTotalPieces--; // We're removing one, so adjust count
          }
        }
        
        // Check for winner
        const winner = checkWinner(newGrid);
        let newGamePhase = state.gamePhase;
        let newPlayerScores = { ...state.playerScores };
        
        if (winner) {
          newGamePhase = 'ended';
          newPlayerScores[winner]++;
          playSuccess();
        } else {
          // Check for draw (grid full with no winner)
          const isFull = newPieceQueue.length >= 9;
          if (isFull) {
            newGamePhase = 'draw';
          } else {
            playHit();
          }
        }
        
        return {
          grid: newGrid,
          currentPlayer: winner || newGamePhase === 'draw' ? state.currentPlayer : (state.currentPlayer === 'X' ? 'O' : 'X'),
          winner,
          gamePhase: newGamePhase,
          playerScores: newPlayerScores,
          totalPieces: newTotalPieces,
          pieceQueue: newPieceQueue,
          placementOrder: currentOrder + 1
        };
      });
    },
    
    resetGame: () => {
      set({
        grid: createEmptyGrid(),
        currentPlayer: 'X',
        winner: null,
        gamePhase: 'playing',
        totalPieces: 0,
        pieceQueue: [],
        placementOrder: 1
      });
    },
    
    switchPlayer: () => {
      set((state) => ({
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X'
      }));
    }
  }))
);