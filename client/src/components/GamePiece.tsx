import { useRef, useEffect } from "react";
import { Mesh } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface GamePieceProps {
  type: 'X' | 'O';
  placementOrder: number;
  isBlinking: boolean;
  fadeProgress: number;
}

export default function GamePiece({ type, placementOrder, isBlinking, fadeProgress }: GamePieceProps) {
  const meshRef = useRef<Mesh>(null);
  const textRef = useRef<Mesh>(null);
  
  // Animation for piece placement
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0);
      
      // Animate scale up
      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / 300, 1); // 300ms animation
        const scale = progress * (1 - fadeProgress); // Incorporate fade progress
        
        if (meshRef.current) {
          meshRef.current.scale.setScalar(scale);
        }
        if (textRef.current) {
          textRef.current.scale.setScalar(scale);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [fadeProgress]);

  // Blinking and fading animation
  useFrame((state) => {
    if (meshRef.current && textRef.current) {
      let opacity = 1 - fadeProgress;
      
      if (isBlinking) {
        // Blinking effect
        opacity *= 0.3 + 0.7 * Math.abs(Math.sin(state.clock.elapsedTime * 8));
      }
      
      // Apply opacity to materials
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.opacity = opacity * 0.3;
      }
      if (textRef.current.material instanceof THREE.Material) {
        textRef.current.material.opacity = opacity;
      }
    }
  });

  const color = type === 'X' ? "#ff4444" : "#4444ff";

  return (
    <group>
      {/* Background sphere/box for the piece */}
      <mesh ref={meshRef} castShadow>
        {type === 'X' ? (
          <boxGeometry args={[0.8, 0.8, 0.8]} />
        ) : (
          <sphereGeometry args={[0.5, 16, 16]} />
        )}
        <meshPhongMaterial 
          color={color} 
          transparent 
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Text representation of X or O */}
      <Text
        ref={textRef}
        position={[0, 0, 0]}
        fontSize={1}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
        castShadow
      >
        {type}
      </Text>
      
      {/* Placement order indicator (small text) */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {placementOrder}
      </Text>
    </group>
  );
}
