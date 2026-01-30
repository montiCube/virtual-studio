'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GALLERY_CONFIG } from '@/lib/constants';

interface GalleryFloorProps {
  size?: number;
}

export function GalleryFloor({ size = GALLERY_CONFIG.floorSize }: GalleryFloorProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Subtle color shift animation
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material.color) {
        const t = Math.sin(state.clock.elapsedTime * 0.1) * 0.5 + 0.5;
        material.color.setHSL(0.6 + t * 0.05, 0.1, 0.08);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={15}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#050505"
        metalness={0.6}
        roughness={1}
        mirror={0.5}
      />
    </mesh>
  );
}
