import { OrbitControls } from "@react-three/drei";
import GameBoard from "./GameBoard";
import GameUI from "./GameUI";
import { useTicTacToe } from "@/lib/stores/useTicTacToe";
import { useAudio } from "@/lib/stores/useAudio";
import { useEffect } from "react";

export default function TicTacToe3D() {
  const { currentPlayer, winner, gamePhase } = useTicTacToe();
  const { setHitSound, setSuccessSound } = useAudio();

  // Initialize audio
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      {/* Game Board */}
      <GameBoard />

      {/* Game UI Overlay */}
      <GameUI />
    </>
  );
}
