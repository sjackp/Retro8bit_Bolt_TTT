import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Bot, Plus, LogIn } from "lucide-react";

interface GameModeSelectorProps {
  onModeSelect: (mode: 'ai' | 'multiplayer', roomCode?: string, isHost?: boolean) => void;
}

export default function GameModeSelector({ onModeSelect }: GameModeSelectorProps) {
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRoomCode(code);
    setIsCreatingRoom(true);
  };

  const handleCreateRoom = () => {
    generateRoomCode();
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      onModeSelect('multiplayer', roomCode.trim(), false);
    }
  };

  const handleStartWithGeneratedRoom = () => {
    onModeSelect('multiplayer', generatedRoomCode, true);
  };

  if (showMultiplayerOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-700 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">Multiplayer Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCreatingRoom ? (
              <>
                {/* Create Room */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Create Room</h3>
                  <Button 
                    onClick={handleCreateRoom}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Room
                  </Button>
                </div>

                <div className="border-t border-gray-600 pt-6">
                  {/* Join Room */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Join Room</h3>
                    <div className="space-y-2">
                      <Label htmlFor="roomCode" className="text-gray-300">Room Code</Label>
                      <Input
                        id="roomCode"
                        type="text"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="bg-gray-800 border-gray-600 text-white"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim()}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Join Room
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Room Created */
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-white">Room Created!</h3>
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="text-sm text-gray-300 mb-2">Share this room code:</div>
                  <div className="text-3xl font-bold text-blue-400 tracking-wider">
                    {generatedRoomCode}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Share this code with your friend so they can join your game
                </div>
                <Button 
                  onClick={handleStartWithGeneratedRoom}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Start Game
                </Button>
              </div>
            )}

            <Button 
              onClick={() => setShowMultiplayerOptions(false)}
              variant="outline"
              className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back to Game Modes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="bg-black/80 backdrop-blur-sm border-gray-700 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-white text-center mb-2">
            Tic-Tac-Toe
          </CardTitle>
          <p className="text-gray-400 text-center">Choose your game mode</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Play vs AI */}
          <Button 
            onClick={() => onModeSelect('ai')}
            className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg"
          >
            <Bot className="mr-3 h-6 w-6" />
            Play vs AI
          </Button>

          {/* Play vs Human */}
          <Button 
            onClick={() => setShowMultiplayerOptions(true)}
            className="w-full h-16 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold text-lg"
          >
            <Users className="mr-3 h-6 w-6" />
            Play vs Human
          </Button>

          {/* Game Info */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-300 space-y-1 text-center">
              <div>• Get 3 in a row to win</div>
              <div>• Game continues forever - no draws!</div>
              <div>• Oldest pieces disappear when grid fills</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}