import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Bot, Plus, LogIn, AlertCircle } from "lucide-react";
import { multiplayerManager } from "@/lib/multiplayer";

interface GameModeSelectorProps {
  onModeSelect: (mode: 'ai' | 'multiplayer', roomCode?: string, isHost?: boolean) => void;
}

export default function GameModeSelector({ onModeSelect }: GameModeSelectorProps) {
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedRoomCode(code);
    setIsCreatingRoom(true);
  };

  const handleCreateRoom = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await multiplayerManager.createRoom(code);
      if (result.success) {
        setGeneratedRoomCode(code);
        setIsCreatingRoom(true);
      } else {
        setErrorMessage(result.error || "Failed to create room");
      }
    } catch (error) {
      setErrorMessage("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await multiplayerManager.joinRoom(roomCode.trim());
      if (result.success) {
        onModeSelect('multiplayer', roomCode.trim(), false);
      } else {
        setErrorMessage(result.error || "Failed to join room");
      }
    } catch (error) {
      setErrorMessage("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWithGeneratedRoom = () => {
    onModeSelect('multiplayer', generatedRoomCode, true);
  };

  if (showMultiplayerOptions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden retro-scanlines">
        {/* 8-bit Circuit Board Background */}
        <div className="absolute inset-0 retro-circuit-bg"></div>
        
        {/* 8-bit style top and bottom borders */}
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 animate-retro-glow"></div>
        
        <Card className="bg-black border-4 border-orange-500 shadow-lg w-full max-w-md relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-400 text-center pixel-font animate-retro-glow">MULTIPLAYER</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-900 border-2 border-red-500 rounded flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300 pixel-font text-sm">{errorMessage}</span>
              </div>
            )}
            
            {!isCreatingRoom ? (
              <>
                {/* Create Room */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-orange-400 pixel-font">CREATE ROOM</h3>
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font flex items-center justify-center disabled:bg-gray-600 disabled:border-gray-700 disabled:text-gray-400"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="flex items-center">
                      {isLoading ? "CREATING..." : "CREATE NEW ROOM"}
                    </span>
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
                        onChange={(e) => {
                          setRoomCode(e.target.value.toUpperCase());
                          setErrorMessage(""); // Clear error when user types
                        }}
                        className="bg-black border-2 border-orange-500 text-orange-400 placeholder-orange-600 pixel-font"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={handleJoinRoom}
                      disabled={!roomCode.trim() || isLoading}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black border-2 border-orange-600 pixel-font flex items-center justify-center disabled:bg-gray-600 disabled:border-gray-700 disabled:text-gray-400"
                      size="lg"
                    >
                      <LogIn className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="flex items-center">
                        {isLoading ? "JOINING..." : "JOIN ROOM"}
                      </span>
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
              onClick={() => {
                setShowMultiplayerOptions(false);
                setIsCreatingRoom(false);
                setRoomCode("");
                setGeneratedRoomCode("");
                setErrorMessage("");
                setIsLoading(false);
              }}
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden retro-scanlines">
      {/* 8-bit Circuit Board Background */}
      <div className="absolute inset-0 retro-circuit-bg"></div>
      
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