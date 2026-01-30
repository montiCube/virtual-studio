import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MOCK_ASSETS, DEFAULT_AUDIO_TRACKS } from '../lib/constants';
import type { Product, ArtProduct, TableProduct, GalleryState, AudioTrack, VibeCategory } from '../lib/types';

// ============================================
// Mock Product Data
// ============================================

const MOCK_ART_PRODUCTS: ArtProduct[] = [
  {
    id: 'art-001',
    name: 'Abstract Serenity',
    type: 'art',
    vibe: 'calm',
    imageUri: MOCK_ASSETS.images.art1,
    frameColor: '#5c4033',
    dimensions: { width: 1.2, height: 0.9 },
    price: 450,
    description: 'A calming abstract piece featuring soft blues and gentle gradients.',
  },
  {
    id: 'art-002',
    name: 'Urban Energy',
    type: 'art',
    vibe: 'upbeat',
    imageUri: MOCK_ASSETS.images.art2,
    frameColor: '#2c2c2c',
    dimensions: { width: 1.0, height: 1.2 },
    price: 650,
    description: 'Dynamic urban landscape with vibrant colors and bold strokes.',
  },
  {
    id: 'art-003',
    name: 'Nature\'s Whisper',
    type: 'art',
    vibe: 'ambient',
    imageUri: MOCK_ASSETS.images.art3,
    frameColor: '#8B4513',
    dimensions: { width: 1.4, height: 1.0 },
    price: 550,
    description: 'A serene nature scene capturing the essence of tranquility.',
  },
];

const MOCK_TABLE_PRODUCTS: TableProduct[] = [
  {
    id: 'table-001',
    name: 'Modern Oak Dining Table',
    type: 'table',
    vibe: 'calm',
    modelUri: MOCK_ASSETS.models.table,
    scale: 1.5,
    price: 1200,
    description: 'Elegant oak dining table with clean modern lines.',
  },
  {
    id: 'table-002',
    name: 'Minimalist Side Chair',
    type: 'table',
    vibe: 'upbeat',
    modelUri: MOCK_ASSETS.models.chair,
    scale: 1.0,
    price: 350,
    description: 'Sleek minimalist chair perfect for any modern space.',
  },
];

// Combine all products
const ALL_PRODUCTS: Product[] = [...MOCK_ART_PRODUCTS, ...MOCK_TABLE_PRODUCTS];

// ============================================
// Gallery Store
// ============================================

export const useGalleryStore = create<GalleryState>()(
  immer((set, get) => ({
    products: ALL_PRODUCTS,
    currentIndex: 0,
    currentProduct: ALL_PRODUCTS[0] ?? null,
    isTransitioning: false,
    audioTracks: DEFAULT_AUDIO_TRACKS,

    nextProduct: () => {
      set((state) => {
        if (state.isTransitioning) return;
        const nextIndex = (state.currentIndex + 1) % state.products.length;
        state.currentIndex = nextIndex;
        state.currentProduct = state.products[nextIndex] ?? null;
        state.isTransitioning = true;
      });
    },

    previousProduct: () => {
      set((state) => {
        if (state.isTransitioning) return;
        const prevIndex = state.currentIndex === 0 
          ? state.products.length - 1 
          : state.currentIndex - 1;
        state.currentIndex = prevIndex;
        state.currentProduct = state.products[prevIndex] ?? null;
        state.isTransitioning = true;
      });
    },

    goToProduct: (index: number) => {
      set((state) => {
        if (state.isTransitioning) return;
        if (index < 0 || index >= state.products.length) return;
        state.currentIndex = index;
        state.currentProduct = state.products[index] ?? null;
        state.isTransitioning = true;
      });
    },

    setTransitioning: (value: boolean) => {
      set((state) => {
        state.isTransitioning = value;
      });
    },
  }))
);

// ============================================
// Cart Store
// ============================================

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    addItem: (product: Product) => {
      set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ product, quantity: 1 });
        }
      });
    },

    removeItem: (productId: string) => {
      set((state) => {
        state.items = state.items.filter(item => item.product.id !== productId);
      });
    },

    updateQuantity: (productId: string, quantity: number) => {
      set((state) => {
        const item = state.items.find(item => item.product.id === productId);
        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter(i => i.product.id !== productId);
          } else {
            item.quantity = quantity;
          }
        }
      });
    },

    clearCart: () => {
      set((state) => {
        state.items = [];
      });
    },

    getTotalPrice: () => {
      return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    },

    getTotalItems: () => {
      return get().items.reduce((total, item) => total + item.quantity, 0);
    },
  }))
);

// ============================================
// Audio Store
// ============================================

interface AudioState {
  currentVibe: VibeCategory;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  setVibe: (vibe: VibeCategory) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>()(
  immer((set) => ({
    currentVibe: 'calm',
    isPlaying: false,
    volume: 0.5,
    isMuted: false,

    setVibe: (vibe: VibeCategory) => {
      set((state) => {
        state.currentVibe = vibe;
      });
    },

    togglePlay: () => {
      set((state) => {
        state.isPlaying = !state.isPlaying;
      });
    },

    setVolume: (volume: number) => {
      set((state) => {
        state.volume = Math.max(0, Math.min(1, volume));
      });
    },

    toggleMute: () => {
      set((state) => {
        state.isMuted = !state.isMuted;
      });
    },
  }))
);
