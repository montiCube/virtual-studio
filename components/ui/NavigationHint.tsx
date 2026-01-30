'use client';

import { useGalleryNavigation } from '@/hooks/useGalleryNavigation';

export function NavigationHint() {
  const { canGoNext, canGoPrevious, currentIndex, totalProducts } = useGalleryNavigation();

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => {
            if (canGoPrevious) {
              const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
              window.dispatchEvent(event);
            }
          }}
          disabled={!canGoPrevious}
          className={`
            p-3 rounded-full
            bg-glass-light backdrop-blur-glass border border-glass-border
            transition-all duration-200
            ${canGoPrevious ? 'hover:bg-glass-medium cursor-pointer' : 'opacity-30 cursor-not-allowed'}
          `}
          aria-label="Previous product"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress Indicator */}
        <div className="px-4 py-2 bg-glass-light backdrop-blur-glass border border-glass-border rounded-full">
          <span className="text-white font-medium">
            {currentIndex + 1} / {totalProducts}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={() => {
            if (canGoNext) {
              const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
              window.dispatchEvent(event);
            }
          }}
          disabled={!canGoNext}
          className={`
            p-3 rounded-full
            bg-glass-light backdrop-blur-glass border border-glass-border
            transition-all duration-200
            ${canGoNext ? 'hover:bg-glass-medium cursor-pointer' : 'opacity-30 cursor-not-allowed'}
          `}
          aria-label="Next product"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="flex items-center gap-3 text-white/40 text-xs">
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">←</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">→</kbd>
          <span className="ml-1">Navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">A</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">D</kbd>
          <span className="ml-1">Alt</span>
        </div>
      </div>
    </div>
  );
}
