import { useEffect, useRef, useCallback } from 'react';
import { AUDIO_CONFIG, DEFAULT_AUDIO_TRACKS } from '../lib/constants';
import { useAudioStore, useGalleryStore } from '../stores/MockStore';
import type { VibeCategory } from '../lib/types';

/**
 * Custom hook for managing audio playback based on product vibes
 * Handles crossfading between tracks and volume control
 */
export function useAudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { currentVibe, isPlaying, volume, isMuted, setVibe, togglePlay, setVolume, toggleMute } = useAudioStore();
  const { currentProduct } = useGalleryStore();

  // Cleanup fade interval helper
  const clearFadeInterval = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      clearFadeInterval();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [volume, clearFadeInterval]);

  // Fade out audio
  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      clearFadeInterval();
      
      if (!audioRef.current) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = AUDIO_CONFIG.fadeOutDuration / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, startVolume * (1 - currentStep / steps));

        if (currentStep >= steps) {
          clearFadeInterval();
          audio.pause();
          resolve();
        }
      }, stepDuration);
    });
  }, [clearFadeInterval]);

  // Fade in audio
  const fadeIn = useCallback((targetVol: number, muted: boolean): Promise<void> => {
    return new Promise((resolve) => {
      clearFadeInterval();
      
      if (!audioRef.current) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const targetVolume = muted ? 0 : targetVol;
      audio.volume = 0;
      audio.play().catch(() => {
        // Autoplay may be blocked - user interaction required
        console.log('Audio autoplay blocked. User interaction required.');
      });

      const steps = 20;
      const stepDuration = AUDIO_CONFIG.fadeInDuration / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(targetVolume, targetVolume * (currentStep / steps));

        if (currentStep >= steps) {
          clearFadeInterval();
          resolve();
        }
      }, stepDuration);
    });
  }, [clearFadeInterval]);

  // Change audio track with crossfade
  const changeTrack = useCallback(async (newVibe: VibeCategory, playing: boolean, vol: number, muted: boolean) => {
    if (!audioRef.current) return;

    await fadeOut();

    const track = DEFAULT_AUDIO_TRACKS[newVibe];
    audioRef.current.src = track.url;
    audioRef.current.load();

    if (playing) {
      await fadeIn(vol, muted);
    }
  }, [fadeOut, fadeIn]);

  // Sync vibe with current product
  useEffect(() => {
    if (currentProduct && currentProduct.vibe !== currentVibe) {
      // Delay vibe transition for smooth experience
      fadeTimeoutRef.current = setTimeout(() => {
        setVibe(currentProduct.vibe);
      }, AUDIO_CONFIG.vibeTransitionDelay);

      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    }
  }, [currentProduct, currentVibe, setVibe]);

  // Handle vibe changes - pass current state values to avoid stale closures
  useEffect(() => {
    changeTrack(currentVibe, isPlaying, volume, isMuted);
  }, [currentVibe, changeTrack, isPlaying, volume, isMuted]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !isMuted) {
      fadeIn(volume, isMuted);
    } else {
      fadeOut();
    }
  }, [isPlaying, isMuted, volume, fadeIn, fadeOut]);

  // Handle direct volume changes (not during fade)
  useEffect(() => {
    if (audioRef.current && !isMuted && !fadeIntervalRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);

  return {
    currentVibe,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    setVolume,
    toggleMute,
  };
}

export default useAudioController;
