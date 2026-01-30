'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3D gallery to avoid SSR issues
const ImmersiveGallery = dynamic(
  () => import('../components/canvas/ImmersiveGallery'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
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

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <ImmersiveGallery />
      </Suspense>
    </main>
  );
}
