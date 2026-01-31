'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Canvas3DErrorFallbackProps {
  onRetry?: () => void;
}

/**
 * Fallback component shown when 3D canvas fails to load
 */
function Canvas3DErrorFallback({ onRetry }: Canvas3DErrorFallbackProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black">
      <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">3D View Unavailable</h2>
        <p className="text-white/70 mb-4 text-sm">
          We couldn&apos;t load the 3D experience. This might be due to:
        </p>
        <ul className="text-left text-white/60 text-sm mb-6 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>WebGL not supported by your browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Hardware acceleration disabled</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Graphics driver issues</span>
          </li>
        </ul>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="xr-button-secondary"
          >
            Refresh Page
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="xr-button-primary"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Canvas3DErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Specialized error boundary for 3D canvas components
 */
export function Canvas3DErrorBoundary({ children }: Canvas3DErrorBoundaryProps) {
  const [retryKey, setRetryKey] = React.useState(0);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary
      key={retryKey}
      fallback={<Canvas3DErrorFallback onRetry={handleRetry} />}
      onError={(error) => {
        console.error('3D Canvas Error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default Canvas3DErrorBoundary;
