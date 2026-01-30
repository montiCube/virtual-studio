'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  AdaptiveDpr,
  BakeShadows,
  PerformanceMonitor,
  Preload,
} from '@react-three/drei';
import * as THREE from 'three';
import { useGalleryStore } from '@/stores/MockStore';
import { isArtProduct, isTableProduct } from '@/lib/types';
import { GALLERY_CONFIG } from '@/lib/constants';
import { ProceduralFrame } from './ProceduralFrame';
import { ModelViewer } from './ModelViewer';
import { GalleryFloor } from './GalleryFloor';
import { ProductSpotlight } from './ProductSpotlight';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4a4a6a" wireframe />
    </mesh>
  );
}

function Scene() {
  const { currentProduct, currentIndex, products, isTransitioning } = useGalleryStore();

  // Calculate camera position based on current product
  const targetPosition = useMemo(() => {
    const x = currentIndex * GALLERY_CONFIG.productSpacing;
    return [x, 0, 0] as [number, number, number];
  }, [currentIndex]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <ProductSpotlight
        position={[targetPosition[0], 5, 3]}
        targetPosition={targetPosition}
        vibe={currentProduct?.vibe || 'calm'}
        isActive={!isTransitioning}
      />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Gallery Floor */}
      <GalleryFloor />

      {/* Products */}
      {products.map((product, index) => {
        const position: [number, number, number] = [
          index * GALLERY_CONFIG.productSpacing,
          0,
          0,
        ];
        const isActive = index === currentIndex;

        if (isArtProduct(product)) {
          return (
            <Suspense key={product.id} fallback={<LoadingFallback />}>
              <ProceduralFrame
                product={product}
                position={position}
                isActive={isActive}
              />
            </Suspense>
          );
        }

        if (isTableProduct(product)) {
          return (
            <Suspense key={product.id} fallback={<LoadingFallback />}>
              <ModelViewer
                product={product}
                position={position}
                isActive={isActive}
              />
            </Suspense>
          );
        }

        return null;
      })}

      {/* Performance Optimizations */}
      <BakeShadows />
      <Preload all />
    </>
  );
}

export function ImmersiveGallery() {
  const { currentIndex } = useGalleryStore();

  // Camera target position
  const cameraTarget = useMemo(() => {
    return [
      currentIndex * GALLERY_CONFIG.productSpacing,
      0,
      GALLERY_CONFIG.cameraDistance,
    ] as [number, number, number];
  }, [currentIndex]);

  return (
    <Canvas
      shadows
      camera={{
        position: cameraTarget,
        fov: 50,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: '#0a0a0f' }}
    >
      <AdaptiveDpr pixelated />
      <PerformanceMonitor />

      <Suspense fallback={<LoadingFallback />}>
        <Scene />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        target={[currentIndex * GALLERY_CONFIG.productSpacing, 0, 0]}
      />
    </Canvas>
  );
}
