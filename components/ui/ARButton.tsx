'use client';

import { useState, useCallback, useEffect } from 'react';

interface ARButtonProps {
  onEnterAR?: () => void;
  onExitAR?: () => void;
}

/**
 * WebXR AR session toggle button
 */
export function ARButton({ onEnterAR, onExitAR }: ARButtonProps) {
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isInAR, setIsInAR] = useState(false);

  // Check WebXR AR support on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as Navigator & { xr: XRSystem }).xr
        ?.isSessionSupported('immersive-ar')
        .then(setIsARSupported)
        .catch(() => setIsARSupported(false));
    } else {
      setIsARSupported(false);
    }
  }, []);

  const handleARToggle = useCallback(async () => {
    if (isInAR) {
      setIsInAR(false);
      onExitAR?.();
    } else {
      setIsInAR(true);
      onEnterAR?.();
    }
  }, [isInAR, onEnterAR, onExitAR]);

  // Don't render if AR is not supported or still checking
  if (isARSupported === null || isARSupported === false) {
    return null;
  }

  return (
    <div className="absolute bottom-8 right-8 pointer-events-auto">
      <button
        onClick={handleARToggle}
        className={`xr-button ${isInAR ? 'bg-red-600/50 hover:bg-red-500/60' : 'xr-button-primary'}`}
        aria-label={isInAR ? 'Exit AR' : 'Enter AR'}
      >
        <span className="flex items-center gap-2">
          <ARIcon />
          {isInAR ? 'Exit AR' : 'View in AR'}
        </span>
      </button>
    </div>
  );
}

/**
 * AR icon SVG
 */
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
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  );
}

export default ARButton;
