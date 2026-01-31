'use client';

import { useEffect, useCallback } from 'react';
import { useModalStore, useCartStore, useWishlistStore } from '../../stores/MockStore';
import { isArtProduct, isTableProduct } from '../../lib/types';

/**
 * Product Detail Modal - Shows detailed product information
 */
export function ProductDetailModal() {
  const { isProductModalOpen, selectedProduct, closeProductModal } = useModalStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = selectedProduct ? isInWishlist(selectedProduct.id) : false;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProductModal();
    }
  }, [closeProductModal]);

  useEffect(() => {
    if (isProductModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isProductModalOpen, handleKeyDown]);

  if (!isProductModalOpen || !selectedProduct) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(selectedProduct);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(selectedProduct.id);
    } else {
      addToWishlist(selectedProduct);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeProductModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative max-w-2xl w-full glass-strong rounded-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-white/20 transition-smooth z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Image/Preview */}
        <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {isArtProduct(selectedProduct) ? (
            <img 
              src={selectedProduct.imageUri} 
              alt={selectedProduct.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center text-white/50">
              <svg className="w-24 h-24 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>3D Model</p>
            </div>
          )}
          
          {/* Vibe Badge */}
          <span className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-sm text-white capitalize">
            {selectedProduct.vibe} vibe
          </span>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{selectedProduct.name}</h2>
              <p className="text-white/70">{selectedProduct.type === 'art' ? 'Artwork' : 'Furniture'}</p>
            </div>
            <span className="text-3xl font-bold text-green-400">{formatPrice(selectedProduct.price)}</span>
          </div>

          <p className="text-white/80 mb-6">{selectedProduct.description}</p>

          {/* Specifications */}
          <div className="glass rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {isArtProduct(selectedProduct) && (
                <>
                  <div>
                    <span className="text-white/50">Dimensions</span>
                    <p className="text-white">{selectedProduct.dimensions.width.toFixed(1)}m × {selectedProduct.dimensions.height.toFixed(1)}m</p>
                  </div>
                  <div>
                    <span className="text-white/50">Frame Color</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20" 
                        style={{ backgroundColor: selectedProduct.frameColor }}
                      />
                      <span className="text-white">{selectedProduct.frameColor}</span>
                    </div>
                  </div>
                </>
              )}
              {isTableProduct(selectedProduct) && (
                <>
                  <div>
                    <span className="text-white/50">Scale</span>
                    <p className="text-white">{selectedProduct.scale}x</p>
                  </div>
                  <div>
                    <span className="text-white/50">Type</span>
                    <p className="text-white">3D Model (GLB)</p>
                  </div>
                </>
              )}
              <div>
                <span className="text-white/50">Vibe Category</span>
                <p className="text-white capitalize">{selectedProduct.vibe}</p>
              </div>
              <div>
                <span className="text-white/50">ID</span>
                <p className="text-white font-mono text-xs">{selectedProduct.id}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleWishlistToggle}
              className={`flex-1 py-3 rounded-xl font-semibold transition-smooth ${
                inWishlist 
                  ? 'bg-pink-500/30 text-pink-300 hover:bg-pink-500/40' 
                  : 'glass hover:bg-white/20 text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </span>
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl font-semibold bg-blue-600/50 hover:bg-blue-500/60 text-white transition-smooth"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
