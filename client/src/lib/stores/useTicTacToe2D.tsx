import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";
import { getAIMove } from "../aiLogic";

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
  isAIMode: boolean;
  isAIThinking: boolean;
  isMultiplayerMode: boolean;
  opponentConnected: boolean;
  isMyTurn: boolean;
  myPlayer: Player;
  
  // Actions
  placePiece: (row: number, col: number) => void;
  resetGame: () => void;
  switchPlayer: () => void;
  setAIMode: (enabled: boolean) => void;
  setMultiplayerMode: (enabled: boolean, isHost: boolean) => void;
  setOpponentConnected: (connected: boolean) => void;
  setMyTurn: (isMyTurn: boolean) => void;
  handleOpponentMove: (row: number, col: number) => void;
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
    isAIMode: false,
    isAIThinking: false,
    isMultiplayerMode: false,
    opponentConnected: false,
    isMyTurn: true,
    myPlayer: 'X',
    
    placePiece: (row: number, col: number) => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.grid[row][col].piece) {
        return;
      }
      
      // In multiplayer mode, check if it's the player's turn and they're playing as the current player
      if (state.isMultiplayerMode && (!state.isMyTurn || state.currentPlayer !== state.myPlayer)) {
        return;
      }
      
      // Check if total pieces are at maximum (5) - if so, start blinking the oldest piece
      if (state.pieceQueue.length >= 5) {
        const oldestPiece = state.pieceQueue[0];
        set((prevState) => {
          const blinkGrid = [...prevState.grid.map(row => [...row])];
          blinkGrid[oldestPiece.row][oldestPiece.col].isBlinking = true;
          return { grid: blinkGrid };
        });
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
        
        // Check if total pieces exceed 5 - remove the oldest piece on the board
        if (newPieceQueue.length > 5) {
          const oldestPiece = newPieceQueue[0]; // Get the oldest piece on the board
          const oldestPieceIndex = newPieceQueue.findIndex(p => 
            p.row === oldestPiece.row && 
            p.col === oldestPiece.col && 
            p.order === oldestPiece.order
          );
          
          if (oldestPieceIndex !== -1) {
            newPieceQueue.splice(oldestPieceIndex, 1); // Remove from queue
            
            // Start fade animation immediately (piece was already blinking)
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
            }, 500); // Shorter delay since piece was already blinking
          }
        }
        
        // Check for winner - but only count wins achieved by placement, not piece removal
        let winner = null;
        let newGamePhase = state.gamePhase;
        let newPlayerScores = { ...state.playerScores };
        
        // Only check for winner if no pieces are being removed (legitimate win)
        if (newPieceQueue.length <= 5) {
          winner = checkWinner(newGrid);
          if (winner) {
            newGamePhase = 'ended';
            newPlayerScores[winner]++;
            playSuccess();
          } else {
            playHit();
          }
        } else {
          // If pieces are being removed, don't check for winner to prevent false wins
          playHit();
        }
        
        const newCurrentPlayer = winner ? state.currentPlayer : (state.currentPlayer === 'X' ? 'O' : 'X');
        
        const newState = {
          grid: newGrid,
          currentPlayer: newCurrentPlayer,
          winner,
          gamePhase: newGamePhase,
          playerScores: newPlayerScores,
          totalPieces: newTotalPieces,
          pieceQueue: newPieceQueue,
          placementOrder: currentOrder + 1
        };
        
        // Trigger AI move if it's AI mode and AI's turn
        if (state.isAIMode && !winner && newCurrentPlayer === 'O' && newGamePhase === 'playing') {
          setTimeout(() => {
            set({ isAIThinking: true });
            
            // AI thinking delay for better UX
            setTimeout(() => {
              const currentState = get();
              const aiMove = getAIMove(currentState.grid);
              
              if (aiMove && currentState.currentPlayer === 'O' && currentState.gamePhase === 'playing') {
                set({ isAIThinking: false });
                currentState.placePiece(aiMove.row, aiMove.col);
              } else {
                set({ isAIThinking: false });
              }
            }, 800); // AI thinking time
          }, 100);
        }
        
        return newState;
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
        placementOrder: 1,
        isAIThinking: false
      });
    },
    
    switchPlayer: () => {
      set((state) => ({
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X'
      }));
    },
    
    setAIMode: (enabled: boolean) => {
      set({
        isAIMode: enabled,
        isAIThinking: false
      });
    },
    
    setMultiplayerMode: (enabled: boolean, isHost: boolean) => {
      set({
        isMultiplayerMode: enabled,
        myPlayer: isHost ? 'X' : 'O',
        isMyTurn: isHost, // Host goes first
        opponentConnected: false
      });
    },
    
    setOpponentConnected: (connected: boolean) => {
      set({ opponentConnected: connected });
    },
    
    setMyTurn: (isMyTurn: boolean) => {
      set({ isMyTurn });
    },
    
    handleOpponentMove: (row: number, col: number) => {
      const state = get();
      if (state.gamePhase !== 'playing' || state.grid[row][col].piece) {
        return;
      }
      
      // Force the move for the opponent
      set((state) => {
        const newGrid = [...state.grid.map(row => [...row])];
        const newPieceQueue = [...state.pieceQueue];
        let newTotalPieces = state.totalPieces + 1;
        const currentOrder = state.placementOrder;
        
        // Place the opponent's piece
        newGrid[row][col] = {
          piece: state.currentPlayer,
          placementOrder: currentOrder,
          isBlinking: false,
          fadeProgress: 0
        };
        
        newPieceQueue.push({
          row, col,
          player: state.currentPlayer,
          order: currentOrder
        });
        
        // Handle piece removal if needed
        if (newTotalPieces > 5) {
          const oldestPiece = newPieceQueue.shift();
          if (oldestPiece) {
            newGrid[oldestPiece.row][oldestPiece.col].isBlinking = true;
            
            setTimeout(() => {
              set((currentState) => {
                const fadeGrid = [...currentState.grid.map(row => [...row])];
                const cellToFade = fadeGrid[oldestPiece.row][oldestPiece.col];
                
                const startTime = performance.now();
                const fadeAnimation = () => {
                  const elapsed = performance.now() - startTime;
                  const progress = Math.min(elapsed / 1000, 1);
                  
                  cellToFade.fadeProgress = progress;
                  cellToFade.isBlinking = false;
                  
                  if (progress < 1) {
                    requestAnimationFrame(fadeAnimation);
                  } else {
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
            }, 1500);
          }
        }
        
        // Check for winner
        const winner = checkWinner(newGrid);
        let newGamePhase = state.gamePhase;
        let newPlayerScores = { ...state.playerScores };
        
        if (winner) {
          newGamePhase = 'ended';
          newPlayerScores[winner]++;
        }
        
        return {
          grid: newGrid,
          currentPlayer: winner ? state.currentPlayer : (state.currentPlayer === 'X' ? 'O' : 'X'),
          winner,
          gamePhase: newGamePhase,
          playerScores: newPlayerScores,
          totalPieces: newTotalPieces,
          pieceQueue: newPieceQueue,
          placementOrder: currentOrder + 1,
          isMyTurn: !state.isMyTurn // Switch turns
        };
      });
    }
  }))
);