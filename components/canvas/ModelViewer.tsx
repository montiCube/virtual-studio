'use client';

import { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Center, useProgress } from '@react-three/drei';
import type { Group } from 'three';
import { Box3 as ThreeBox3, Vector3 as ThreeVector3 } from 'three';

interface ModelViewerProps {
  modelUri: string;
  scale?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

/**
 * GLB/GLTF model viewer with auto-scaling and centering
 */
export function ModelViewer({
  modelUri,
  scale = 1,
  autoRotate = true,
  rotateSpeed = 0.3,
}: ModelViewerProps) {
  const groupRef = useRef<Group>(null);
  const [normalizedScale, setNormalizedScale] = useState(scale);

  // Load GLTF model
  const gltf = useLoader(GLTFLoader, modelUri);

  // Calculate normalized scale based on model bounding box
  useEffect(() => {
    if (gltf.scene) {
      const box = new ThreeBox3().setFromObject(gltf.scene);
      const size = new ThreeVector3();
      box.getSize(size);

      // Calculate scale to fit model in a 1x1x1 unit box, then apply user scale
      const maxDimension = Math.max(size.x, size.y, size.z);
      const normalScale = maxDimension > 0 ? (1 / maxDimension) * scale : scale;
      setNormalizedScale(normalScale);
    }
  }, [gltf.scene, scale]);

  // Auto-rotate animation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * rotateSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive
          object={gltf.scene.clone()}
          scale={[normalizedScale, normalizedScale, normalizedScale]}
        />
      </Center>
    </group>
  );
}

/**
 * Loading progress indicator for 3D models
 */
export function ModelLoadingIndicator() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 glass rounded-full px-6 py-2">
      <div className="flex items-center gap-3">
        <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white/70 text-sm">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default ModelViewer;
