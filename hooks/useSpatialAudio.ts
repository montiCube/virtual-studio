'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Howl, Howler } from 'howler';
import { AUDIO_CONFIG, DEFAULT_AUDIO_TRACKS } from '../lib/constants';
import { useAudioStore, useGalleryStore } from '../stores/MockStore';
import type { VibeCategory } from '../lib/types';

/**
 * Spatial audio configuration
 */
interface SpatialAudioConfig {
  /** Panning model: 'HRTF' for headphones, 'equalpower' for speakers */
  panningModel: 'HRTF' | 'equalpower';
  /** Distance model for spatial audio */
  distanceModel: 'linear' | 'inverse';
  /** Reference distance for volume rolloff */
  refDistance: number;
  /** Maximum distance */
  maxDistance: number;
  /** Rolloff factor */
  rolloffFactor: number;
}

const DEFAULT_SPATIAL_CONFIG: SpatialAudioConfig = {
  panningModel: 'HRTF',
  distanceModel: 'inverse',
  refDistance: 1,
  maxDistance: 10,
  rolloffFactor: 1,
};

/**
 * Spatial audio position in 3D space
 */
interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Custom hook for managing spatial audio using Howler.js
 * Provides 3D positional audio for immersive XR experiences
 */
export function useSpatialAudio(spatialConfig: Partial<SpatialAudioConfig> = {}) {
  const config = { ...DEFAULT_SPATIAL_CONFIG, ...spatialConfig };
  
  const soundsRef = useRef<Map<VibeCategory, Howl>>(new Map());
  const currentSoundRef = useRef<Howl | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpatialSupported, setIsSpatialSupported] = useState(false);

  const { currentVibe, isPlaying, volume, isMuted, setVibe } = useAudioStore();
  const { currentProduct } = useGalleryStore();

  // Check for Web Audio API support (required for spatial audio)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'AudioContext' in window || 'webkitAudioContext' in window;
      setIsSpatialSupported(supported);
      
      // Configure Howler global settings
      Howler.volume(volume);
      Howler.mute(isMuted);
    }
  }, [volume, isMuted]);

  // Initialize sounds for each vibe category
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vibes: VibeCategory[] = ['calm', 'upbeat', 'ambient'];
    
    vibes.forEach((vibe) => {
      const track = DEFAULT_AUDIO_TRACKS[vibe];
      const sound = new Howl({
        src: [track.url],
        loop: true,
        volume: volume,
        html5: false, // Use Web Audio API for spatial audio
        preload: true,
        onload: () => {
          console.log(`Spatial audio loaded: ${vibe}`);
        },
        onloaderror: (id, error) => {
          console.warn(`Failed to load spatial audio for ${vibe}:`, error);
        },
      });
      
      soundsRef.current.set(vibe, sound);
    });

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      soundsRef.current.forEach((sound) => {
        sound.unload();
      });
      soundsRef.current.clear();
    };
  }, [volume]);

  /**
   * Set the listener position in 3D space (typically the camera/user position)
   */
  const setListenerPosition = useCallback((position: Position3D) => {
    if (!isSpatialSupported) return;
    
    Howler.pos(position.x, position.y, position.z);
  }, [isSpatialSupported]);

  /**
   * Set the listener orientation (direction the user is facing)
   */
  const setListenerOrientation = useCallback((
    forward: Position3D,
    up: Position3D = { x: 0, y: 1, z: 0 }
  ) => {
    if (!isSpatialSupported) return;
    
    Howler.orientation(
      forward.x, forward.y, forward.z,
      up.x, up.y, up.z
    );
  }, [isSpatialSupported]);

  /**
   * Play a sound at a specific 3D position
   */
  const playSoundAt = useCallback((vibe: VibeCategory, position: Position3D): number | null => {
    if (!isInitialized) return null;
    
    const sound = soundsRef.current.get(vibe);
    if (!sound) return null;

    const soundId = sound.play();
    
    if (isSpatialSupported) {
      sound.pos(position.x, position.y, position.z, soundId);
      sound.pannerAttr({
        panningModel: config.panningModel,
        distanceModel: config.distanceModel,
        refDistance: config.refDistance,
        maxDistance: config.maxDistance,
        rolloffFactor: config.rolloffFactor,
        coneInnerAngle: 360,
        coneOuterAngle: 360,
        coneOuterGain: 0,
      }, soundId);
    }

    return soundId;
  }, [isInitialized, isSpatialSupported, config]);

  /**
   * Update the position of a playing sound
   */
  const updateSoundPosition = useCallback((vibe: VibeCategory, position: Position3D, soundId?: number) => {
    if (!isSpatialSupported) return;
    
    const sound = soundsRef.current.get(vibe);
    if (sound) {
      sound.pos(position.x, position.y, position.z, soundId);
    }
  }, [isSpatialSupported]);

  /**
   * Crossfade to a new vibe track
   */
  const crossfadeTo = useCallback(async (newVibe: VibeCategory) => {
    if (!isInitialized) return;

    const oldSound = currentSoundRef.current;
    const newSound = soundsRef.current.get(newVibe);
    
    if (!newSound) return;

    // Start new sound at 0 volume
    newSound.volume(0);
    newSound.play();

    // Fade in new, fade out old simultaneously
    const fadeSteps = 20;
    const stepDuration = AUDIO_CONFIG.fadeInDuration / fadeSteps;

    for (let i = 0; i <= fadeSteps; i++) {
      const progress = i / fadeSteps;
      
      if (oldSound && oldSound !== newSound) {
        oldSound.volume(volume * (1 - progress));
      }
      newSound.volume(isMuted ? 0 : volume * progress);
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Stop old sound after crossfade
    if (oldSound && oldSound !== newSound) {
      oldSound.stop();
    }

    currentSoundRef.current = newSound;
  }, [isInitialized, volume, isMuted]);

  // Sync vibe with current product
  useEffect(() => {
    if (currentProduct && currentProduct.vibe !== currentVibe) {
      const timeout = setTimeout(() => {
        setVibe(currentProduct.vibe);
      }, AUDIO_CONFIG.vibeTransitionDelay);

      return () => clearTimeout(timeout);
    }
  }, [currentProduct, currentVibe, setVibe]);

  // Handle vibe changes
  useEffect(() => {
    if (isPlaying) {
      crossfadeTo(currentVibe);
    } else if (currentSoundRef.current) {
      currentSoundRef.current.pause();
    }
  }, [currentVibe, isPlaying, crossfadeTo]);

  // Handle volume/mute changes
  useEffect(() => {
    if (currentSoundRef.current) {
      currentSoundRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Handle global play/pause
  useEffect(() => {
    if (!isInitialized) return;
    
    if (isPlaying) {
      const sound = soundsRef.current.get(currentVibe);
      if (sound && !sound.playing()) {
        sound.play();
        currentSoundRef.current = sound;
      }
    } else {
      soundsRef.current.forEach((sound) => {
        sound.pause();
      });
    }
  }, [isPlaying, isInitialized, currentVibe]);

  /**
   * Stop all audio
   */
  const stopAll = useCallback(() => {
    soundsRef.current.forEach((sound) => {
      sound.stop();
    });
    currentSoundRef.current = null;
  }, []);

  return {
    isInitialized,
    isSpatialSupported,
    currentVibe,
    isPlaying,
    volume,
    isMuted,
    // Spatial audio methods
    setListenerPosition,
    setListenerOrientation,
    playSoundAt,
    updateSoundPosition,
    crossfadeTo,
    stopAll,
  };
}

export default useSpatialAudio;
