'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VibeCategory } from '@/lib/types';

interface ProductSpotlightProps {
  position?: [number, number, number];
  targetPosition?: [number, number, number];
  intensity?: number;
  vibe?: VibeCategory;
  isActive?: boolean;
}

const VIBE_COLORS: Record<VibeCategory, string> = {
  calm: '#87CEEB',    // Soft blue
  upbeat: '#FFD700',  // Warm gold
  ambient: '#DDA0DD', // Soft purple
};

export function ProductSpotlight({
  position = [0, 5, 3],
  targetPosition = [0, 0, 0],
  intensity = 2,
  vibe = 'calm',
  isActive = true,
}: ProductSpotlightProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  // Animate light intensity and subtle color shifts
  useFrame((state) => {
    if (lightRef.current && isActive) {
      // Pulsing intensity
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      lightRef.current.intensity = intensity * pulse;

      // Subtle position movement
      lightRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <>
      {/* Target object for spotlight */}
      <object3D ref={targetRef} position={targetPosition} />

      {/* Main spotlight */}
      <spotLight
        ref={lightRef}
        position={position}
        angle={0.4}
        penumbra={0.5}
        intensity={intensity}
        color={VIBE_COLORS[vibe]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        target={targetRef.current || undefined}
      />

      {/* Fill light */}
      <pointLight
        position={[position[0], position[1] - 2, position[2] + 2]}
        intensity={intensity * 0.3}
        color="#ffffff"
        distance={10}
        decay={2}
      />

      {/* Rim light for depth */}
      <spotLight
        position={[-position[0], position[1], -position[2]]}
        angle={0.6}
        penumbra={1}
        intensity={intensity * 0.5}
        color="#4a4a6a"
      />
    </>
  );
}
