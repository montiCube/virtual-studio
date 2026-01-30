'use client';

import { useGalleryStore } from '@/stores/MockStore';
import { isArtProduct, isTableProduct } from '@/lib/types';

export function ProductHUD() {
  const { currentProduct, isTransitioning } = useGalleryStore();

  if (!currentProduct) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2
        bg-glass-light backdrop-blur-glass
        border border-glass-border rounded-2xl
        p-6 min-w-[320px] max-w-[400px]
        transition-all duration-300 ease-out
        ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* Product Name */}
      <h2 className="text-2xl font-bold text-white mb-2">
        {currentProduct.name}
      </h2>

      {/* Product Type Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`
            px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide
            ${currentProduct.type === 'art' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-secondary/20 text-accent-secondary'}
          `}
        >
          {currentProduct.type}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
          {currentProduct.vibe}
        </span>
      </div>

      {/* Product Details */}
      <p className="text-white/70 text-sm mb-4 line-clamp-2">
        {currentProduct.description}
      </p>

      {/* Dimensions (for art) */}
      {isArtProduct(currentProduct) && (
        <p className="text-white/50 text-xs mb-3">
          {currentProduct.dimensions.width}m × {currentProduct.dimensions.height}m
        </p>
      )}

      {/* Scale (for tables) */}
      {isTableProduct(currentProduct) && (
        <p className="text-white/50 text-xs mb-3">
          Scale: {currentProduct.scale}×
        </p>
      )}

      {/* Price */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-glass-border">
        <span className="text-white/50 text-sm">Price</span>
        <span className="text-2xl font-bold text-white">
          {formatPrice(currentProduct.price)}
        </span>
      </div>

      {/* Action Button */}
      <button
        className="
          w-full mt-4 py-3 px-4
          bg-accent-primary hover:bg-accent-primary/80
          text-white font-medium rounded-xl
          transition-colors duration-200
          flex items-center justify-center gap-2
        "
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Add to Cart
      </button>
    </div>
  );
}
