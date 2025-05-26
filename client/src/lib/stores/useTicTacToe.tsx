import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { checkWinner, type GameGrid, type CellData } from "@/lib/gameLogic";
import { useAudio } from "./useAudio";

export type Player = 'X' | 'O';
export type GamePhase = 'playing' | 'ended' | 'draw';

interface TicTacToeState {
  grid: GameGrid;
  currentPlayer: Player;
  winner: Player | null;
  gamePhase: GamePhase;
  playerScores: { X: number; O: number };
  totalPieces: number;
  pieceQueue: Array<{ x: number; y: number; z: number; player: Player; order: number }>;
  placementOrder: number;
  
  // Actions
  placePiece: (x: number, y: number, z: number) => void;
  resetGame: () => void;
  switchPlayer: () => void;
}

// Initialize empty 3x3x3 grid
const createEmptyGrid = (): GameGrid => {
  const grid: GameGrid = [];
  for (let x = 0; x < 3; x++) {
    grid[x] = [];
    for (let y = 0; y < 3; y++) {
      grid[x][y] = [];
      for (let z = 0; z < 3; z++) {
        grid[x][y][z] = {
          piece: null,
          placementOrder: 0,
          isBlinking: false,
          fadeProgress: 0
        };
      }
    }
  }
  return grid;
};

export const useTicTacToe = create<TicTacToeState>()(
  subscribeWithSelector((set, get) => ({
    grid: createEmptyGrid(),
    currentPlayer: 'X',
    winner: null,
    gamePhase: 'playing',
    playerScores: { X: 0, O: 0 },
    totalPieces: 0,
    pieceQueue: [],
    placementOrder: 1,
    
    placePiece: (x: number, y: number, z: number) => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.grid[x][y][z].piece) {
        return;
      }
      
      const { playHit, playSuccess } = useAudio.getState();
      
      set((state) => {
        const newGrid = [...state.grid];
        const newPieceQueue = [...state.pieceQueue];
        let newTotalPieces = state.totalPieces + 1;
        const currentOrder = state.placementOrder;
        
        // Place the new piece
        newGrid[x][y][z] = {
          piece: state.currentPlayer,
          placementOrder: currentOrder,
          isBlinking: false,
          fadeProgress: 0
        };
        
        // Add to queue
        newPieceQueue.push({
          x, y, z,
          player: state.currentPlayer,
          order: currentOrder
        });
        
        // Check if we need to remove old pieces (FIFO when grid gets full)
        if (newTotalPieces > 18) { // Start removing when more than 18 pieces
          const oldestPiece = newPieceQueue.shift();
          if (oldestPiece) {
            // Start blinking animation for the piece to be removed
            newGrid[oldestPiece.x][oldestPiece.y][oldestPiece.z].isBlinking = true;
            
            // Remove the piece after blinking animation
            setTimeout(() => {
              set((currentState) => {
                const fadeGrid = [...currentState.grid];
                const cellToFade = fadeGrid[oldestPiece.x][oldestPiece.y][oldestPiece.z];
                
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
                      const finalGrid = [...finalState.grid];
                      finalGrid[oldestPiece.x][oldestPiece.y][oldestPiece.z] = {
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
          const isFull = newPieceQueue.length >= 27;
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
