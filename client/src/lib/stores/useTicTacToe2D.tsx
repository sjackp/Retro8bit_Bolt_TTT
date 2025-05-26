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

// Check for winner in 2D with detailed logging
const checkWinner = (grid: GameGrid): 'X' | 'O' | null => {
  console.log("=== CHECKING FOR WINNER ===");
  
  // Print current board state
  console.log("Current board:");
  for (let row = 0; row < 3; row++) {
    const rowStr = `Row ${row}: [${grid[row][0].piece || '_'}, ${grid[row][1].piece || '_'}, ${grid[row][2].piece || '_'}]`;
    console.log(rowStr);
  }
  
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (grid[row][0].piece && 
        grid[row][0].piece === grid[row][1].piece && 
        grid[row][1].piece === grid[row][2].piece) {
      console.log(`🏆 ROW WIN DETECTED: Row ${row} - ${grid[row][0].piece} wins!`);
      console.log(`Winning positions: (${row},0), (${row},1), (${row},2)`);
      return grid[row][0].piece;
    }
  }
  
  // Check columns
  for (let col = 0; col < 3; col++) {
    if (grid[0][col].piece && 
        grid[0][col].piece === grid[1][col].piece && 
        grid[1][col].piece === grid[2][col].piece) {
      console.log(`🏆 COLUMN WIN DETECTED: Column ${col} - ${grid[0][col].piece} wins!`);
      console.log(`Winning positions: (0,${col}), (1,${col}), (2,${col})`);
      return grid[0][col].piece;
    }
  }
  
  // Check main diagonal (top-left to bottom-right)
  if (grid[0][0].piece && 
      grid[0][0].piece === grid[1][1].piece && 
      grid[1][1].piece === grid[2][2].piece) {
    console.log(`🏆 DIAGONAL WIN DETECTED: Main diagonal - ${grid[0][0].piece} wins!`);
    console.log(`Winning positions: (0,0), (1,1), (2,2)`);
    return grid[0][0].piece;
  }
  
  // Check anti-diagonal (top-right to bottom-left)
  if (grid[0][2].piece && 
      grid[0][2].piece === grid[1][1].piece && 
      grid[1][1].piece === grid[2][0].piece) {
    console.log(`🏆 ANTI-DIAGONAL WIN DETECTED: Anti-diagonal - ${grid[0][2].piece} wins!`);
    console.log(`Winning positions: (0,2), (1,1), (2,0)`);
    return grid[0][2].piece;
  }
  
  console.log("❌ No winner detected");
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
      
      const { playPlace, playSuccess, playRemove } = useAudio.getState();
      
      set((state) => {
        console.log(`\n🎯 PLACING PIECE: ${state.currentPlayer} at (${row}, ${col})`);
        console.log(`📊 Current pieces on board: ${state.totalPieces}`);
        console.log(`📋 Piece queue length: ${state.pieceQueue.length}`);
        
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
        
        console.log(`✅ Placed ${state.currentPlayer} piece at (${row}, ${col}) with order ${currentOrder}`);
        
        // Add to queue
        newPieceQueue.push({
          row, col,
          player: state.currentPlayer,
          order: currentOrder
        });
        
        // Check if total pieces exceed 5 - remove the oldest piece on the board
        if (newPieceQueue.length > 5) {
          const oldestPiece = newPieceQueue[0]; // Get the oldest piece on the board
          console.log(`🗑️ REMOVING OLDEST PIECE: ${oldestPiece.player} at (${oldestPiece.row}, ${oldestPiece.col}) with order ${oldestPiece.order}`);
          
          const oldestPieceIndex = newPieceQueue.findIndex(p => 
            p.row === oldestPiece.row && 
            p.col === oldestPiece.col && 
            p.order === oldestPiece.order
          );
          
          if (oldestPieceIndex !== -1) {
            // Remove from grid IMMEDIATELY before win detection
            newGrid[oldestPiece.row][oldestPiece.col] = {
              piece: null,
              placementOrder: 0,
              isBlinking: false,
              fadeProgress: 0
            };
            newTotalPieces--; // Decrease count immediately
            
            newPieceQueue.splice(oldestPieceIndex, 1); // Remove from queue
            console.log(`✅ Removed piece IMMEDIATELY from grid and queue. New queue length: ${newPieceQueue.length}, Total pieces: ${newTotalPieces}`);
            
            // Start fade animation for visual effect only (doesn't affect game logic)
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
        
        console.log(`🔍 WIN CHECK: Queue length = ${newPieceQueue.length}, Total pieces = ${newTotalPieces}`);
        
        // Only check for winner if no pieces are being removed (legitimate win)
        if (newPieceQueue.length <= 5) {
          console.log("✅ Checking for winner (no piece removal happening)");
          winner = checkWinner(newGrid);
          if (winner) {
            console.log(`🎉 GAME OVER: ${winner} wins!`);
            newGamePhase = 'ended';
            newPlayerScores[winner]++;
            playSuccess();
          } else {
            console.log("🎯 No winner, continuing game");
            playPlace();
          }
        } else {
          console.log("⚠️ Skipping win check due to piece removal in progress");
          playPlace();
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