'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment,
  ContactShadows,
  PresentationControls,
} from '@react-three/drei';
import { XR, createXRStore, useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useXRPreviewStore } from '../../stores/XRPreviewStore';
import { isArtProduct, isTableProduct, type Product } from '../../lib/types';
import ProceduralFrame from '../canvas/ProceduralFrame';
import ModelViewer from '../canvas/ModelViewer';

/**
 * AR Preview Mode Component
 * 
 * Displays the selected product in AR mode with a transparent background,
 * allowing users to overlay the item on their real-world environment.
 * 
 * Features:
 * - Transparent/passthrough background (no camera processing needed)
 * - Product rotation and scaling controls
 * - Touch/gesture interaction for manipulation
 * - Exit button to return to gallery
 */
export function ARPreviewMode() {
  const { selectedProduct, exitPreview } = useXRPreviewStore();
  
  // Create XR store for AR session
  const xrStore = useMemo(() => createXRStore({
    emulate: false,
  }), []);

  if (!selectedProduct) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* AR Canvas with transparent background */}
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 100,
          position: [0, 1.5, 2],
        }}
        gl={{ 
          antialias: true, 
          alpha: true, // Enable transparency
          preserveDrawingBuffer: true,
        }}
        style={{ background: 'transparent' }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <ARScene product={selectedProduct} />
          </Suspense>
        </XR>
      </Canvas>

      {/* AR UI Overlay */}
      <div className="absolute inset-0 pointer-events-none xr-overlay">
        {/* Exit Button */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={exitPreview}
            className="glass-dark rounded-full p-3 hover:bg-white/20 transition-smooth"
            aria-label="Exit AR Preview"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Product Info */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <div className="glass-dark rounded-xl p-4 max-w-md mx-auto">
            <h3 className="text-white font-semibold text-lg mb-1">
              {selectedProduct.name}
            </h3>
            <p className="text-white/70 text-sm mb-3">
              {selectedProduct.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold">
                ${selectedProduct.price.toLocaleString()}
              </span>
              <div className="text-xs text-white/50">
                Pinch to scale • Drag to rotate
              </div>
            </div>
          </div>
        </div>

        {/* WebXR AR Button */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <button
            onClick={() => xrStore.enterAR()}
            className="xr-button-primary text-sm"
          >
            Enter AR
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AR Scene Content
 */
interface ARSceneProps {
  product: Product | null;
}

function ARScene({ product }: ARSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Check if XR session is active
  const session = useXR((xr) => xr.session);
  const isPresenting = session != null;

  if (!product) return null;

  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow 
      />

      {/* Environment for reflections (subtle) */}
      {!isPresenting && (
        <Environment preset="city" />
      )}

      {/* Product with presentation controls for non-XR mode */}
      {!isPresenting ? (
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <group ref={groupRef}>
            <ProductDisplay product={product} />
          </group>
        </PresentationControls>
      ) : (
        // In XR mode, product is placed in front of user
        <group 
          ref={groupRef}
          position={[0, 0, -1.5]} // 1.5m in front
        >
          <ProductDisplay product={product} />
        </group>
      )}

      {/* Contact shadow for grounding (non-XR only) */}
      {!isPresenting && (
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={5}
          blur={2.5}
        />
      )}

      {/* Orbit controls for non-XR fallback */}
      {!isPresenting && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      )}
    </>
  );
}

/**
 * Product Display Component
 */
interface ProductDisplayProps {
  product: Product;
}

function ProductDisplay({ product }: ProductDisplayProps) {
  if (isArtProduct(product)) {
    return (
      <ProceduralFrame
        imageUri={product.imageUri}
        frameColor={product.frameColor}
        dimensions={product.dimensions}
      />
    );
  }

  if (isTableProduct(product)) {
    return (
      <ModelViewer
        modelUri={product.modelUri}
        scale={product.scale}
      />
    );
  }

  return null;
}

// Close Icon SVG
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default ARPreviewMode;
