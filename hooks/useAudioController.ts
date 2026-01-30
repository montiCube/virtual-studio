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

  const { currentVibe, isPlaying, volume, isMuted, setVibe, togglePlay, setVolume, toggleMute } = useAudioStore();
  const { currentProduct } = useGalleryStore();

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [volume]);

  // Fade out audio
  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = AUDIO_CONFIG.fadeOutDuration / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, startVolume * (1 - currentStep / steps));

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
          resolve();
        }
      }, stepDuration);
    });
  }, []);

  // Fade in audio
  const fadeIn = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const targetVolume = isMuted ? 0 : volume;
      audio.volume = 0;
      audio.play().catch(() => {
        // Autoplay may be blocked - user interaction required
        console.log('Audio autoplay blocked. User interaction required.');
      });

      const steps = 20;
      const stepDuration = AUDIO_CONFIG.fadeInDuration / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(targetVolume, targetVolume * (currentStep / steps));

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepDuration);
    });
  }, [volume, isMuted]);

  // Change audio track with crossfade
  const changeTrack = useCallback(async (newVibe: VibeCategory) => {
    if (!audioRef.current) return;

    await fadeOut();

    const track = DEFAULT_AUDIO_TRACKS[newVibe];
    audioRef.current.src = track.url;
    audioRef.current.load();

    if (isPlaying) {
      await fadeIn();
    }
  }, [fadeOut, fadeIn, isPlaying]);

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

  // Handle vibe changes
  useEffect(() => {
    changeTrack(currentVibe);
  }, [currentVibe, changeTrack]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !isMuted) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [isPlaying, isMuted, fadeIn, fadeOut]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);

  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

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
