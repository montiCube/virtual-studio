'use client';

import { useWishlistStore, useGalleryStore } from '../../stores/MockStore';

/**
 * Wishlist Button - Toggle current product in wishlist
 */
export function WishlistButton() {
  const { currentProduct } = useGalleryStore();
  const { addToWishlist, removeFromWishlist, isInWishlist, items } = useWishlistStore();

  if (!currentProduct) return null;

  const inWishlist = isInWishlist(currentProduct.id);
  const wishlistCount = items.length;

  const handleToggle = () => {
    if (inWishlist) {
      removeFromWishlist(currentProduct.id);
    } else {
      addToWishlist(currentProduct);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative glass rounded-full p-3 transition-smooth ${
        inWishlist ? 'bg-pink-500/30 hover:bg-pink-500/40' : 'hover:bg-white/20'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg 
        className={`w-6 h-6 transition-colors ${inWishlist ? 'text-pink-400' : 'text-white'}`} 
        fill={inWishlist ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
          {wishlistCount > 9 ? '9+' : wishlistCount}
        </span>
      )}
    </button>
  );
}

export default WishlistButton;
