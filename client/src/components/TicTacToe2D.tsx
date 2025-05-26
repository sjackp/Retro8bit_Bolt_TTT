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
  const [showBoard, setShowBoard] = useState(false);

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
    let cellClass = "w-24 h-24 border-4 flex items-center justify-center text-4xl font-bold pixel-font cursor-pointer transition-all duration-200 relative overflow-hidden";
    
    if (isEmpty) {
      cellClass += " border-orange-400 hover:border-yellow-400 hover:bg-orange-400/20 hover:animate-retro-glow";
    } else {
      cellClass += " cursor-default";
    }

    if (cellData.piece === 'X') {
      cellContent = "X";
      cellClass += " text-white bg-red-600 border-red-700";
    } else if (cellData.piece === 'O') {
      cellContent = "O";
      cellClass += " text-white bg-blue-600 border-blue-700";
    }

    // Apply animations
    let opacity = 1 - cellData.fadeProgress;
    if (cellData.isBlinking) {
      cellClass += " animate-pixel-blink border-yellow-400 bg-yellow-400";
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
        <span className="flex items-center justify-center w-full h-full">
          {cellContent}
        </span>
        {isEmpty && gamePhase === 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-30 text-orange-300 pixel-font">
            {currentPlayer}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden retro-scanlines">
      {/* 8-bit Circuit Board Background */}
      <div className="absolute inset-0 retro-circuit-bg"></div>
      
      {/* 8-bit style top and bottom borders */}
      <div className="absolute top-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-8 relative z-10">
        <Card className="bg-black border-4 border-orange-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-400 flex items-center gap-2 pixel-font tracking-wider uppercase">
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
                  <span className="text-orange-400 pixel-font text-sm">PLAYER:</span>
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
              
              <div className="text-sm text-orange-400 pixel-font">
                PIECES: {totalPieces}/5
              </div>
              
              {totalPieces >= 5 && (
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
            className="bg-black border-4 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black pixel-font animate-retro-glow"
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
      <Card className="bg-black border-4 border-orange-500 shadow-lg mb-8 relative z-10">
        <CardContent className="pt-4">
          <div className="flex gap-4 text-center justify-center">
            <div className="p-4 bg-red-600 border-4 border-red-700">
              <div className="text-3xl font-bold text-white pixel-font">{playerScores.X}</div>
              <div className="text-sm text-white pixel-font">{isAIMode ? "YOU" : "P1"}</div>
            </div>
            <div className="text-2xl text-orange-400 pixel-font self-center animate-retro-glow">VS</div>
            <div className="p-4 bg-blue-600 border-4 border-blue-700">
              <div className="text-3xl font-bold text-white pixel-font">{playerScores.O}</div>
              <div className="text-sm text-white pixel-font">{isAIMode ? "CPU" : "P2"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-black border-4 border-orange-500 shadow-lg mb-8 relative z-10">
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
      {winner && !showBoard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-black/90 backdrop-blur-sm border-orange-500 border-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-white pixel-font animate-retro-glow">
                  {isAIMode && winner === 'O' ? 'CPU WINS!' : 
                   isAIMode && winner === 'X' ? 'YOU WIN!' : 
                   `PLAYER ${winner} WINS!`}
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => setShowBoard(true)} 
                    variant="outline"
                    className="bg-black border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black pixel-font"
                  >
                    View Board
                  </Button>
                  <Button 
                    onClick={resetGame} 
                    variant="default"
                    className="bg-orange-500 hover:bg-orange-600 text-black pixel-font"
                  >
                    Play Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Board View Overlay */}
      {winner && showBoard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-black/90 backdrop-blur-sm border-orange-500 border-4 max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-orange-400 pixel-font">
                Final Board - {isAIMode && winner === 'O' ? 'CPU Won' : 
                             isAIMode && winner === 'X' ? 'You Won' : 
                             `Player ${winner} Won`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 p-4 mb-4">
                {[0, 1, 2].map(row => (
                  [0, 1, 2].map(col => {
                    const cellData = grid[row][col];
                    const isEmpty = !cellData.piece;
                    
                    let cellClass = "w-16 h-16 bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-3xl font-bold pixel-font relative cursor-default";
                    let cellContent = null;

                    if (!isEmpty) {
                      if (cellData.piece === 'X') {
                        cellClass += " text-red-400 border-red-500";
                        cellContent = "✕";
                      } else {
                        cellClass += " text-blue-400 border-blue-500";
                        cellContent = "◯";
                      }
                    }

                    return (
                      <div key={`view-${row}-${col}`} className={cellClass}>
                        <span className="flex items-center justify-center w-full h-full">
                          {cellContent}
                        </span>
                      </div>
                    );
                  })
                ))}
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => setShowBoard(false)} 
                  variant="outline"
                  className="bg-black border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black pixel-font"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    setShowBoard(false);
                    resetGame();
                  }} 
                  variant="default"
                  className="bg-orange-500 hover:bg-orange-600 text-black pixel-font"
                >
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}