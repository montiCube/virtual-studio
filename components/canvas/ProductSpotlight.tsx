'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { SpotLight } from 'three';
import { GALLERY_CONFIG } from '../../lib/constants';

interface ProductSpotlightProps {
  color?: string;
  intensity?: number;
  angle?: number;
  penumbra?: number;
  distance?: number;
}

/**
 * Dynamic spotlight that illuminates the current product
 */
export function ProductSpotlight({
  color = '#ffffff',
  intensity = GALLERY_CONFIG.display.spotlightIntensity,
  angle = 0.5,
  penumbra = 0.5,
  distance = 10,
}: ProductSpotlightProps) {
  const spotlightRef = useRef<SpotLight>(null);

  // Subtle light animation
  useFrame((state) => {
    if (spotlightRef.current) {
      // Gentle intensity pulsing
      spotlightRef.current.intensity = 
        intensity + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <>
      {/* Main product spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 5, 3]}
        angle={angle}
        penumbra={penumbra}
        intensity={intensity}
        color={color}
        distance={distance}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill light from the side */}
      <pointLight
        position={[5, 3, 0]}
        intensity={0.3}
        color="#e0e0ff"
      />

      {/* Back light for depth */}
      <pointLight
        position={[-3, 2, -3]}
        intensity={0.2}
        color="#ffe0d0"
      />
    </>
  );
}

export default ProductSpotlight;
