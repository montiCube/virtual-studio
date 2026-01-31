'use client';

import { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment,
  Grid,
  Float,
} from '@react-three/drei';
import { XR, createXRStore, useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useXRPreviewStore } from '../../stores/XRPreviewStore';
import { VR_ROOM_TEMPLATES } from '../../lib/constants';
import { isArtProduct, isTableProduct, type VRRoomTemplate, type Product } from '../../lib/types';
import ProceduralFrame from '../canvas/ProceduralFrame';
import ModelViewer from '../canvas/ModelViewer';

/**
 * VR Preview Mode Component
 * 
 * Displays the selected product in a virtual room environment.
 * Users can navigate the room by turning their head (in VR) or
 * using mouse/touch controls (in browser).
 * 
 * Features:
 * - Selectable room templates (Living Room, Bedroom, Studio, Custom)
 * - Head tracking navigation in VR mode
 * - Product placement in virtual space
 * - Room customization options
 */
export function VRPreviewMode() {
  const { 
    selectedProduct, 
    exitPreview, 
    vrRoomTemplate, 
    setVRRoomTemplate,
    isHeadTrackingEnabled,
  } = useXRPreviewStore();
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  
  // Create XR store for VR session
  const xrStore = useMemo(() => createXRStore({
    emulate: false,
  }), []);

  if (!selectedProduct) {
    return null;
  }

  const roomConfig = VR_ROOM_TEMPLATES[vrRoomTemplate];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* VR Canvas */}
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 1.6, 3], // Standing height
        }}
        gl={{ antialias: true }}
        shadows
      >
        <XR store={xrStore}>
          <Suspense fallback={<LoadingIndicator />}>
            <VRScene 
              product={selectedProduct} 
              roomTemplate={vrRoomTemplate}
              isHeadTrackingEnabled={isHeadTrackingEnabled}
            />
          </Suspense>
        </XR>
      </Canvas>

      {/* VR UI Overlay */}
      <div className="absolute inset-0 pointer-events-none xr-overlay">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Room Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoomSelector(!showRoomSelector)}
              className="glass-dark rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-smooth"
            >
              <RoomIcon />
              <span className="text-white text-sm">{roomConfig.name}</span>
              <ChevronIcon isOpen={showRoomSelector} />
            </button>

            {/* Room Selector Dropdown */}
            {showRoomSelector && (
              <div className="absolute top-full left-0 mt-2 glass-strong rounded-xl p-2 min-w-[240px] animate-slide-up">
                <p className="text-xs text-white/50 px-3 py-1 uppercase tracking-wider">
                  Select Room Template
                </p>
                {Object.values(VR_ROOM_TEMPLATES).map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setVRRoomTemplate(room.id);
                      setShowRoomSelector(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-smooth text-left ${
                      vrRoomTemplate === room.id 
                        ? 'bg-white/20' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-1">
                      {vrRoomTemplate === room.id ? <CheckIcon /> : <RoomIcon />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{room.name}</div>
                      <div className="text-xs text-white/50">{room.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exit Button */}
          <button
            onClick={exitPreview}
            className="glass-dark rounded-full p-3 hover:bg-white/20 transition-smooth"
            aria-label="Exit VR Preview"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Bottom Bar - Product Info & VR Button */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
          {/* Product Info */}
          <div className="glass-dark rounded-xl p-4 max-w-sm">
            <h3 className="text-white font-semibold text-lg mb-1">
              {selectedProduct.name}
            </h3>
            <p className="text-white/70 text-sm mb-2">
              {selectedProduct.description}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-green-400 font-bold">
                ${selectedProduct.price.toLocaleString()}
              </span>
              <span className="text-xs text-white/50">
                Room: {roomConfig.dimensions.width.toFixed(1)}m × {roomConfig.dimensions.depth.toFixed(1)}m
              </span>
            </div>
          </div>

          {/* VR Entry Button */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-white/50 text-right">
              Turn your head to look around
            </div>
            <button
              onClick={() => xrStore.enterVR()}
              className="xr-button bg-purple-600/50 hover:bg-purple-500/60"
            >
              Enter VR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VR Scene Content
 */
interface VRSceneProps {
  product: Product | null;
  roomTemplate: VRRoomTemplate;
  isHeadTrackingEnabled: boolean;
}

function VRScene({ product, roomTemplate, isHeadTrackingEnabled }: VRSceneProps) {
  // Check if XR session is active
  const session = useXR((xr) => xr.session);
  const isPresenting = session != null;
  const roomConfig = VR_ROOM_TEMPLATES[roomTemplate];

  if (!product) return null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 2.5, 0]} intensity={0.3} />

      {/* Sky/Environment */}
      <Environment preset="apartment" />

      {/* Virtual Room */}
      <VirtualRoom dimensions={roomConfig.dimensions} />

      {/* Product Display */}
      <group position={[0, 0, 0]}>
        <ProductInRoom product={product} roomDimensions={roomConfig.dimensions} />
      </group>

      {/* Camera Controls */}
      {!isPresenting && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={1}
          maxDistance={roomConfig.dimensions.depth * 0.8}
          maxPolarAngle={Math.PI / 2}
          target={[0, 1, 0]}
        />
      )}

      {/* Head tracking indicator for VR */}
      {isPresenting && isHeadTrackingEnabled && (
        <HeadTrackingIndicator />
      )}
    </>
  );
}

/**
 * Virtual Room Component
 */
interface VirtualRoomProps {
  dimensions: { width: number; depth: number; height: number };
}

function VirtualRoom({ dimensions }: VirtualRoomProps) {
  const { width, depth, height } = dimensions;
  
  // Room materials
  const floorMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#8B7355',
      roughness: 0.8,
      metalness: 0.1,
    }), []);

  const wallMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#F5F5F5',
      roughness: 0.9,
      metalness: 0,
    }), []);

  const ceilingMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#FFFFFF',
      roughness: 1,
      metalness: 0,
    }), []);

  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
        material={floorMaterial}
      >
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Ceiling */}
      <mesh 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, height, 0]}
        material={ceilingMaterial}
      >
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Back Wall */}
      <mesh 
        position={[0, height / 2, -depth / 2]}
        material={wallMaterial}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Front Wall (with opening for entrance feel) */}
      <mesh 
        rotation={[0, Math.PI, 0]}
        position={[0, height / 2, depth / 2]}
        material={wallMaterial}
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Left Wall */}
      <mesh 
        rotation={[0, Math.PI / 2, 0]}
        position={[-width / 2, height / 2, 0]}
        material={wallMaterial}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* Right Wall */}
      <mesh 
        rotation={[0, -Math.PI / 2, 0]}
        position={[width / 2, height / 2, 0]}
        material={wallMaterial}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* Baseboard/Skirting */}
      <Baseboard width={width} depth={depth} height={0.1} />

      {/* Floor Grid for spatial reference */}
      <Grid
        position={[0, 0.001, 0]}
        args={[width, depth]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#999999"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#666666"
        fadeDistance={Math.max(width, depth)}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
    </group>
  );
}

/**
 * Baseboard around room perimeter
 */
function Baseboard({ width, depth, height }: { width: number; depth: number; height: number }) {
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 }), []);

  return (
    <group>
      {/* Back */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} material={material}>
        <boxGeometry args={[width, height, 0.02]} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 + 0.01, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={material}>
        <boxGeometry args={[depth, height, 0.02]} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 - 0.01, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={material}>
        <boxGeometry args={[depth, height, 0.02]} />
      </mesh>
    </group>
  );
}

/**
 * Product placed in the room
 */
interface ProductInRoomProps {
  product: Product;
  roomDimensions: { width: number; depth: number; height: number };
}

function ProductInRoom({ product, roomDimensions }: ProductInRoomProps) {
  if (isArtProduct(product)) {
    // Mount art on the back wall
    const artY = roomDimensions.height * 0.5 + 0.3; // Center + slight offset
    return (
      <group position={[0, artY, -roomDimensions.depth / 2 + 0.1]}>
        <ProceduralFrame
          imageUri={product.imageUri}
          frameColor={product.frameColor}
          dimensions={product.dimensions}
        />
      </group>
    );
  }

  if (isTableProduct(product)) {
    // Place furniture on the floor, centered
    return (
      <group position={[0, 0, 0]}>
        <Float speed={0} rotationIntensity={0} floatIntensity={0}>
          <ModelViewer
            modelUri={product.modelUri}
            scale={product.scale}
          />
        </Float>
      </group>
    );
  }

  return null;
}

/**
 * Head Tracking Indicator for VR
 */
function HeadTrackingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      // Position indicator at the edge of view
      meshRef.current.position.copy(camera.position);
      meshRef.current.position.y -= 1;
      meshRef.current.position.z -= 0.5;
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[0.02, 0.025, 32]} />
      <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
    </mesh>
  );
}

/**
 * Loading Indicator
 */
function LoadingIndicator() {
  return (
    <mesh position={[0, 1.5, -2]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

// Icon Components
function RoomIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default VRPreviewMode;
