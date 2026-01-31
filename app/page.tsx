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

// Dynamically import device info display
const DeviceInfoDisplay = dynamic(
  () => import('../components/ui/DeviceInfoDisplay'),
  { ssr: false }
);

// Dynamically import commerce UI components
const ProductDetailModal = dynamic(
  () => import('../components/ui/ProductDetailModal'),
  { ssr: false }
);

const CartPanel = dynamic(
  () => import('../components/ui/CartPanel'),
  { ssr: false }
);

const CartButton = dynamic(
  () => import('../components/ui/CartButton'),
  { ssr: false }
);

const WishlistButton = dynamic(
  () => import('../components/ui/WishlistButton'),
  { ssr: false }
);

const CheckoutFlow = dynamic(
  () => import('../components/ui/CheckoutFlow'),
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
      
      {/* Header Actions - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto flex items-center gap-2">
        <WishlistButton />
        <CartButton />
      </div>
      
      {/* Device Info Display - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <DeviceInfoDisplay />
      </div>
      
      {/* XR Preview Mode Overlay */}
      <XRPreviewOverlay />

      {/* Commerce Modals */}
      <ProductDetailModal />
      <CartPanel />
      <CheckoutFlow />
    </main>
  );
}
