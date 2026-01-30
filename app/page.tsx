'use client';

import { ImmersiveGallery } from '@/components/canvas/ImmersiveGallery';
import { ProductHUD } from '@/components/ui/ProductHUD';
import { NavigationHint } from '@/components/ui/NavigationHint';
import { ARButton } from '@/components/ui/ARButton';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]">
      {/* 3D Canvas */}
      <div className="canvas-container">
        <ImmersiveGallery />
      </div>

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Header */}
        <header className="fixed top-8 left-8">
          <h1 className="text-2xl font-bold text-white text-glow">
            Virtual Studio
          </h1>
          <p className="text-white/50 text-sm mt-1">
            WebXR Spatial Commerce
          </p>
        </header>

        {/* AR Button */}
        <ARButton />

        {/* Product Information */}
        <ProductHUD />

        {/* Navigation Controls */}
        <NavigationHint />
      </div>
    </main>
  );
}
