'use client';

import { useState, useEffect, useCallback } from 'react';
import { useModalStore, useCartStore, useCheckoutStore } from '../../stores/MockStore';
import type { CheckoutStep } from '../../stores/MockStore';

// ============================================
// Input Validation Utilities
// ============================================

/**
 * Sanitize input by removing potential XSS vectors
 * Defense-in-depth even though React auto-escapes JSX
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 200); // Limit length to prevent abuse
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate postal code (basic alphanumeric check)
 */
function isValidPostalCode(code: string): boolean {
  return /^[a-zA-Z0-9\s-]{2,20}$/.test(code);
}

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 */
function isValidName(name: string): boolean {
  return /^[a-zA-Z\s'-]{1,100}$/.test(name);
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Checkout Flow UI - Multi-step checkout process
 */
export function CheckoutFlow() {
  const { isCheckoutOpen, closeCheckout } = useModalStore();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { 
    currentStep, 
    shippingInfo, 
    isProcessing,
    orderId,
    setStep, 
    setShippingInfo, 
    setProcessing,
    setOrderId,
    resetCheckout 
  } = useCheckoutStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isProcessing) {
      closeCheckout();
    }
  }, [closeCheckout, isProcessing]);

  useEffect(() => {
    if (isCheckoutOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCheckoutOpen, handleKeyDown]);

  // Reset checkout when opening
  useEffect(() => {
    if (isCheckoutOpen) {
      resetCheckout();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
      });
      setFormErrors({});
    }
  }, [isCheckoutOpen, resetCheckout]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Sanitize input on change
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!isValidName(formData.firstName)) {
      errors.firstName = 'Please enter a valid first name';
    }
    if (!isValidName(formData.lastName)) {
      errors.lastName = 'Please enter a valid last name';
    }
    if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.address.length < 5 || formData.address.length > 200) {
      errors.address = 'Please enter a valid address';
    }
    if (!isValidName(formData.city)) {
      errors.city = 'Please enter a valid city name';
    }
    if (!isValidPostalCode(formData.postalCode)) {
      errors.postalCode = 'Please enter a valid postal code';
    }
    if (!isValidName(formData.country)) {
      errors.country = 'Please enter a valid country name';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShippingInfo(formData);
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate order ID
    const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(newOrderId);
    setProcessing(false);
    setStep('confirmation');
    clearCart();
  };

  const handleClose = () => {
    resetCheckout();
    closeCheckout();
  };

  if (!isCheckoutOpen) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'cart', label: 'Review' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmation', label: 'Complete' },
  ];

  const stepIndex = steps.findIndex(s => s.key === currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center glass rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{item.product.name}</p>
                    <p className="text-white/50 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-white/70">Total ({totalItems} items)</span>
              <span className="text-2xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={() => setStep('shipping')}
              className="w-full py-3 rounded-xl font-semibold bg-blue-600/50 hover:bg-blue-500/60 text-white transition-smooth"
            >
              Continue to Shipping
            </button>
          </div>
        );

      case 'shipping':
        return (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  autoComplete="given-name"
                  className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.firstName ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
                />
                {formErrors.firstName && <p className="text-red-400 text-xs mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  autoComplete="family-name"
                  className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.lastName ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
                />
                {formErrors.lastName && <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>}
              </div>
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                maxLength={254}
                autoComplete="email"
                className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.email ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleInputChange}
                required
                maxLength={200}
                autoComplete="street-address"
                className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.address ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
              />
              {formErrors.address && <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  autoComplete="address-level2"
                  className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.city ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
                />
                {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  autoComplete="postal-code"
                  className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.postalCode ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
                />
                {formErrors.postalCode && <p className="text-red-400 text-xs mt-1">{formErrors.postalCode}</p>}
              </div>
            </div>
            <div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                required
                maxLength={100}
                autoComplete="country-name"
                className={`w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ${formErrors.country ? 'ring-2 ring-red-500/50' : 'focus:ring-blue-500/50'}`}
              />
              {formErrors.country && <p className="text-red-400 text-xs mt-1">{formErrors.country}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex-1 py-3 rounded-xl font-semibold glass hover:bg-white/20 text-white transition-smooth"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-semibold bg-blue-600/50 hover:bg-blue-500/60 text-white transition-smooth"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        );

      case 'payment':
        return (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Payment</h3>
            
            {/* Shipping Summary */}
            {shippingInfo && (
              <div className="glass rounded-lg p-3 text-sm">
                <p className="text-white/50 mb-1">Shipping to:</p>
                <p className="text-white">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p className="text-white/70">{shippingInfo.address}</p>
                <p className="text-white/70">{shippingInfo.city}, {shippingInfo.postalCode}</p>
                <p className="text-white/70">{shippingInfo.country}</p>
              </div>
            )}

            {/* Mock Payment Form */}
            <div className="glass rounded-lg p-4 space-y-3">
              <p className="text-white/70 text-sm">This is a demo checkout. No real payment will be processed.</p>
              <input
                type="text"
                placeholder="Card Number (e.g., 4242 4242 4242 4242)"
                className="w-full glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                defaultValue="4242 4242 4242 4242"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  defaultValue="12/28"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="glass rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  defaultValue="123"
                />
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-white/70">Order Total</span>
              <span className="text-2xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-semibold glass hover:bg-white/20 text-white transition-smooth disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-semibold bg-green-600/50 hover:bg-green-500/60 text-white transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(totalPrice)}`
                )}
              </button>
            </div>
          </form>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
              <p className="text-white/70">Thank you for your purchase</p>
            </div>
            {orderId && (
              <div className="glass rounded-lg p-4">
                <p className="text-white/50 text-sm">Order ID</p>
                <p className="text-white font-mono text-lg">{orderId}</p>
              </div>
            )}
            <p className="text-white/50 text-sm">
              A confirmation email has been sent to {shippingInfo?.email}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-semibold bg-blue-600/50 hover:bg-blue-500/60 text-white transition-smooth"
            >
              Continue Shopping
            </button>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={!isProcessing ? handleClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative max-w-lg w-full glass-strong rounded-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isProcessing && currentStep !== 'confirmation' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-white/20 transition-smooth z-10"
            aria-label="Close checkout"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Progress Steps */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index <= stepIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'glass text-white/50'
                }`}>
                  {index < stepIndex ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-16 h-0.5 mx-1 ${
                    index < stepIndex ? 'bg-blue-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.key} className="text-xs text-white/50 w-8 text-center">
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default CheckoutFlow;
