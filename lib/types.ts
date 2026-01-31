// ============================================
// Product Types
// ============================================

export type ProductType = 'art' | 'table';
export type VibeCategory = 'calm' | 'upbeat' | 'ambient';

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  vibe: VibeCategory;
}

export interface ArtProduct extends BaseProduct {
  type: 'art';
  imageUri: string;
  frameColor: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface TableProduct extends BaseProduct {
  type: 'table';
  modelUri: string;
  scale: number;
}

export type Product = ArtProduct | TableProduct;

export function isArtProduct(product: Product): product is ArtProduct {
  return product.type === 'art';
}

export function isTableProduct(product: Product): product is TableProduct {
  return product.type === 'table';
}

export interface AudioTrack {
  id: string;
  name: string;
  vibe: VibeCategory;
  url: string;
}

export interface GalleryState {
  products: Product[];
  currentIndex: number;
  currentProduct: Product | null;
  isTransitioning: boolean;
  audioTracks: Record<VibeCategory, AudioTrack>;
  nextProduct: () => void;
  previousProduct: () => void;
  goToProduct: (index: number) => void;
  setTransitioning: (value: boolean) => void;
}

export type NavigationDirection = 'next' | 'previous';

export interface NavigationState {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentIndex: number;
  totalProducts: number;
}

// ============================================
// XR Preview Types
// ============================================

/**
 * XR Preview mode options
 * - 'ar': Augmented Reality - transparent background allowing real-world overlay
 * - 'vr': Virtual Reality - immersive room environment with head tracking
 */
export type XRPreviewMode = 'ar' | 'vr';

/**
 * VR Room template options
 */
export type VRRoomTemplate = 'living-room' | 'bedroom' | 'studio' | 'custom';

/**
 * XR Preview session state
 */
export interface XRPreviewState {
  isActive: boolean;
  mode: XRPreviewMode | null;
  selectedProduct: Product | null;
  vrRoomTemplate: VRRoomTemplate;
  isHeadTrackingEnabled: boolean;
}

/**
 * VR Room configuration
 */
export interface VRRoomConfig {
  id: VRRoomTemplate;
  name: string;
  description: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  previewImage?: string;
}