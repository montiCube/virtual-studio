'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import type { TableProduct } from '@/lib/types';

interface ModelViewerProps {
  product: TableProduct;
  position?: [number, number, number];
  isActive?: boolean;
}

export function ModelViewer({
  product,
  position = [0, 0, 0],
  isActive = false,
}: ModelViewerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { modelUri, scale } = product;

  // Load GLB model
  const { scene } = useGLTF(modelUri);

  // Clone the scene to allow multiple instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Configure materials for optimal rendering
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          // Ensure proper color space
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
      }
    });
    
    return clone;
  }, [scene]);

  // Calculate bounding box for auto-scaling
  useEffect(() => {
    if (clonedScene) {
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Normalize to unit size then apply product scale
      const normalizedScale = (1 / maxDim) * scale;
      clonedScene.scale.setScalar(normalizedScale);
      
      // Center the model
      const center = box.getCenter(new THREE.Vector3());
      clonedScene.position.sub(center.multiplyScalar(normalizedScale));
    }
  }, [clonedScene, scale]);

  // Subtle rotation animation for active product
  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

// Preload model for faster initial render
useGLTF.preload('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb');
