'use client';

import { useMemo, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, MeshStandardMaterial, DoubleSide } from 'three';
import type { Mesh, Group } from 'three';

interface ProceduralFrameProps {
  imageUri: string;
  frameColor: string;
  dimensions: {
    width: number;
    height: number;
  };
  frameDepth?: number;
  frameThickness?: number;
}

/**
 * Procedural picture frame with artwork texture
 * Generates frame geometry programmatically to avoid loading external models
 */
export function ProceduralFrame({
  imageUri,
  frameColor,
  dimensions,
  frameDepth = 0.05,
  frameThickness = 0.08,
}: ProceduralFrameProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  // Load artwork texture
  const texture = useLoader(TextureLoader, imageUri);

  // Frame material with color
  const frameMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      color: frameColor,
      roughness: 0.3,
      metalness: 0.1,
    });
  }, [frameColor]);

  // Canvas/artwork material
  const canvasMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      map: texture,
      side: DoubleSide,
    });
  }, [texture]);

  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  const { width, height } = dimensions;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const ft = frameThickness; // Frame thickness
  const fd = frameDepth; // Frame depth

  return (
    <group ref={groupRef}>
      {/* Artwork canvas */}
      <mesh ref={meshRef} position={[0, 0, fd / 2 + 0.001]}>
        <planeGeometry args={[width, height]} />
        <primitive object={canvasMaterial} attach="material" />
      </mesh>

      {/* Frame backing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + ft * 2, height + ft * 2, fd]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Top frame piece */}
      <mesh position={[0, halfHeight + ft / 2, fd / 2]}>
        <boxGeometry args={[width + ft * 2, ft, fd]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Bottom frame piece */}
      <mesh position={[0, -halfHeight - ft / 2, fd / 2]}>
        <boxGeometry args={[width + ft * 2, ft, fd]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Left frame piece */}
      <mesh position={[-halfWidth - ft / 2, 0, fd / 2]}>
        <boxGeometry args={[ft, height, fd]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Right frame piece */}
      <mesh position={[halfWidth + ft / 2, 0, fd / 2]}>
        <boxGeometry args={[ft, height, fd]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default ProceduralFrame;
