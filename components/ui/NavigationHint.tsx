'use client';

import type { NavigationState } from '../../lib/types';

interface NavigationHintProps {
  navigation: NavigationState;
}

/**
 * Navigation hints overlay showing available controls
 */
export function NavigationHint({ navigation }: NavigationHintProps) {
  const { canGoNext, canGoPrevious, currentIndex, totalProducts } = navigation;

  return (
    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div className="nav-hint animate-fade-in">
        <span className="flex items-center gap-2">
          <kbd className={canGoPrevious ? '' : 'opacity-50'}>←</kbd>
          <span className="text-white/50">Navigate</span>
          <kbd className={canGoNext ? '' : 'opacity-50'}>→</kbd>
        </span>
        <span className="mx-2 text-white/30">|</span>
        <span className="text-white/50">
          {currentIndex + 1} of {totalProducts}
        </span>
      </div>
    </div>
  );
}

export default NavigationHint;
