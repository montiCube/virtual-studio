import { useEffect, useCallback, useRef } from 'react';
import { INPUT_CONFIG, GALLERY_CONFIG } from '../lib/constants';
import { useGalleryStore } from '../stores/MockStore';
import type { NavigationDirection, NavigationState } from '../lib/types';

/**
 * Custom hook for handling keyboard and gamepad navigation in the gallery
 * Supports keyboard arrows, WASD keys, and gamepad D-Pad/buttons
 */
export function useGalleryNavigation(): NavigationState {
  const { 
    currentIndex, 
    products, 
    nextProduct, 
    previousProduct, 
    isTransitioning,
    setTransitioning 
  } = useGalleryStore();

  const lastInputTime = useRef<number>(0);
  const gamepadInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const canNavigate = useCallback(() => {
    const now = Date.now();
    if (now - lastInputTime.current < GALLERY_CONFIG.navigation.debounceDelay) {
      return false;
    }
    if (isTransitioning) {
      return false;
    }
    lastInputTime.current = now;
    return true;
  }, [isTransitioning]);

  const handleNavigation = useCallback((direction: NavigationDirection) => {
    if (!canNavigate()) return;
    
    if (direction === 'next') {
      nextProduct();
    } else {
      previousProduct();
    }

    // Auto-clear transitioning state after animation duration
    setTimeout(() => {
      setTransitioning(false);
    }, GALLERY_CONFIG.navigation.transitionDuration * 1000);
  }, [canNavigate, nextProduct, previousProduct, setTransitioning]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { next, previous } = INPUT_CONFIG.keyboard;

    if (next.includes(event.code)) {
      event.preventDefault();
      handleNavigation('next');
    } else if (previous.includes(event.code)) {
      event.preventDefault();
      handleNavigation('previous');
    }
  }, [handleNavigation]);

  // Gamepad polling function
  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads?.() ?? [];
    
    for (const gamepad of gamepads) {
      if (!gamepad) continue;

      const { next, previous } = INPUT_CONFIG.gamepad;

      // Check D-Pad buttons
      if (gamepad.buttons[next]?.pressed) {
        handleNavigation('next');
      } else if (gamepad.buttons[previous]?.pressed) {
        handleNavigation('previous');
      }
    }
  }, [handleNavigation]);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Set up gamepad polling
  useEffect(() => {
    // Only poll if Gamepad API is available
    if (!navigator.getGamepads) return;

    gamepadInterval.current = setInterval(pollGamepad, 100);

    return () => {
      if (gamepadInterval.current) {
        clearInterval(gamepadInterval.current);
      }
    };
  }, [pollGamepad]);

  // Handle gamepad connection events
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  return {
    canGoNext: currentIndex < products.length - 1 || products.length > 1,
    canGoPrevious: currentIndex > 0 || products.length > 1,
    currentIndex,
    totalProducts: products.length,
  };
}

export default useGalleryNavigation;
