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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-black relative overflow-hidden retro-scanlines">
        {/* 8-bit style top and bottom borders */}
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
        
        <Card className="bg-black border-4 border-orange-500 shadow-lg w-full max-w-md relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-400 text-center pixel-font animate-retro-glow">MULTIPLAYER</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCreatingRoom ? (
              <>
                {/* Create Room */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-orange-400 pixel-font">CREATE ROOM</h3>
                  <Button 
                    onClick={handleCreateRoom}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font flex items-center justify-center"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="flex items-center">CREATE NEW ROOM</span>
                  </Button>
                </div>

                <div className="border-t border-orange-500 pt-6">
                  {/* Join Room */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-orange-400 pixel-font">JOIN ROOM</h3>
                    <div className="space-y-2">
                      <Label htmlFor="roomCode" className="text-orange-300 pixel-font">ROOM CODE</Label>
                      <Input
                        id="roomCode"
                        type="text"
                        placeholder="ENTER CODE"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="bg-black border-2 border-orange-500 text-orange-400 placeholder-orange-600 pixel-font"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font flex items-center justify-center disabled:bg-gray-600 disabled:border-gray-700 disabled:text-gray-400"
                      size="lg"
                    >
                      <LogIn className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="flex items-center">JOIN ROOM</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Room Created */
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-orange-400 pixel-font">ROOM CREATED!</h3>
                <div className="p-4 bg-black border-2 border-orange-500">
                  <div className="text-sm text-orange-300 mb-2 pixel-font">SHARE THIS CODE:</div>
                  <div className="text-3xl font-bold text-orange-400 tracking-wider pixel-font animate-retro-glow">
                    {generatedRoomCode}
                  </div>
                </div>
                <div className="text-sm text-orange-300 pixel-font">
                  SHARE WITH FRIEND TO JOIN
                </div>
                <Button 
                  onClick={handleStartWithGeneratedRoom}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font flex items-center justify-center"
                  size="lg"
                >
                  <span className="flex items-center">START GAME</span>
                </Button>
              </div>
            )}

            <Button 
              onClick={() => setShowMultiplayerOptions(false)}
              variant="outline"
              className="w-full bg-black border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black pixel-font"
            >
              BACK TO MENU
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-black relative overflow-hidden retro-scanlines">
      {/* Subtle starfield background */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, #fff, transparent),
            radial-gradient(2px 2px at 40% 70%, #fff, transparent),
            radial-gradient(1px 1px at 90% 40%, #fff, transparent),
            radial-gradient(1px 1px at 60% 10%, #fff, transparent),
            radial-gradient(2px 2px at 80% 80%, #fff, transparent)
          `,
          backgroundSize: '200px 200px'
        }}></div>
      </div>
      
      {/* 8-bit style top and bottom borders */}
      <div className="absolute top-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
      
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-5xl font-bold text-orange-400 pixel-font animate-retro-glow mb-2">
          TIC-TAC-TOE
        </h1>
        <p className="text-orange-300 pixel-font text-lg">
          8-BIT ARCADE EDITION
        </p>
      </div>
      
      <Card className="bg-black border-4 border-orange-500 shadow-lg w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-3xl text-orange-400 text-center pixel-font animate-retro-glow">
            GAME MODE
          </CardTitle>
          <p className="text-orange-300 text-center pixel-font">CHOOSE YOUR BATTLE</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Play vs AI */}
          <Button 
            onClick={() => onModeSelect('ai')}
            className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font text-lg flex items-center justify-center"
          >
            <Bot className="mr-3 h-6 w-6 flex-shrink-0" />
            <span className="flex items-center">PLAY VS CPU</span>
          </Button>

          {/* Play vs Human */}
          <Button 
            onClick={() => setShowMultiplayerOptions(true)}
            className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font text-lg flex items-center justify-center"
          >
            <Users className="mr-3 h-6 w-6 flex-shrink-0" />
            <span className="flex items-center">MULTIPLAYER</span>
          </Button>

          {/* Game Info */}
          <div className="mt-8 p-4 bg-black border-2 border-orange-500">
            <div className="text-sm text-orange-300 space-y-1 text-center pixel-font">
              <div>• GET 3 IN A ROW TO WIN</div>
              <div>• NO DRAWS - ENDLESS BATTLE!</div>
              <div>• OLD PIECES FADE AWAY</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}