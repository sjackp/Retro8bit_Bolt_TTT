import { useRef } from "react";
import { Group } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTicTacToe } from "@/lib/stores/useTicTacToe";
import GamePiece from "./GamePiece";

export default function GameBoard() {
  const groupRef = useRef<Group>(null);
  const { grid, placePiece, currentPlayer, gamePhase } = useTicTacToe();

  // Subtle rotation animation
  useFrame((state) => {
    if (groupRef.current && gamePhase === 'playing') {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const handleCellClick = (x: number, y: number, z: number) => {
    if (gamePhase === 'playing') {
      placePiece(x, y, z);
    }
  };

  const renderGridLines = () => {
    const lines = [];
    const gridSize = 3;
    const spacing = 2;
    const offset = (gridSize - 1) * spacing / 2;

    // Grid lines for each layer
    for (let layer = 0; layer < gridSize; layer++) {
      const yPos = layer * spacing - offset;
      
      // Horizontal lines
      for (let i = 0; i <= gridSize; i++) {
        const pos = i * spacing - offset;
        lines.push(
          <line key={`h-${layer}-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  -offset, yPos, pos,
                  offset, yPos, pos
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#444444" />
          </line>
        );
        
        lines.push(
          <line key={`v-${layer}-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  pos, yPos, -offset,
                  pos, yPos, offset
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#444444" />
          </line>
        );
      }

      // Vertical lines connecting layers
      if (layer < gridSize - 1) {
        for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
            const xPos = x * spacing - offset;
            const zPos = z * spacing - offset;
            const nextYPos = (layer + 1) * spacing - offset;
            
            lines.push(
              <line key={`vertical-${layer}-${x}-${z}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      xPos, yPos, zPos,
                      xPos, nextYPos, zPos
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#333333" />
              </line>
            );
          }
        }
      }
    }

    return lines;
  };

  const renderCells = () => {
    const cells = [];
    const gridSize = 3;
    const spacing = 2;
    const offset = (gridSize - 1) * spacing / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const xPos = x * spacing - offset;
          const yPos = y * spacing - offset;
          const zPos = z * spacing - offset;
          
          const cellData = grid[x][y][z];
          
          cells.push(
            <group key={`cell-${x}-${y}-${z}`} position={[xPos, yPos, zPos]}>
              {/* Invisible clickable area */}
              <mesh
                onClick={() => handleCellClick(x, y, z)}
                visible={false}
              >
                <boxGeometry args={[1.8, 1.8, 1.8]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
              
              {/* Hover indicator */}
              <mesh>
                <boxGeometry args={[1.6, 1.6, 1.6]} />
                <meshBasicMaterial 
                  color={currentPlayer === 'X' ? "#ff4444" : "#4444ff"}
                  transparent 
                  opacity={cellData.piece ? 0 : 0.1}
                  wireframe
                />
              </mesh>
              
              {/* Game piece */}
              {cellData.piece && (
                <GamePiece 
                  type={cellData.piece} 
                  placementOrder={cellData.placementOrder}
                  isBlinking={cellData.isBlinking}
                  fadeProgress={cellData.fadeProgress}
                />
              )}
            </group>
          );
        }
      }
    }
    
    return cells;
  };

  return (
    <group ref={groupRef}>
      {/* Grid lines */}
      {renderGridLines()}
      
      {/* Game cells */}
      {renderCells()}
      
      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#111111" />
      </mesh>
    </group>
  );
}
