'use client';

import { useGalleryStore, useCartStore } from '../../stores/MockStore';
import { isArtProduct, isTableProduct } from '../../lib/types';
import XRPreviewButton from './XRPreviewButton';

/**
 * Product information HUD overlay
 */
export function ProductHUD() {
  const { currentProduct, currentIndex, products } = useGalleryStore();
  const { addItem } = useCartStore();

  if (!currentProduct) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(currentProduct);
  };

  return (
    <div className="absolute bottom-8 left-8 right-8 pointer-events-auto">
      <div className="max-w-md mx-auto product-card animate-slide-up">
        {/* Product counter */}
        <div className="text-sm text-white/50 mb-2">
          {currentIndex + 1} / {products.length}
        </div>

        {/* Product info */}
        <h2 className="product-title">{currentProduct.name}</h2>
        <p className="product-description mb-3">{currentProduct.description}</p>

        {/* Product details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-white/70">
          {isArtProduct(currentProduct) && (
            <span>
              {currentProduct.dimensions.width.toFixed(1)}m × {currentProduct.dimensions.height.toFixed(1)}m
            </span>
          )}
          {isTableProduct(currentProduct) && (
            <span>Scale: {currentProduct.scale}x</span>
          )}
          <span className="capitalize">Vibe: {currentProduct.vibe}</span>
        </div>

        {/* Price and actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="product-price">{formatPrice(currentProduct.price)}</span>
          <div className="flex items-center gap-2">
            {/* XR Preview Button */}
            <XRPreviewButton product={currentProduct} />
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="xr-button-primary text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductHUD;
