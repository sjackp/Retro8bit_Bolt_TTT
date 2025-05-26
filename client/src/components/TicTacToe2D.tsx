import { useState, useEffect } from "react";
import { useTicTacToe2D } from "@/lib/stores/useTicTacToe2D";
import { useAudio } from "@/lib/stores/useAudio";
import { useGameMode } from "@/lib/stores/useGameMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Bot, Users } from "lucide-react";

interface TicTacToe2DProps {
  onBackToMenu: () => void;
}

export default function TicTacToe2D({ onBackToMenu }: TicTacToe2DProps) {
  const { 
    grid, 
    currentPlayer, 
    winner, 
    gamePhase, 
    resetGame, 
    placePiece,
    playerScores,
    totalPieces,
    pieceQueue,
    isAIMode,
    isAIThinking
  } = useTicTacToe2D();
  
  const { gameMode, roomCode } = useGameMode();
  const { isMuted, toggleMute, setHitSound, setSuccessSound } = useAudio();

  // Initialize audio
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  const handleCellClick = (row: number, col: number) => {
    if (gamePhase === 'playing' && !grid[row][col].piece && !isAIThinking) {
      // In AI mode, only allow human player (X) to move
      if (isAIMode && currentPlayer === 'O') return;
      placePiece(row, col);
    }
  };

  const renderCell = (row: number, col: number) => {
    const cellData = grid[row][col];
    const isEmpty = !cellData.piece;
    
    let cellContent = "";
    let cellClass = "w-24 h-24 border-2 border-gray-600 flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 relative overflow-hidden";
    
    if (isEmpty) {
      cellClass += " hover:bg-gray-700 hover:border-gray-500";
    } else {
      cellClass += " cursor-default";
    }

    if (cellData.piece === 'X') {
      cellContent = "X";
      cellClass += " text-red-400";
    } else if (cellData.piece === 'O') {
      cellContent = "O";
      cellClass += " text-blue-400";
    }

    // Apply animations
    let opacity = 1 - cellData.fadeProgress;
    if (cellData.isBlinking) {
      cellClass += " animate-pulse";
    }

    const cellStyle = {
      opacity: opacity,
      transform: `scale(${1 - cellData.fadeProgress * 0.5})`,
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    };

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => handleCellClick(row, col)}
        style={cellStyle}
      >
        {cellContent}
        {cellData.piece && (
          <div className="absolute bottom-1 right-1 text-xs text-gray-500">
            {cellData.placementOrder}
          </div>
        )}
        {isEmpty && gamePhase === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">
            {currentPlayer}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-8">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              {isAIMode ? <Bot className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              {isAIMode ? "vs AI" : gameMode === 'multiplayer' ? `Room: ${roomCode}` : "2D Tic-Tac-Toe"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gamePhase === 'playing' && !winner && (
                <div className="flex items-center gap-2">
                  <span className="text-white">Current Player:</span>
                  <Badge variant={currentPlayer === 'X' ? "destructive" : "default"}>
                    {isAIMode ? (currentPlayer === 'X' ? 'You' : 'AI') : currentPlayer}
                  </Badge>
                  {isAIThinking && currentPlayer === 'O' && (
                    <span className="text-yellow-400 text-sm animate-pulse">AI thinking...</span>
                  )}
                </div>
              )}
              
              {winner && (
                <div className="flex items-center gap-2">
                  <span className="text-white">Winner:</span>
                  <Badge variant={winner === 'X' ? "destructive" : "default"}>
                    {winner}
                  </Badge>
                </div>
              )}
              
              <div className="text-sm text-gray-300">
                Total pieces: {totalPieces}/6
              </div>
              
              {totalPieces >= 3 && (
                <div className="text-xs text-yellow-400">
                  Each player has 3 pieces max!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onBackToMenu}
            className="bg-black/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="bg-black/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-800"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={resetGame}
            className="bg-black/80 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Score Display */}
      <Card className="bg-black/80 backdrop-blur-sm border-gray-700 mb-8">
        <CardContent className="pt-4">
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-400">{playerScores.X}</div>
              <div className="text-sm text-gray-300">{isAIMode ? "You (X)" : "Player X"}</div>
            </div>
            <div className="text-2xl text-gray-500">-</div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{playerScores.O}</div>
              <div className="text-sm text-gray-300">{isAIMode ? "AI (O)" : "Player O"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-black/50 backdrop-blur-sm rounded-lg border border-gray-700 mb-8">
        {[0, 1, 2].map(row => (
          [0, 1, 2].map(col => renderCell(row, col))
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-black/80 backdrop-blur-sm border-gray-700 max-w-md">
        <CardContent className="pt-4">
          <div className="text-sm text-gray-300 space-y-1 text-center">
            <div>• Each player has exactly 3 pieces</div>
            <div>• Click cells to place your pieces</div>
            <div>• Get 3 in a row to win</div>
            <div>• When placing a 4th piece, your oldest disappears</div>
          </div>
        </CardContent>
      </Card>

      {/* Game Over Overlay - Only for winners, no draws */}
      {winner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-black/90 backdrop-blur-sm border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-white">
                  Player {winner} Wins!
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetGame} variant="default">
                    Play Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}