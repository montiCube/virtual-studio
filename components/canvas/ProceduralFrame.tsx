'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { ArtProduct } from '@/lib/types';

interface ProceduralFrameProps {
  product: ArtProduct;
  position?: [number, number, number];
  isActive?: boolean;
}

export function ProceduralFrame({
  product,
  position = [0, 0, 0],
  isActive = false,
}: ProceduralFrameProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { imageUri, frameColor, dimensions } = product;

  // Load artwork texture
  const texture = useTexture(imageUri);
  
  // Configure texture settings
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
  }, [texture]);

  // Frame dimensions (procedurally calculated)
  const frameThickness = 0.08;
  const frameDepth = 0.05;
  const canvasDepth = 0.02;

  const outerWidth = dimensions.width + frameThickness * 2;
  const outerHeight = dimensions.height + frameThickness * 2;

  // Frame material
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: frameColor,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [frameColor]
  );

  // Canvas material with artwork
  const canvasMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0,
      }),
    [texture]
  );

  // Subtle floating animation for active product
  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Frame Border - using 4 RoundedBox pieces */}
      {/* Top */}
      <RoundedBox
        args={[outerWidth, frameThickness, frameDepth]}
        radius={0.01}
        position={[0, (outerHeight - frameThickness) / 2, 0]}
        material={frameMaterial}
      />
      {/* Bottom */}
      <RoundedBox
        args={[outerWidth, frameThickness, frameDepth]}
        radius={0.01}
        position={[0, -(outerHeight - frameThickness) / 2, 0]}
        material={frameMaterial}
      />
      {/* Left */}
      <RoundedBox
        args={[frameThickness, dimensions.height, frameDepth]}
        radius={0.01}
        position={[-(outerWidth - frameThickness) / 2, 0, 0]}
        material={frameMaterial}
      />
      {/* Right */}
      <RoundedBox
        args={[frameThickness, dimensions.height, frameDepth]}
        radius={0.01}
        position={[(outerWidth - frameThickness) / 2, 0, 0]}
        material={frameMaterial}
      />

      {/* Canvas/Artwork */}
      <mesh position={[0, 0, -canvasDepth / 2]}>
        <planeGeometry args={[dimensions.width, dimensions.height]} />
        <primitive object={canvasMaterial} attach="material" />
      </mesh>

      {/* Backing */}
      <mesh position={[0, 0, -frameDepth / 2]}>
        <planeGeometry args={[dimensions.width + 0.02, dimensions.height + 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}
