import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Product, ArtProduct, TableProduct, GalleryState, VibeCategory, AudioTrack } from '@/lib/types';
import { MOCK_ASSETS } from '@/lib/constants';

// ============================================
// Mock Art Products
// ============================================

const MOCK_ART_PRODUCTS: ArtProduct[] = [
  {
    id: 'art-001',
    name: 'Abstract Horizons',
    type: 'art',
    vibe: 'calm',
    imageUri: MOCK_ASSETS.images.art1,
    frameColor: '#5c4033',
    dimensions: { width: 1.2, height: 0.9 },
    price: 450,
    description: 'A serene abstract landscape that evokes peaceful horizons at dusk.',
  },
  {
    id: 'art-002',
    name: 'Urban Rhythm',
    type: 'art',
    vibe: 'upbeat',
    imageUri: MOCK_ASSETS.images.art2,
    frameColor: '#1a1a2e',
    dimensions: { width: 1.0, height: 1.4 },
    price: 620,
    description: 'Dynamic cityscape capturing the energy of metropolitan life.',
  },
  {
    id: 'art-003',
    name: 'Nature\'s Whisper',
    type: 'art',
    vibe: 'ambient',
    imageUri: MOCK_ASSETS.images.art3,
    frameColor: '#2d3436',
    dimensions: { width: 1.5, height: 1.0 },
    price: 380,
    description: 'Organic forms inspired by the quiet beauty of natural patterns.',
  },
];

// ============================================
// Mock Table Products
// ============================================

const MOCK_TABLE_PRODUCTS: TableProduct[] = [
  {
    id: 'table-001',
    name: 'Modern Coffee Table',
    type: 'table',
    vibe: 'upbeat',
    modelUri: MOCK_ASSETS.models.table,
    scale: 1.5,
    price: 1200,
    description: 'Sleek minimalist coffee table with clean geometric lines.',
  },
];

// ============================================
// Audio Tracks
// ============================================

const AUDIO_TRACKS: Record<VibeCategory, AudioTrack> = {
  calm: {
    id: 'track-calm',
    name: 'Peaceful Ambience',
    vibe: 'calm',
    url: MOCK_ASSETS.audio.calm,
  },
  upbeat: {
    id: 'track-upbeat',
    name: 'Energetic Beats',
    vibe: 'upbeat',
    url: MOCK_ASSETS.audio.upbeat,
  },
  ambient: {
    id: 'track-ambient',
    name: 'Ambient Soundscape',
    vibe: 'ambient',
    url: MOCK_ASSETS.audio.ambient,
  },
};

// ============================================
// Combined Products
// ============================================

const ALL_PRODUCTS: Product[] = [...MOCK_ART_PRODUCTS, ...MOCK_TABLE_PRODUCTS];

// ============================================
// Zustand Store
// ============================================

export const useGalleryStore = create<GalleryState>()(
  immer((set, get) => ({
    products: ALL_PRODUCTS,
    currentIndex: 0,
    currentProduct: ALL_PRODUCTS[0] || null,
    isTransitioning: false,
    audioTracks: AUDIO_TRACKS,

    nextProduct: () => {
      const { products, currentIndex, isTransitioning } = get();
      if (isTransitioning || currentIndex >= products.length - 1) return;

      set((state) => {
        state.isTransitioning = true;
        state.currentIndex = currentIndex + 1;
        state.currentProduct = products[currentIndex + 1];
      });

      // Reset transitioning state after animation
      setTimeout(() => {
        set((state) => {
          state.isTransitioning = false;
        });
      }, 800);
    },

    previousProduct: () => {
      const { products, currentIndex, isTransitioning } = get();
      if (isTransitioning || currentIndex <= 0) return;

      set((state) => {
        state.isTransitioning = true;
        state.currentIndex = currentIndex - 1;
        state.currentProduct = products[currentIndex - 1];
      });

      // Reset transitioning state after animation
      setTimeout(() => {
        set((state) => {
          state.isTransitioning = false;
        });
      }, 800);
    },

    goToProduct: (index: number) => {
      const { products, isTransitioning } = get();
      if (isTransitioning || index < 0 || index >= products.length) return;

      set((state) => {
        state.isTransitioning = true;
        state.currentIndex = index;
        state.currentProduct = products[index];
      });

      // Reset transitioning state after animation
      setTimeout(() => {
        set((state) => {
          state.isTransitioning = false;
        });
      }, 800);
    },

    setTransitioning: (value: boolean) => {
      set((state) => {
        state.isTransitioning = value;
      });
    },
  }))
);
