import { useCallback, useEffect, useRef, useState } from 'react';
import { useGalleryStore } from '@/stores/MockStore';
import type { VibeCategory } from '@/lib/types';

interface AudioState {
  isPlaying: boolean;
  currentVibe: VibeCategory;
  volume: number;
  isMuted: boolean;
}

export function useAudioController() {
  const { currentProduct, audioTracks } = useGalleryStore();
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentVibe: 'calm',
    volume: 0.5,
    isMuted: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Crossfade to new track
  const crossfadeToVibe = useCallback(
    (newVibe: VibeCategory) => {
      const track = audioTracks[newVibe];
      if (!track) return;

      // Clear any existing fade timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }

      // Fade out current audio
      if (audioRef.current) {
        const oldAudio = audioRef.current;
        const fadeOut = setInterval(() => {
          if (oldAudio.volume > 0.05) {
            oldAudio.volume = Math.max(0, oldAudio.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            oldAudio.pause();
          }
        }, 50);
      }

      // Create new audio and fade in
      const newAudio = new Audio(track.url);
      newAudio.loop = true;
      newAudio.volume = 0;

      newAudio
        .play()
        .then(() => {
          const targetVolume = audioState.isMuted ? 0 : audioState.volume;
          const fadeIn = setInterval(() => {
            if (newAudio.volume < targetVolume - 0.05) {
              newAudio.volume = Math.min(targetVolume, newAudio.volume + 0.05);
            } else {
              newAudio.volume = targetVolume;
              clearInterval(fadeIn);
            }
          }, 50);
        })
        .catch((error) => {
          // Audio autoplay may be blocked until user interaction
          console.log('Audio playback requires user interaction:', error);
        });

      audioRef.current = newAudio;
      setAudioState((prev) => ({
        ...prev,
        currentVibe: newVibe,
        isPlaying: true,
      }));
    },
    [audioTracks, audioState.isMuted, audioState.volume]
  );

  // Handle vibe changes when product changes
  useEffect(() => {
    if (currentProduct && currentProduct.vibe !== audioState.currentVibe) {
      crossfadeToVibe(currentProduct.vibe);
    }
  }, [currentProduct, audioState.currentVibe, crossfadeToVibe]);

  // Play/Pause toggle
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (audioState.isPlaying) {
      audioRef.current.pause();
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play().catch(console.error);
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [audioState.isPlaying]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    const newMuted = !audioState.isMuted;
    audioRef.current.volume = newMuted ? 0 : audioState.volume;
    setAudioState((prev) => ({ ...prev, isMuted: newMuted }));
  }, [audioState.isMuted, audioState.volume]);

  // Volume control
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      if (audioRef.current && !audioState.isMuted) {
        audioRef.current.volume = clampedVolume;
      }
      setAudioState((prev) => ({ ...prev, volume: clampedVolume }));
    },
    [audioState.isMuted]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...audioState,
    togglePlayback,
    toggleMute,
    setVolume,
    crossfadeToVibe,
  };
}
