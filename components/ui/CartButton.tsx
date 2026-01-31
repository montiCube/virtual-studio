'use client';

import { useCartStore, useModalStore } from '../../stores/MockStore';

/**
 * Cart Button - Shows cart item count and opens cart panel
 */
export function CartButton() {
  const { getTotalItems } = useCartStore();
  const { openCart } = useModalStore();

  const totalItems = getTotalItems();

  return (
    <button
      onClick={openCart}
      className="relative glass rounded-full p-3 hover:bg-white/20 transition-smooth"
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );
}

export default CartButton;
