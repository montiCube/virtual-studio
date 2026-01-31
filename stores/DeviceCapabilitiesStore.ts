import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  DeviceCapabilities,
  DeviceCategory,
  KnownXRDevice,
  CameraCapabilities,
  XRCapabilities,
  PlatformInfo,
} from '../lib/types';

// ============================================
// Device Capabilities Store Interface
// ============================================

interface DeviceCapabilitiesStoreState extends DeviceCapabilities {
  // Actions
  setCapabilities: (capabilities: Partial<DeviceCapabilities>) => void;
  setLoading: (isLoading: boolean) => void;
  setCameraCapabilities: (camera: CameraCapabilities) => void;
  setXRCapabilities: (xr: XRCapabilities) => void;
  setPlatformInfo: (platform: PlatformInfo) => void;
  setDeviceInfo: (category: DeviceCategory, knownDevice: KnownXRDevice) => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState: DeviceCapabilities = {
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
};

// ============================================
// Device Capabilities Store Implementation
// ============================================

export const useDeviceCapabilitiesStore = create<DeviceCapabilitiesStoreState>()(
  immer((set) => ({
    ...initialState,

    // Set all capabilities at once
    setCapabilities: (capabilities: Partial<DeviceCapabilities>) => {
      set((state) => {
        Object.assign(state, capabilities);
        state.lastUpdated = Date.now();
      });
    },

    // Set loading state
    setLoading: (isLoading: boolean) => {
      set((state) => {
        state.isLoading = isLoading;
      });
    },

    // Set camera capabilities
    setCameraCapabilities: (camera: CameraCapabilities) => {
      set((state) => {
        state.camera = camera;
        state.lastUpdated = Date.now();
      });
    },

    // Set XR capabilities
    setXRCapabilities: (xr: XRCapabilities) => {
      set((state) => {
        state.xr = xr;
        state.lastUpdated = Date.now();
      });
    },

    // Set platform info
    setPlatformInfo: (platform: PlatformInfo) => {
      set((state) => {
        state.platform = platform;
        state.lastUpdated = Date.now();
      });
    },

    // Set device identification info
    setDeviceInfo: (category: DeviceCategory, knownDevice: KnownXRDevice) => {
      set((state) => {
        state.deviceCategory = category;
        state.knownDevice = knownDevice;
        state.lastUpdated = Date.now();
      });
    },

    // Reset to initial state
    reset: () => {
      set(() => initialState);
    },
  }))
);
