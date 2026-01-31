'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useXRPreviewStore } from '../stores/XRPreviewStore';

// Dynamically import the 3D gallery to avoid SSR issues
const ImmersiveGallery = dynamic(
  () => import('../components/canvas/ImmersiveGallery'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

// Dynamically import XR preview modes
const ARPreviewMode = dynamic(
  () => import('../components/canvas/ARPreviewMode'),
  { ssr: false }
);

const VRPreviewMode = dynamic(
  () => import('../components/canvas/VRPreviewMode'),
  { ssr: false }
);

// Loading screen component
function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
        <p className="text-white/70 text-lg">Loading Virtual Studio...</p>
      </div>
    </div>
  );
}

// XR Preview Mode Wrapper
function XRPreviewOverlay() {
  const { isActive, mode } = useXRPreviewStore();

  if (!isActive || !mode) {
    return null;
  }

  return mode === 'ar' ? <ARPreviewMode /> : <VRPreviewMode />;
}

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <ImmersiveGallery />
      </Suspense>
      
      {/* XR Preview Mode Overlay */}
      <XRPreviewOverlay />
    </main>
  );
}
