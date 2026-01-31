'use client';

import { useState, useCallback } from 'react';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { KNOWN_DEVICE_PROFILES } from '../../lib/constants';

// Maximum number of features to show in collapsed view
const MAX_COLLAPSED_FEATURES = 2;

/**
 * DeviceInfoDisplay component
 * Shows detected device capabilities and features.
 * Useful for debugging and for showing users what features are available.
 */
export function DeviceInfoDisplay() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    deviceCategory,
    knownDevice,
    platform,
    camera,
    xr,
    isLoading,
    getRecommendations,
    getDeviceDescription,
    requestCameraPermission,
  } = useDeviceCapabilities();

  const recommendations = getRecommendations();
  const deviceDescription = getDeviceDescription();

  const handleRequestCamera = useCallback(async () => {
    const success = await requestCameraPermission();
    if (success) {
      // Permission granted, capabilities will refresh automatically
    }
  }, [requestCameraPermission]);

  if (isLoading) {
    return (
      <div className="glass-dark rounded-xl p-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-white/20"></div>
          <div className="h-4 w-24 rounded bg-white/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-xl overflow-hidden transition-smooth">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-smooth"
      >
        <div className="flex items-center gap-3">
          <DeviceIcon category={deviceCategory} />
          <div className="text-left">
            <div className="text-sm font-medium text-white">{deviceDescription}</div>
            <div className="text-xs text-white/50">
              {recommendations.features.slice(0, MAX_COLLAPSED_FEATURES).join(' • ') || 'Basic features'}
            </div>
          </div>
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3 animate-slide-up">
          {/* Device Category */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Device Type</div>
            <div className="text-sm text-white capitalize">
              {deviceCategory.replace('-', ' ')}
              {knownDevice !== 'unknown' && (
                <span className="text-white/50 ml-1">
                  ({KNOWN_DEVICE_PROFILES[knownDevice].name})
                </span>
              )}
            </div>
          </div>

          {/* Platform Info */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Platform</div>
            <div className="flex flex-wrap gap-2">
              <Badge>{platform.os}</Badge>
              <Badge>{platform.browser}</Badge>
              {platform.isMobile && <Badge>Mobile</Badge>}
              {platform.isTablet && <Badge>Tablet</Badge>}
              {platform.isTouchDevice && <Badge>Touch</Badge>}
            </div>
          </div>

          {/* Camera Capabilities */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Camera</div>
            <div className="space-y-1">
              <CapabilityRow 
                label="Camera Available" 
                available={camera.hasCamera} 
              />
              {camera.hasCamera && (
                <>
                  <CapabilityRow label="Front Camera" available={camera.hasFrontCamera} />
                  <CapabilityRow label="Rear Camera" available={camera.hasRearCamera} />
                </>
              )}
              <CapabilityRow 
                label="Permission" 
                available={camera.cameraPermissionState === 'granted'}
                status={camera.cameraPermissionState}
              />
            </div>
            {camera.supportsGetUserMedia && camera.cameraPermissionState !== 'granted' && (
              <button
                onClick={handleRequestCamera}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-smooth"
              >
                Request Camera Access
              </button>
            )}
          </div>

          {/* XR Capabilities */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">XR Features</div>
            <div className="space-y-1">
              <CapabilityRow label="WebXR Support" available={xr.supportsWebXR} />
              <CapabilityRow label="AR Mode" available={xr.supportsImmersiveAR} />
              <CapabilityRow label="VR Mode" available={xr.supportsImmersiveVR} />
              <CapabilityRow label="Hand Tracking" available={xr.supportsHandTracking} />
              <CapabilityRow label="Hit Test (Room Scan)" available={xr.supportsHitTest} />
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.features.length > 0 && (
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
                Recommended Features
              </div>
              <div className="flex flex-wrap gap-1">
                {recommendations.features.map((feature) => (
                  <Badge key={feature} variant="success">{feature}</Badge>
                ))}
              </div>
              {recommendations.recommendedMode && (
                <div className="mt-2 text-xs text-white/50">
                  Suggested mode: <span className="text-white font-medium uppercase">
                    {recommendations.recommendedMode}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Device category icon
function DeviceIcon({ category }: { category: string }) {
  const iconClass = "w-5 h-5 text-white/70";
  
  switch (category) {
    case 'ar-glasses':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
        </svg>
      );
    case 'vr-headset':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5l-1.5 2-1.5-2H4a2 2 0 0 1-2-2V8Z" />
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

// Chevron icon for expand/collapse
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg 
      className={`w-4 h-4 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Badge component
function Badge({ 
  children, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' 
}) {
  const variantClasses = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

// Capability row with checkmark
function CapabilityRow({ 
  label, 
  available, 
  status 
}: { 
  label: string; 
  available: boolean; 
  status?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/70">{label}</span>
      <span className={available ? 'text-green-400' : 'text-white/30'}>
        {status || (available ? '✓' : '✗')}
      </span>
    </div>
  );
}

export default DeviceInfoDisplay;
