'use client';

import { useState, useCallback, useEffect } from 'react';
import { useXRPreviewStore } from '../../stores/XRPreviewStore';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import type { Product } from '../../lib/types';

// UI Constants
const MENU_MIN_WIDTH = 'min-w-[240px]';

interface XRPreviewButtonProps {
  product: Product;
}

/**
 * XR Preview mode selection button
 * Provides two preview options:
 * 1. AR Mode - Transparent background for real-world overlay
 * 2. VR Mode - Virtual room environment with head tracking
 * 
 * Uses device detection to:
 * - Show recommended mode based on device capabilities
 * - Indicate if room scanning is available
 * - Adapt descriptions for known devices (Quest, RayNeo, Rokid, etc.)
 */
export function XRPreviewButton({ product }: XRPreviewButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isVRSupported, setIsVRSupported] = useState<boolean | null>(null);
  const { startARPreview, startVRPreview } = useXRPreviewStore();
  
  // Get device capabilities for enhanced recommendations
  const { 
    deviceCategory, 
    knownDevice, 
    camera, 
    xr, 
    isLoading: isDeviceLoading,
    getRecommendations,
    getDeviceDescription,
  } = useDeviceCapabilities();

  const recommendations = getRecommendations();
  const deviceDescription = getDeviceDescription();

  // Check WebXR support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      const xrNav = (navigator as Navigator & { xr: XRSystem }).xr;
      
      // Check AR support
      xrNav?.isSessionSupported('immersive-ar')
        .then(setIsARSupported)
        .catch(() => setIsARSupported(false));
      
      // Check VR support
      xrNav?.isSessionSupported('immersive-vr')
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
  const isLoading = isARSupported === null || isVRSupported === null || isDeviceLoading;

  if (isLoading) {
    return null; // Still checking support
  }

  if (!hasAnySupport) {
    return null; // No XR support available
  }

  // Get device-specific descriptions
  const getARDescription = () => {
    if (recommendations.canScanRoom && camera.hasCamera) {
      return 'Use camera to scan & place item';
    }
    if (recommendations.canUsePassthrough) {
      return 'See item in your space';
    }
    return 'See item in your space';
  };

  const getVRDescription = () => {
    if (recommendations.canUseHandTracking) {
      return 'Place in virtual room with hand tracking';
    }
    return 'Place in virtual room';
  };

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
        {recommendations.recommendedMode && (
          <span className="text-xs text-white/40">
            ({recommendations.recommendedMode.toUpperCase()} recommended)
          </span>
        )}
      </button>

      {/* Preview Options Menu */}
      {isMenuOpen && (
        <div 
          className={`absolute bottom-full left-0 mb-2 glass-strong rounded-xl p-2 ${MENU_MIN_WIDTH} animate-slide-up`}
          role="menu"
        >
          {/* Device Info Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <DeviceCategoryIcon category={deviceCategory} />
              <div>
                <div className="text-xs font-medium text-white">{deviceDescription}</div>
                {knownDevice !== 'unknown' && (
                  <div className="text-xs text-white/40">Optimized experience available</div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-white/50 px-3 py-1 uppercase tracking-wider">
            Choose Preview Mode
          </p>
          
          {/* AR Option */}
          {isARSupported && (
            <button
              onClick={handleARPreview}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-smooth text-left ${
                recommendations.recommendedMode === 'ar' ? 'bg-blue-500/10 border border-blue-500/30' : ''
              }`}
              role="menuitem"
            >
              <ARIcon />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">AR Preview</span>
                  {recommendations.recommendedMode === 'ar' && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50">{getARDescription()}</div>
                {recommendations.canScanRoom && (
                  <div className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
                    <CameraIcon />
                    Room scanning available
                  </div>
                )}
              </div>
            </button>
          )}
          
          {/* VR Option */}
          {isVRSupported && (
            <button
              onClick={handleVRPreview}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-smooth text-left ${
                recommendations.recommendedMode === 'vr' ? 'bg-purple-500/10 border border-purple-500/30' : ''
              }`}
              role="menuitem"
            >
              <VRIcon />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">VR Room</span>
                  {recommendations.recommendedMode === 'vr' && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50">{getVRDescription()}</div>
                {recommendations.canUseHandTracking && (
                  <div className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
                    <HandIcon />
                    Hand tracking supported
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Camera-based room scan option for mobile devices */}
          {camera.hasCamera && !xr.supportsWebXR && (
            <div className="px-3 py-2 mt-2 border-t border-white/10">
              <div className="text-xs text-white/40">
                <CameraIcon className="inline mr-1" />
                Your device has a camera that could be used for room scanning in future updates.
              </div>
            </div>
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

// Camera Icon
function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

// Hand Icon
function HandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

// Device category icon
function DeviceCategoryIcon({ category }: { category: string }) {
  const iconClass = "w-5 h-5 text-white/70";
  
  switch (category) {
    case 'ar-glasses':
    case 'vr-headset':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
        </svg>
      );
    case 'mobile':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'tablet':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

export default XRPreviewButton;
