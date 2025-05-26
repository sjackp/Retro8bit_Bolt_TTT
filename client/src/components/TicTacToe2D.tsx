import { useState, useEffect } from "react";
import { useTicTacToe2D } from "@/lib/stores/useTicTacToe2D";
import { useAudio } from "@/lib/stores/useAudio";
import { useGameMode } from "@/lib/stores/useGameMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Bot, Users, Trophy } from "lucide-react";

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
    let cellClass = "w-24 h-24 border-2 flex items-center justify-center text-4xl font-bold font-mono cursor-pointer transition-all duration-200 relative overflow-hidden rounded-lg";
    
    if (isEmpty) {
      cellClass += " border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/10 hover:shadow-lg hover:shadow-purple-400/30 hover:scale-105";
    } else {
      cellClass += " cursor-default";
    }

    if (cellData.piece === 'X') {
      cellContent = "X";
      cellClass += " text-pink-400 border-pink-400 bg-pink-400/20 shadow-lg shadow-pink-400/50";
    } else if (cellData.piece === 'O') {
      cellContent = "O";
      cellClass += " text-cyan-400 border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50";
    }

    // Apply animations
    let opacity = 1 - cellData.fadeProgress;
    if (cellData.isBlinking) {
      cellClass += " animate-pulse border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50";
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden retro-scanlines">
      {/* 8-bit style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              #00ff00 0px, #00ff00 2px,
              transparent 2px, transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              #00ff00 0px, #00ff00 2px,
              transparent 2px, transparent 8px
            )
          `,
          backgroundSize: '16px 16px'
        }}></div>
      </div>
      
      {/* 8-bit style top and bottom borders */}
      <div className="absolute top-0 left-0 w-full h-2 bg-green-500 animate-retro-glow"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-green-500 animate-retro-glow"></div>
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-8 relative z-10">
        <Card className="bg-black border-4 border-green-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-400 flex items-center gap-2 pixel-font tracking-wider uppercase">
              {isAIMode ? <Bot className="h-5 w-5 text-yellow-400" /> : <Users className="h-5 w-5 text-yellow-400" />}
              <span className="animate-retro-glow">
                {isAIMode ? "vs CPU" : gameMode === 'multiplayer' ? `ROOM ${roomCode}` : "TIC-TAC-TOE"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gamePhase === 'playing' && !winner && (
                <div className="flex items-center gap-2">
                  <span className="text-green-400 pixel-font text-sm">PLAYER:</span>
                  <Badge className={`pixel-font font-bold border-2 ${currentPlayer === 'X' ? 
                    'bg-red-500 border-red-600 text-white animate-retro-glow' : 
                    'bg-blue-500 border-blue-600 text-white animate-retro-glow'}`}>
                    {isAIMode ? (currentPlayer === 'X' ? 'YOU' : 'CPU') : currentPlayer}
                  </Badge>
                  {isAIThinking && currentPlayer === 'O' && (
                    <span className="text-yellow-400 text-sm animate-pixel-blink pixel-font">CPU THINKING...</span>
                  )}
                </div>
              )}
              
              {winner && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400 animate-bounce" />
                  <span className="text-yellow-400 pixel-font font-bold text-lg animate-pixel-blink">
                    {isAIMode ? 
                      (winner === 'X' ? 'VICTORY!' : 'GAME OVER!') :
                      `PLAYER ${winner} WINS!`
                    }
                  </span>
                </div>
              )}
              
              <div className="text-sm text-green-400 pixel-font">
                PIECES: {totalPieces}/6
              </div>
              
              {totalPieces >= 3 && (
                <div className="text-xs text-yellow-400 pixel-font animate-pixel-blink">
                  ⚠ OLDEST FADE
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={onBackToMenu}
            className="bg-black border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black pixel-font animate-retro-glow"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="bg-black border-4 border-green-400 text-green-400 hover:bg-green-400 hover:text-black pixel-font animate-retro-glow"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={resetGame}
            className="bg-black border-4 border-red-400 text-red-400 hover:bg-red-400 hover:text-black pixel-font animate-retro-glow"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Score Display */}
      <Card className="bg-black/90 backdrop-blur-sm border-2 border-purple-500 shadow-lg shadow-purple-500/50 mb-8 relative z-10">
        <CardContent className="pt-4">
          <div className="flex gap-4 text-center justify-center">
            <div className="p-4 rounded-lg bg-gradient-to-b from-pink-500/20 to-pink-600/20 border border-pink-400">
              <div className="text-3xl font-bold text-pink-400 font-mono">{playerScores.X}</div>
              <div className="text-sm text-pink-300 font-mono">{isAIMode ? "YOU (X)" : "PLAYER X"}</div>
            </div>
            <div className="text-2xl text-purple-400 font-mono self-center">VS</div>
            <div className="p-4 rounded-lg bg-gradient-to-b from-cyan-500/20 to-cyan-600/20 border border-cyan-400">
              <div className="text-3xl font-bold text-cyan-400 font-mono">{playerScores.O}</div>
              <div className="text-sm text-cyan-300 font-mono">{isAIMode ? "AI (O)" : "PLAYER O"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 p-6 bg-black/90 backdrop-blur-sm rounded-lg border-2 border-purple-500 shadow-lg shadow-purple-500/50 mb-8 relative z-10">
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