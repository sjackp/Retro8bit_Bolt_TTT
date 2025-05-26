import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

export default function CameraControls() {
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  const velocity = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    const keys = getKeys();
    const speed = 5 * delta;
    
    // Get camera direction vectors
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();
    
    // Reset velocity
    velocity.current.set(0, 0, 0);
    
    // Apply movement based on keys
    if (keys.forward) velocity.current.add(forward.clone().multiplyScalar(speed));
    if (keys.back) velocity.current.add(forward.clone().multiplyScalar(-speed));
    if (keys.left) velocity.current.add(right.clone().multiplyScalar(-speed));
    if (keys.right) velocity.current.add(right.clone().multiplyScalar(speed));
    if (keys.up) velocity.current.y += speed;
    if (keys.down) velocity.current.y -= speed;
    
    // Apply velocity to camera position
    camera.position.add(velocity.current);
    
    // Keep camera at reasonable distance from center
    const distance = camera.position.length();
    if (distance < 3) {
      camera.position.normalize().multiplyScalar(3);
    }
    if (distance > 15) {
      camera.position.normalize().multiplyScalar(15);
    }
  });
  
  return null;
}
