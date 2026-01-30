'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { TableProduct } from '@/lib/types';

interface ModelViewerProps {
  product: TableProduct;
  position?: [number, number, number];
  isActive?: boolean;
}

/**
 * Procedural furniture placeholder when models can't be loaded.
 * Creates a simple table representation using primitive geometry.
 */
export function ModelViewer({
  product,
  position = [0, 0, 0],
  isActive = false,
}: ModelViewerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scale } = product;

  // Subtle rotation animation for active product
  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  // Procedural table using simple geometry as fallback
  // This ensures the app works even when external models can't be loaded
  const tableColor = '#8B4513';
  const legColor = '#5D3A1A';
  const tableWidth = 1.2 * scale;
  const tableDepth = 0.8 * scale;
  const tableHeight = 0.05 * scale;
  const tableTopY = 0.4 * scale;
  const legSize = 0.08 * scale;
  const legHeight = tableTopY;

  return (
    <group ref={groupRef} position={position}>
      {/* Table Top */}
      <RoundedBox
        args={[tableWidth, tableHeight, tableDepth]}
        radius={0.02}
        position={[0, tableTopY, 0]}
      >
        <meshStandardMaterial color={tableColor} roughness={0.3} metalness={0.1} />
      </RoundedBox>

      {/* Table Legs */}
      {[
        [-(tableWidth / 2 - legSize), legHeight / 2, -(tableDepth / 2 - legSize)],
        [(tableWidth / 2 - legSize), legHeight / 2, -(tableDepth / 2 - legSize)],
        [-(tableWidth / 2 - legSize), legHeight / 2, (tableDepth / 2 - legSize)],
        [(tableWidth / 2 - legSize), legHeight / 2, (tableDepth / 2 - legSize)],
      ].map((legPos, index) => (
        <RoundedBox
          key={index}
          args={[legSize, legHeight, legSize]}
          radius={0.01}
          position={legPos as [number, number, number]}
        >
          <meshStandardMaterial color={legColor} roughness={0.4} metalness={0.05} />
        </RoundedBox>
      ))}
    </group>
  );
}
