import { useEffect, useCallback, useRef } from 'react';
import { useGalleryStore } from '@/stores/MockStore';
import { INPUT_CONFIG } from '@/lib/constants';

export function useGalleryNavigation() {
  const { nextProduct, previousProduct, isTransitioning, currentIndex, products } = useGalleryStore();
  const lastInputTime = useRef(0);

  const navigate = useCallback(
    (direction: 'next' | 'previous') => {
      const now = Date.now();
      if (now - lastInputTime.current < INPUT_CONFIG.keyboardDebounce) return;
      lastInputTime.current = now;

      if (direction === 'next') {
        nextProduct();
      } else {
        previousProduct();
      }
    },
    [nextProduct, previousProduct]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          navigate('next');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          navigate('previous');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning, navigate]);

  // Gamepad navigation (Rokid remote as D-Pad)
  useEffect(() => {
    let animationFrameId: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      
      for (const gamepad of gamepads) {
        if (!gamepad) continue;

        // D-Pad (axes or buttons depending on controller)
        const leftPressed =
          gamepad.axes[0] < -INPUT_CONFIG.gamepadDeadzone ||
          gamepad.buttons[14]?.pressed;
        const rightPressed =
          gamepad.axes[0] > INPUT_CONFIG.gamepadDeadzone ||
          gamepad.buttons[15]?.pressed;

        if (leftPressed) {
          navigate('previous');
        } else if (rightPressed) {
          navigate('next');
        }
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    // Start polling when gamepad is connected
    const handleGamepadConnected = () => {
      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    const handleGamepadDisconnected = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    // Check if gamepad is already connected
    if (navigator.getGamepads().some((gp) => gp !== null)) {
      handleGamepadConnected();
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [navigate]);

  return {
    canGoNext: currentIndex < products.length - 1,
    canGoPrevious: currentIndex > 0,
    currentIndex,
    totalProducts: products.length,
    navigate,
  };
}
