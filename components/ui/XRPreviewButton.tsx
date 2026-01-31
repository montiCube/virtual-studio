'use client';

import { useState, useCallback, useEffect } from 'react';
import { useXRPreviewStore } from '../../stores/XRPreviewStore';
import type { Product } from '../../lib/types';

interface XRPreviewButtonProps {
  product: Product;
}

/**
 * XR Preview mode selection button
 * Provides two preview options:
 * 1. AR Mode - Transparent background for real-world overlay
 * 2. VR Mode - Virtual room environment with head tracking
 */
export function XRPreviewButton({ product }: XRPreviewButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isVRSupported, setIsVRSupported] = useState<boolean | null>(null);
  const { startARPreview, startVRPreview } = useXRPreviewStore();

  // Check WebXR support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      const xr = (navigator as Navigator & { xr: XRSystem }).xr;
      
      // Check AR support
      xr?.isSessionSupported('immersive-ar')
        .then(setIsARSupported)
        .catch(() => setIsARSupported(false));
      
      // Check VR support
      xr?.isSessionSupported('immersive-vr')
        .then(setIsVRSupported)
        .catch(() => setIsVRSupported(false));
    } else {
      setIsARSupported(false);
      setIsVRSupported(false);
    }
  }, []);

  const handleARPreview = useCallback(() => {
    startARPreview(product);
    setIsMenuOpen(false);
  }, [product, startARPreview]);

  const handleVRPreview = useCallback(() => {
    startVRPreview(product);
    setIsMenuOpen(false);
  }, [product, startVRPreview]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Delay to prevent immediate close
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  // Don't render if neither AR nor VR is supported
  const hasAnySupport = isARSupported || isVRSupported;
  const isLoading = isARSupported === null || isVRSupported === null;

  if (isLoading) {
    return null; // Still checking support
  }

  if (!hasAnySupport) {
    return null; // No XR support available
  }

  return (
    <div className="relative">
      {/* Main Preview Button */}
      <button
        onClick={toggleMenu}
        className="xr-button-secondary text-sm flex items-center gap-2"
        aria-label="Open XR Preview Options"
        aria-expanded={isMenuOpen}
      >
        <XRIcon />
        Preview in XR
      </button>

      {/* Preview Options Menu */}
      {isMenuOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 glass-strong rounded-xl p-2 min-w-[200px] animate-slide-up"
          role="menu"
        >
          <p className="text-xs text-white/50 px-3 py-1 uppercase tracking-wider">
            Choose Preview Mode
          </p>
          
          {/* AR Option */}
          {isARSupported && (
            <button
              onClick={handleARPreview}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-smooth text-left"
              role="menuitem"
            >
              <ARIcon />
              <div>
                <div className="text-sm font-medium text-white">AR Preview</div>
                <div className="text-xs text-white/50">See item in your space</div>
              </div>
            </button>
          )}
          
          {/* VR Option */}
          {isVRSupported && (
            <button
              onClick={handleVRPreview}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-smooth text-left"
              role="menuitem"
            >
              <VRIcon />
              <div>
                <div className="text-sm font-medium text-white">VR Room</div>
                <div className="text-xs text-white/50">Place in virtual room</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// XR Combined Icon
function XRIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  );
}

// AR Icon
function ARIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-400"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  );
}

// VR Icon
function VRIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-purple-400"
    >
      <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5l-1.5 2-1.5-2H4a2 2 0 0 1-2-2V8Z" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  );
}

export default XRPreviewButton;
