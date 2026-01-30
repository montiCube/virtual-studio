'use client';

import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  AdaptiveDpr, 
  BakeShadows,
  PerformanceMonitor 
} from '@react-three/drei';
import { Suspense, useState, useCallback } from 'react';
import { GALLERY_CONFIG } from '../../lib/constants';
import { useGalleryStore } from '../../stores/MockStore';
import { useGalleryNavigation } from '../../hooks/useGalleryNavigation';
import { isArtProduct } from '../../lib/types';
import ProceduralFrame from './ProceduralFrame';
import ModelViewer from './ModelViewer';
import GalleryFloor from './GalleryFloor';
import ProductSpotlight from './ProductSpotlight';
import ProductHUD from '../ui/ProductHUD';
import NavigationHint from '../ui/NavigationHint';

function Scene() {
  const { currentProduct } = useGalleryStore();
  const [perfTier, setPerfTier] = useState<'high' | 'medium' | 'low'>('high');

  const handlePerformanceChange = useCallback((factor: number) => {
    if (factor < 0.5) {
      setPerfTier('low');
    } else if (factor < 0.8) {
      setPerfTier('medium');
    } else {
      setPerfTier('high');
    }
  }, []);

  return (
    <>
      <PerformanceMonitor 
        onDecline={() => handlePerformanceChange(0.4)}
        onIncline={() => handlePerformanceChange(1)}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <ProductSpotlight />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Gallery floor */}
      <GalleryFloor />

      {/* Current product display */}
      {currentProduct && (
        <group position={[0, GALLERY_CONFIG.display.artHeight, 0]}>
          {isArtProduct(currentProduct) ? (
            <ProceduralFrame
              key={currentProduct.id}
              imageUri={currentProduct.imageUri}
              frameColor={currentProduct.frameColor}
              dimensions={currentProduct.dimensions}
            />
          ) : (
            <ModelViewer
              key={currentProduct.id}
              modelUri={currentProduct.modelUri}
              scale={currentProduct.scale}
            />
          )}
        </group>
      )}

      {/* Performance optimizations */}
      <AdaptiveDpr pixelated />
      {perfTier !== 'high' && <BakeShadows />}
    </>
  );
}

export function ImmersiveGallery() {
  const navigation = useGalleryNavigation();

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          fov: GALLERY_CONFIG.camera.fov,
          near: GALLERY_CONFIG.camera.near,
          far: GALLERY_CONFIG.camera.far,
          position: GALLERY_CONFIG.camera.initialPosition as [number, number, number],
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <ProductHUD />
        <NavigationHint navigation={navigation} />
      </div>
    </div>
  );
}

export default ImmersiveGallery;
