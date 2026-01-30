// ============================================
// Asset Configuration
// ============================================

export const MOCK_ASSETS = {
  images: {
    art1: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1024',
    art2: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1024',
    art3: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1024',
  },
  models: {
    table: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb',
  },
  audio: {
    calm: '/audio/calm.mp3',
    upbeat: '/audio/upbeat.mp3',
    ambient: '/audio/ambient.mp3',
  },
} as const;

// ============================================
// Gallery Configuration
// ============================================

export const GALLERY_CONFIG = {
  transitionDuration: 800, // ms
  cameraDistance: 5,
  productSpacing: 4,
  floorSize: 50,
  maxProducts: 20,
} as const;

// ============================================
// Performance Thresholds
// ============================================

export const PERFORMANCE_CONFIG = {
  targetFPS: 60,
  minFPS: 30,
  maxTextureSize: 2048,
  maxTriangles: 50000,
  anisotropy: 4,
} as const;

// ============================================
// Input Configuration
// ============================================

export const INPUT_CONFIG = {
  keyboardDebounce: 200, // ms
  gamepadDeadzone: 0.2,
  scrollSensitivity: 0.001,
  dragSensitivity: 0.01,
} as const;
