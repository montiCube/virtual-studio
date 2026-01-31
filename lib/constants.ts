// ============================================
// Configuration & Asset URLs
// ============================================

import { VibeCategory } from './types';

/**
 * Mock asset URLs for development
 * In production, replace with actual CDN URLs
 */
export const MOCK_ASSETS = {
  images: {
    art1: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1024',
    art2: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1024',
    art3: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1024',
  },
  models: {
    table: '/models/table.glb',
    chair: '/models/chair.glb',
  },
  audio: {
    calm: '/audio/calm.mp3',
    upbeat: '/audio/upbeat.mp3',
    ambient: '/audio/ambient.mp3',
  },
} as const;

/**
 * Gallery configuration
 */
export const GALLERY_CONFIG = {
  // Camera settings
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    initialPosition: [0, 1.6, 4] as const,
  },
  // Navigation timing
  navigation: {
    transitionDuration: 0.5, // seconds
    debounceDelay: 200, // milliseconds
  },
  // Product display
  display: {
    artHeight: 1.5, // meters from floor
    modelScale: 1.0,
    spotlightIntensity: 1.5,
  },
} as const;

/**
 * Audio configuration
 */
export const AUDIO_CONFIG = {
  defaultVolume: 0.5,
  fadeInDuration: 1000, // milliseconds
  fadeOutDuration: 500, // milliseconds
  vibeTransitionDelay: 200, // milliseconds
} as const;

/**
 * Input configuration for keyboard and gamepad
 */
export const INPUT_CONFIG = {
  keyboard: {
    next: ['ArrowRight', 'KeyD'] as readonly string[],
    previous: ['ArrowLeft', 'KeyA'] as readonly string[],
    select: ['Enter', 'Space'] as readonly string[],
    exit: ['Escape'] as readonly string[],
  },
  gamepad: {
    next: 15, // D-Pad Right
    previous: 14, // D-Pad Left
    select: 0, // A Button
    exit: 1, // B Button
  },
} as const;

/**
 * Default audio tracks by vibe category
 */
export const DEFAULT_AUDIO_TRACKS: Record<VibeCategory, { id: string; name: string; url: string; vibe: VibeCategory }> = {
  calm: {
    id: 'audio-calm',
    name: 'Calm Ambience',
    url: MOCK_ASSETS.audio.calm,
    vibe: 'calm',
  },
  upbeat: {
    id: 'audio-upbeat',
    name: 'Upbeat Vibes',
    url: MOCK_ASSETS.audio.upbeat,
    vibe: 'upbeat',
  },
  ambient: {
    id: 'audio-ambient',
    name: 'Ambient Sounds',
    url: MOCK_ASSETS.audio.ambient,
    vibe: 'ambient',
  },
};

/**
 * Performance settings for different device tiers
 */
export const PERFORMANCE_CONFIG = {
  high: {
    pixelRatio: 2,
    shadowMapSize: 2048,
    maxAnisotropy: 16,
  },
  medium: {
    pixelRatio: 1.5,
    shadowMapSize: 1024,
    maxAnisotropy: 8,
  },
  low: {
    pixelRatio: 1,
    shadowMapSize: 512,
    maxAnisotropy: 4,
  },
} as const;

export type PerformanceTier = keyof typeof PERFORMANCE_CONFIG;

/**
 * XR Preview configuration
 */
export const XR_PREVIEW_CONFIG = {
  // AR Mode settings
  ar: {
    backgroundColor: 'transparent',
    defaultScale: 1.0,
    minScale: 0.1,
    maxScale: 5.0,
    rotationSpeed: 0.5,
  },
  // VR Mode settings
  vr: {
    defaultRoomTemplate: 'living-room' as const,
    headTrackingEnabled: true,
    movementSpeed: 2.0,
    rotationSensitivity: 1.0,
  },
} as const;

/**
 * VR Room templates configuration
 */
export const VR_ROOM_TEMPLATES = {
  'living-room': {
    id: 'living-room' as const,
    name: 'Living Room',
    description: 'A cozy living room space (12\' x 14\')',
    dimensions: { width: 3.66, depth: 4.27, height: 2.74 }, // meters
  },
  'bedroom': {
    id: 'bedroom' as const,
    name: 'Bedroom',
    description: 'A comfortable bedroom (10\' x 12\')',
    dimensions: { width: 3.05, depth: 3.66, height: 2.74 }, // meters
  },
  'studio': {
    id: 'studio' as const,
    name: 'Studio Apartment',
    description: 'An open studio space (20\' x 25\')',
    dimensions: { width: 6.10, depth: 7.62, height: 2.74 }, // meters
  },
  'custom': {
    id: 'custom' as const,
    name: 'Custom Room',
    description: 'Upload your own room scan or customize dimensions',
    dimensions: { width: 4.0, depth: 4.0, height: 2.74 }, // default meters
  },
} as const;

// ============================================
// Device Detection Configuration
// ============================================

/**
 * Known XR device signatures for identification
 * Maps user agent patterns to known device types
 */
export const XR_DEVICE_SIGNATURES = {
  // Meta Quest devices
  'meta-quest-3': ['Quest 3', 'Meta Quest 3'],
  'meta-quest-3s': ['Quest 3S', 'Meta Quest 3S'],
  'meta-quest-pro': ['Quest Pro', 'Meta Quest Pro'],
  'meta-quest-2': ['Quest 2', 'Meta Quest 2', 'Oculus Quest 2'],
  
  // Rokid devices
  'rokid-station-2': ['Rokid Station', 'Rokid Station 2'],
  'rokid-air': ['Rokid Air'],
  
  // RayNeo devices
  'rayneo-air-3s': ['RayNeo Air 3S', 'RayNeo X2'],
  'rayneo-air-2': ['RayNeo Air 2'],
  
  // Apple Vision Pro
  'apple-vision-pro': ['Apple Vision', 'Vision Pro'],
  
  // Pico devices
  'pico-4': ['Pico 4', 'PICO 4'],
} as const;

/**
 * Device capability profiles for known XR devices
 */
export const KNOWN_DEVICE_PROFILES = {
  'meta-quest-3': {
    name: 'Meta Quest 3',
    category: 'vr-headset' as const,
    hasPassthrough: true,
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: true,
    recommendedMode: 'ar' as const,
  },
  'meta-quest-3s': {
    name: 'Meta Quest 3S',
    category: 'vr-headset' as const,
    hasPassthrough: true,
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: true,
    recommendedMode: 'ar' as const,
  },
  'meta-quest-pro': {
    name: 'Meta Quest Pro',
    category: 'vr-headset' as const,
    hasPassthrough: true,
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: true,
    recommendedMode: 'ar' as const,
  },
  'meta-quest-2': {
    name: 'Meta Quest 2',
    category: 'vr-headset' as const,
    hasPassthrough: true, // Limited passthrough
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: false,
    recommendedMode: 'vr' as const,
  },
  'rokid-station-2': {
    name: 'Rokid Station 2',
    category: 'ar-glasses' as const,
    hasPassthrough: true, // AR glasses have natural passthrough
    hasHandTracking: false,
    hasCamera: false, // No built-in camera
    supportsRoomScan: false,
    recommendedMode: 'ar' as const,
  },
  'rokid-air': {
    name: 'Rokid Air',
    category: 'ar-glasses' as const,
    hasPassthrough: true,
    hasHandTracking: false,
    hasCamera: false,
    supportsRoomScan: false,
    recommendedMode: 'ar' as const,
  },
  'rayneo-air-3s': {
    name: 'RayNeo Air 3S',
    category: 'ar-glasses' as const,
    hasPassthrough: true,
    hasHandTracking: false,
    hasCamera: true, // Has camera for AR
    supportsRoomScan: false,
    recommendedMode: 'ar' as const,
  },
  'rayneo-air-2': {
    name: 'RayNeo Air 2',
    category: 'ar-glasses' as const,
    hasPassthrough: true,
    hasHandTracking: false,
    hasCamera: false,
    supportsRoomScan: false,
    recommendedMode: 'ar' as const,
  },
  'apple-vision-pro': {
    name: 'Apple Vision Pro',
    category: 'vr-headset' as const,
    hasPassthrough: true,
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: true,
    recommendedMode: 'ar' as const,
  },
  'pico-4': {
    name: 'Pico 4',
    category: 'vr-headset' as const,
    hasPassthrough: true,
    hasHandTracking: true,
    hasCamera: true,
    supportsRoomScan: false,
    recommendedMode: 'vr' as const,
  },
  'unknown': {
    name: 'Unknown Device',
    category: 'unknown' as const,
    hasPassthrough: false,
    hasHandTracking: false,
    hasCamera: false,
    supportsRoomScan: false,
    recommendedMode: null,
  },
} as const;

/**
 * Mobile device detection patterns
 */
export const MOBILE_DEVICE_PATTERNS = {
  ios: /iPhone|iPad|iPod/i,
  android: /Android/i,
  mobile: /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
  tablet: /iPad|Android(?!.*Mobile)|Tablet/i,
} as const;

/**
 * Browser detection patterns
 */
export const BROWSER_PATTERNS = {
  chrome: /Chrome(?!.*Edge)/i,
  safari: /Safari(?!.*Chrome)/i,
  firefox: /Firefox/i,
  edge: /Edge|Edg/i,
  opera: /Opera|OPR/i,
  samsung: /SamsungBrowser/i,
} as const;
