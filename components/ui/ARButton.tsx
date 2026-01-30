'use client';

import { useState, useCallback } from 'react';

interface ARButtonProps {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export function ARButton({ onSessionStart, onSessionEnd }: ARButtonProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check WebXR AR support
  useState(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as Navigator & { xr: XRSystem }).xr
        ?.isSessionSupported('immersive-ar')
        .then((supported) => {
          setIsSupported(supported);
        })
        .catch(() => {
          setIsSupported(false);
        });
    } else {
      setIsSupported(false);
    }
  });

  const handleClick = useCallback(async () => {
    if (!isSupported || isLoading) return;

    setIsLoading(true);

    try {
      if (isSessionActive) {
        // End session logic would go here
        setIsSessionActive(false);
        onSessionEnd?.();
      } else {
        // Start session - requires user gesture
        // The actual XR session would be managed by @react-three/xr
        setIsSessionActive(true);
        onSessionStart?.();
      }
    } catch (error) {
      console.error('AR session error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isLoading, isSessionActive, onSessionStart, onSessionEnd]);

  // Don't render if AR is not supported
  if (isSupported === false) {
    return null;
  }

  // Loading state while checking support
  if (isSupported === null) {
    return (
      <div className="fixed top-8 right-8">
        <div className="p-4 bg-glass-light backdrop-blur-glass border border-glass-border rounded-xl">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        fixed top-8 right-8
        px-6 py-3 rounded-xl
        font-medium text-white
        transition-all duration-200
        flex items-center gap-2
        ${
          isSessionActive
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-accent-primary hover:bg-accent-primary/80'
        }
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
      `}
      aria-label={isSessionActive ? 'Exit AR' : 'Enter AR'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSessionActive ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          )}
        </svg>
      )}
      {isSessionActive ? 'Exit AR' : 'View in AR'}
    </button>
  );
}
