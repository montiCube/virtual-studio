'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  DeviceCapabilities,
  DeviceCategory,
  KnownXRDevice,
  CameraCapabilities,
  XRCapabilities,
  PlatformInfo,
  DeviceFeatureRecommendations,
  XRPreviewMode,
} from '../lib/types';
import {
  XR_DEVICE_SIGNATURES,
  KNOWN_DEVICE_PROFILES,
  MOBILE_DEVICE_PATTERNS,
  BROWSER_PATTERNS,
} from '../lib/constants';

// ============================================
// Device Detection Utilities
// ============================================

/**
 * Detect the operating system from user agent
 */
function detectOS(userAgent: string): PlatformInfo['os'] {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  if (/Windows/i.test(userAgent)) return 'windows';
  if (/Mac OS X/i.test(userAgent)) return 'macos';
  if (/Linux/i.test(userAgent)) return 'linux';
  return 'unknown';
}

/**
 * Detect the browser from user agent
 */
function detectBrowser(userAgent: string): PlatformInfo['browser'] {
  if (BROWSER_PATTERNS.edge.test(userAgent)) return 'edge';
  if (BROWSER_PATTERNS.samsung.test(userAgent)) return 'samsung';
  if (BROWSER_PATTERNS.opera.test(userAgent)) return 'opera';
  if (BROWSER_PATTERNS.chrome.test(userAgent)) return 'chrome';
  if (BROWSER_PATTERNS.safari.test(userAgent)) return 'safari';
  if (BROWSER_PATTERNS.firefox.test(userAgent)) return 'firefox';
  return 'unknown';
}

/**
 * Detect known XR device from user agent
 */
function detectKnownXRDevice(userAgent: string): KnownXRDevice {
  for (const [device, patterns] of Object.entries(XR_DEVICE_SIGNATURES)) {
    for (const pattern of patterns) {
      if (userAgent.includes(pattern)) {
        return device as KnownXRDevice;
      }
    }
  }
  return 'unknown';
}

/**
 * Determine device category based on detected information
 */
function determineDeviceCategory(
  knownDevice: KnownXRDevice,
  platform: PlatformInfo
): DeviceCategory {
  // Check if it's a known XR device first
  if (knownDevice !== 'unknown') {
    const profile = KNOWN_DEVICE_PROFILES[knownDevice];
    return profile.category;
  }
  
  // Otherwise, determine based on platform
  if (platform.isTablet) return 'tablet';
  if (platform.isMobile) return 'mobile';
  return 'desktop';
}

/**
 * Get platform information
 */
function getPlatformInfo(): PlatformInfo {
  if (typeof navigator === 'undefined') {
    return {
      os: 'unknown',
      browser: 'unknown',
      isMobile: false,
      isTablet: false,
      isTouchDevice: false,
      userAgent: '',
    };
  }

  const userAgent = navigator.userAgent;
  const isMobile = MOBILE_DEVICE_PATTERNS.mobile.test(userAgent);
  const isTablet = MOBILE_DEVICE_PATTERNS.tablet.test(userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    os: detectOS(userAgent),
    browser: detectBrowser(userAgent),
    isMobile,
    isTablet,
    isTouchDevice,
    userAgent,
  };
}

/**
 * Check camera capabilities
 */
async function checkCameraCapabilities(): Promise<CameraCapabilities> {
  const capabilities: CameraCapabilities = {
    hasCamera: false,
    hasFrontCamera: false,
    hasRearCamera: false,
    supportsMediaDevices: false,
    supportsGetUserMedia: false,
    cameraPermissionState: 'unknown',
  };

  if (typeof navigator === 'undefined') {
    return capabilities;
  }

  // Check MediaDevices API support
  capabilities.supportsMediaDevices = 'mediaDevices' in navigator;
  capabilities.supportsGetUserMedia = !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );

  // Check camera permission state
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      capabilities.cameraPermissionState = permission.state;
    } catch {
      // Permission query not supported for camera
      capabilities.cameraPermissionState = 'unknown';
    }
  }

  // Enumerate devices to check for cameras
  if (capabilities.supportsMediaDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      capabilities.hasCamera = videoDevices.length > 0;
      
      // Try to determine front/rear cameras
      for (const device of videoDevices) {
        const label = device.label.toLowerCase();
        if (label.includes('front') || label.includes('facetime') || label.includes('user')) {
          capabilities.hasFrontCamera = true;
        }
        if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
          capabilities.hasRearCamera = true;
        }
      }
      
      // If we found cameras but couldn't determine type, assume both exist on mobile
      if (capabilities.hasCamera && !capabilities.hasFrontCamera && !capabilities.hasRearCamera) {
        const platform = getPlatformInfo();
        if (platform.isMobile || platform.isTablet) {
          capabilities.hasFrontCamera = true;
          capabilities.hasRearCamera = true;
        }
      }
    } catch {
      // enumerateDevices failed
    }
  }

  return capabilities;
}

/**
 * Check XR capabilities
 */
async function checkXRCapabilities(): Promise<XRCapabilities> {
  const capabilities: XRCapabilities = {
    supportsWebXR: false,
    supportsImmersiveAR: false,
    supportsImmersiveVR: false,
    supportsInlineXR: false,
    supportsHandTracking: false,
    supportsHitTest: false,
    supportsDomOverlay: false,
  };

  if (typeof navigator === 'undefined' || !('xr' in navigator)) {
    return capabilities;
  }

  const xr = (navigator as Navigator & { xr: XRSystem }).xr;
  if (!xr) return capabilities;

  capabilities.supportsWebXR = true;

  // Check session support types
  try {
    capabilities.supportsImmersiveAR = await xr.isSessionSupported('immersive-ar');
  } catch {
    capabilities.supportsImmersiveAR = false;
  }

  try {
    capabilities.supportsImmersiveVR = await xr.isSessionSupported('immersive-vr');
  } catch {
    capabilities.supportsImmersiveVR = false;
  }

  try {
    capabilities.supportsInlineXR = await xr.isSessionSupported('inline');
  } catch {
    capabilities.supportsInlineXR = false;
  }

  // Check for advanced features (these would require an active session to fully verify)
  // For now, we estimate based on AR support
  if (capabilities.supportsImmersiveAR) {
    capabilities.supportsHitTest = true; // AR usually supports hit-test
    capabilities.supportsDomOverlay = true; // AR usually supports DOM overlay
  }

  return capabilities;
}

// ============================================
// Main Hook
// ============================================

/**
 * Hook for detecting device capabilities including camera, XR, and platform info.
 * Useful for adapting the experience based on the device type:
 * - AR glasses (RayNeo, Rokid, etc.)
 * - VR headsets (Meta Quest, etc.)
 * - Mobile devices (iPhone, Android)
 * - Desktop computers
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    deviceCategory: 'unknown',
    knownDevice: 'unknown',
    platform: {
      os: 'unknown',
      browser: 'unknown',
      isMobile: false,
      isTablet: false,
      isTouchDevice: false,
      userAgent: '',
    },
    camera: {
      hasCamera: false,
      hasFrontCamera: false,
      hasRearCamera: false,
      supportsMediaDevices: false,
      supportsGetUserMedia: false,
      cameraPermissionState: 'unknown',
    },
    xr: {
      supportsWebXR: false,
      supportsImmersiveAR: false,
      supportsImmersiveVR: false,
      supportsInlineXR: false,
      supportsHandTracking: false,
      supportsHitTest: false,
      supportsDomOverlay: false,
    },
    isLoading: true,
    lastUpdated: 0,
  });

  // Detect all capabilities
  const detectCapabilities = useCallback(async () => {
    const platform = getPlatformInfo();
    const knownDevice = detectKnownXRDevice(platform.userAgent);
    
    const [camera, xr] = await Promise.all([
      checkCameraCapabilities(),
      checkXRCapabilities(),
    ]);

    // Determine device category
    const deviceCategory = determineDeviceCategory(knownDevice, platform);

    // Update hand tracking based on known device profiles
    if (knownDevice !== 'unknown') {
      const profile = KNOWN_DEVICE_PROFILES[knownDevice];
      xr.supportsHandTracking = profile.hasHandTracking;
    }

    setCapabilities({
      deviceCategory,
      knownDevice,
      platform,
      camera,
      xr,
      isLoading: false,
      lastUpdated: Date.now(),
    });
  }, []);

  // Run detection on mount
  useEffect(() => {
    detectCapabilities();
  }, [detectCapabilities]);

  // Get feature recommendations based on detected capabilities
  const getRecommendations = useCallback((): DeviceFeatureRecommendations => {
    const { deviceCategory, knownDevice, camera, xr } = capabilities;
    
    // Start with known device profile recommendations
    let recommendedMode: XRPreviewMode | null = null;
    const features: string[] = [];
    let canScanRoom = false;
    let canUsePassthrough = false;
    let canUseHandTracking = false;

    if (knownDevice !== 'unknown') {
      const profile = KNOWN_DEVICE_PROFILES[knownDevice];
      recommendedMode = profile.recommendedMode;
      canScanRoom = profile.supportsRoomScan;
      canUsePassthrough = profile.hasPassthrough;
      canUseHandTracking = profile.hasHandTracking;
      
      if (profile.hasPassthrough) features.push('Passthrough AR');
      if (profile.hasHandTracking) features.push('Hand Tracking');
      if (profile.supportsRoomScan) features.push('Room Scanning');
      if (profile.hasCamera) features.push('Camera');
    } else {
      // Determine based on detected capabilities
      if (xr.supportsImmersiveAR) {
        recommendedMode = 'ar';
        canUsePassthrough = true;
        features.push('AR Preview');
      } else if (xr.supportsImmersiveVR) {
        recommendedMode = 'vr';
        features.push('VR Preview');
      }
      
      if (camera.hasCamera) {
        features.push('Camera');
        // Mobile devices with cameras can potentially scan rooms
        if (deviceCategory === 'mobile' || deviceCategory === 'tablet') {
          canScanRoom = true;
          features.push('Room Scanning (via camera)');
        }
      }
    }

    return {
      canScanRoom,
      canUsePassthrough,
      canUseHandTracking,
      recommendedMode,
      features,
    };
  }, [capabilities]);

  // Request camera permission
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (!capabilities.camera.supportsGetUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Re-detect capabilities after permission granted
      await detectCapabilities();
      return true;
    } catch {
      return false;
    }
  }, [capabilities.camera.supportsGetUserMedia, detectCapabilities]);

  // Get a human-readable device description
  const getDeviceDescription = useCallback((): string => {
    const { knownDevice, deviceCategory, platform } = capabilities;
    
    if (knownDevice !== 'unknown') {
      return KNOWN_DEVICE_PROFILES[knownDevice].name;
    }

    switch (deviceCategory) {
      case 'mobile':
        if (platform.os === 'ios') return 'iPhone';
        if (platform.os === 'android') return 'Android Phone';
        return 'Mobile Device';
      case 'tablet':
        if (platform.os === 'ios') return 'iPad';
        if (platform.os === 'android') return 'Android Tablet';
        return 'Tablet';
      case 'desktop':
        if (platform.os === 'unknown') return 'Desktop Computer';
        // Capitalize first letter of known OS names
        const osName = platform.os.charAt(0).toUpperCase() + platform.os.slice(1);
        return `${osName} Computer`;
      default:
        return 'Unknown Device';
    }
  }, [capabilities]);

  return {
    ...capabilities,
    getRecommendations,
    requestCameraPermission,
    getDeviceDescription,
    refresh: detectCapabilities,
  };
}

export type UseDeviceCapabilitiesReturn = ReturnType<typeof useDeviceCapabilities>;
