import { Html } from "@react-three/drei";
import { useTicTacToe } from "@/lib/stores/useTicTacToe";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export default function GameUI() {
  const { 
    currentPlayer, 
    winner, 
    gamePhase, 
    resetGame, 
    playerScores,
    totalPieces,
    pieceQueue 
  } = useTicTacToe();
  
  const { isMuted, toggleMute } = useAudio();

  return (
    <Html fullscreen>
      <div className="absolute inset-0 pointer-events-none">
        {/* Top UI Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Game Status */}
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">3D Tic-Tac-Toe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gamePhase === 'playing' && !winner && (
                  <div className="flex items-center gap-2">
                    <span className="text-white">Current Player:</span>
                    <Badge variant={currentPlayer === 'X' ? "destructive" : "default"}>
                      {currentPlayer}
                    </Badge>
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
                
                {gamePhase === 'draw' && (
                  <Badge variant="secondary">Draw!</Badge>
                )}
                
                <div className="text-sm text-gray-300">
                  Pieces: {totalPieces}/27
                </div>
                
                {totalPieces >= 18 && (
                  <div className="text-xs text-yellow-400">
                    Grid filling up! Oldest pieces will disappear.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex gap-2">
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
            <CardContent className="pt-4">
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-400">{playerScores.X}</div>
                  <div className="text-sm text-gray-300">Player X</div>
                </div>
                <div className="text-2xl text-gray-500">-</div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{playerScores.O}</div>
                  <div className="text-sm text-gray-300">Player O</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <Card className="bg-black/80 backdrop-blur-sm border-gray-700">
            <CardContent className="pt-4">
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Click cells to place pieces</div>
                <div>• Get 3 in a row to win</div>
                <div>• Oldest pieces disappear when grid fills</div>
                <div>• Use mouse to rotate and zoom camera</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Over Overlay */}
        {(winner || gamePhase === 'draw') && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <Card className="bg-black/90 backdrop-blur-sm border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {winner ? `Player ${winner} Wins!` : "It's a Draw!"}
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
    </Html>
  );
}
