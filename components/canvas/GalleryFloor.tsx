'use client';

import { MeshReflectorMaterial } from '@react-three/drei';

interface GalleryFloorProps {
  size?: number;
  color?: string;
  roughness?: number;
  metalness?: number;
}

/**
 * Reflective gallery floor with customizable appearance
 */
export function GalleryFloor({
  size = 20,
  color = '#111111',
  roughness = 0.4,
  metalness = 0.6,
}: GalleryFloorProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={roughness}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={color}
        metalness={metalness}
        mirror={0.5}
      />
    </mesh>
  );
}

export default GalleryFloor;
