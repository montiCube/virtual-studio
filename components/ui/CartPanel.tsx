'use client';

import { useEffect, useCallback } from 'react';
import { useModalStore, useCartStore } from '../../stores/MockStore';
import { isArtProduct } from '../../lib/types';

/**
 * Shopping Cart Panel - Slide-out cart drawer
 */
export function CartPanel() {
  const { isCartOpen, closeCart, openCheckout } = useModalStore();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCart();
    }
  }, [closeCart]);

  useEffect(() => {
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCartOpen, handleKeyDown]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isCartOpen) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      onClick={closeCart}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Cart Panel */}
      <div 
        className="relative w-full max-w-md h-full glass-strong border-l border-white/10 animate-slide-left overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Shopping Cart ({totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-white/20 transition-smooth"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg">Your cart is empty</p>
              <p className="text-sm">Add some products to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.product.id}
                className="glass rounded-xl p-3 flex gap-3"
              >
                {/* Product Preview */}
                <div className="w-20 h-20 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                  {isArtProduct(item.product) ? (
                    <img 
                      src={item.product.imageUri} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{item.product.name}</h3>
                  <p className="text-green-400 font-semibold">{formatPrice(item.product.price)}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-smooth"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-smooth"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto w-7 h-7 rounded-full glass flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-smooth"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between text-white">
              <span className="text-white/70">Subtotal ({totalItems} items)</span>
              <span className="text-2xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 py-3 rounded-xl font-semibold glass hover:bg-white/20 text-white/70 transition-smooth"
              >
                Clear Cart
              </button>
              <button
                onClick={openCheckout}
                className="flex-1 py-3 rounded-xl font-semibold bg-blue-600/50 hover:bg-blue-500/60 text-white transition-smooth"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPanel;
