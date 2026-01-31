import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Product, XRPreviewMode, VRRoomTemplate, XRPreviewState } from '../lib/types';
import { XR_PREVIEW_CONFIG, VR_ROOM_TEMPLATES } from '../lib/constants';

// ============================================
// XR Preview Store Interface
// ============================================

interface XRPreviewStoreState extends XRPreviewState {
  // Actions
  startARPreview: (product: Product) => void;
  startVRPreview: (product: Product) => void;
  exitPreview: () => void;
  setVRRoomTemplate: (template: VRRoomTemplate) => void;
  toggleHeadTracking: () => void;
  
  // Getters
  getActiveMode: () => XRPreviewMode | null;
  isPreviewActive: () => boolean;
}

// ============================================
// XR Preview Store Implementation
// ============================================

export const useXRPreviewStore = create<XRPreviewStoreState>()(
  immer((set, get) => ({
    // Initial state
    isActive: false,
    mode: null,
    selectedProduct: null,
    vrRoomTemplate: XR_PREVIEW_CONFIG.vr.defaultRoomTemplate,
    isHeadTrackingEnabled: XR_PREVIEW_CONFIG.vr.headTrackingEnabled,

    // Start AR Preview - transparent background mode
    startARPreview: (product: Product) => {
      set((state) => {
        state.isActive = true;
        state.mode = 'ar';
        state.selectedProduct = product;
      });
    },

    // Start VR Preview - virtual room environment mode
    startVRPreview: (product: Product) => {
      set((state) => {
        state.isActive = true;
        state.mode = 'vr';
        state.selectedProduct = product;
      });
    },

    // Exit any preview mode
    exitPreview: () => {
      set((state) => {
        state.isActive = false;
        state.mode = null;
        state.selectedProduct = null;
      });
    },

    // Set VR room template
    setVRRoomTemplate: (template: VRRoomTemplate) => {
      set((state) => {
        state.vrRoomTemplate = template;
      });
    },

    // Toggle head tracking for VR mode
    toggleHeadTracking: () => {
      set((state) => {
        state.isHeadTrackingEnabled = !state.isHeadTrackingEnabled;
      });
    },

    // Get currently active mode
    getActiveMode: () => get().mode,

    // Check if any preview is active
    isPreviewActive: () => get().isActive,
  }))
);
