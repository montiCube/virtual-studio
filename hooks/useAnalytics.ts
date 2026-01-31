'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../lib/types';

/**
 * Analytics event types for Virtual Studio
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'product_detail_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'begin_checkout'
  | 'complete_checkout'
  | 'xr_session_start'
  | 'xr_session_end'
  | 'ar_mode_enter'
  | 'vr_mode_enter'
  | 'error';

/**
 * Analytics event payload
 */
interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  data?: Record<string, unknown>;
  product?: Partial<Product>;
  sessionId: string;
}

/**
 * Analytics configuration
 */
interface AnalyticsConfig {
  /** Enable/disable analytics tracking */
  enabled: boolean;
  /** Analytics endpoint URL (optional - for sending to backend) */
  endpoint?: string;
  /** Enable debug logging */
  debug: boolean;
  /** Batch events before sending */
  batchSize: number;
  /** Batch flush interval in ms */
  flushInterval: number;
  /** Store events in localStorage (for debugging only - disable in production) */
  storeLocally: boolean;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 5000,
  storeLocally: process.env.NODE_ENV === 'development', // Only store locally in development
};

/**
 * Generate a unique session ID (privacy-friendly, not fingerprinting)
 */
function generateSessionId(): string {
  return `vs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Custom hook for analytics tracking
 * Provides event tracking for product views, cart actions, XR sessions, etc.
 * 
 * Privacy-first design:
 * - No PII collection (no IP, no user agent fingerprinting)
 * - Session ID only persists for the browser session
 * - Local storage only used in development mode
 * - Can be extended to send to analytics services (GA, Mixpanel, etc.)
 */
export function useAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const sessionIdRef = useRef<string>('');
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false);

  /**
   * Flush queued events
   */
  const flushEvents = useCallback(() => {
    if (eventQueueRef.current.length === 0) return;
    
    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    if (mergedConfig.debug) {
      console.log('[Analytics] Flushing events:', events);
    }

    // Store in localStorage for development/debugging ONLY
    if (typeof window !== 'undefined' && mergedConfig.storeLocally) {
      try {
        const stored = JSON.parse(localStorage.getItem('vs_analytics') || '[]');
        const updated = [...stored, ...events].slice(-100); // Keep last 100 events
        localStorage.setItem('vs_analytics', JSON.stringify(updated));
      } catch {
        // localStorage may be unavailable
      }
    }

    // If endpoint is configured, send to backend
    if (mergedConfig.endpoint) {
      fetch(mergedConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        // Don't block on analytics
        keepalive: true,
      }).catch((error) => {
        if (mergedConfig.debug) {
          console.warn('[Analytics] Failed to send events:', error);
        }
      });
    }
  }, [mergedConfig.debug, mergedConfig.endpoint, mergedConfig.storeLocally]);

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback((
    type: AnalyticsEventType,
    data?: Record<string, unknown>,
    product?: Partial<Product>
  ) => {
    if (!mergedConfig.enabled) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId: sessionIdRef.current,
      data,
      product: product ? {
        id: product.id,
        name: product.name,
        type: product.type,
        price: product.price,
        vibe: product.vibe,
      } : undefined,
    };

    if (mergedConfig.debug) {
      console.log('[Analytics] Event:', type, event);
    }

    eventQueueRef.current.push(event);

    // Flush if batch size reached
    if (eventQueueRef.current.length >= mergedConfig.batchSize) {
      flushEvents();
    }
  }, [mergedConfig.enabled, mergedConfig.debug, mergedConfig.batchSize, flushEvents]);

  // Initialize session ID and set up flush interval
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initializedRef.current) return; // Prevent double initialization
    initializedRef.current = true;
    
    // Try to restore session from sessionStorage, or create new
    let sessionId = sessionStorage.getItem('vs_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('vs_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;
    setIsInitialized(true);

    // Set up flush interval
    if (mergedConfig.flushInterval > 0) {
      flushIntervalRef.current = setInterval(() => {
        flushEvents();
      }, mergedConfig.flushInterval);
    }

    return () => {
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
      // Flush remaining events on unmount
      flushEvents();
    };
  }, [mergedConfig.flushInterval, flushEvents]);

  // Track initial page view separately after initialization
  useEffect(() => {
    if (!isInitialized || !mergedConfig.enabled) return;
    
    // Track page view with privacy-safe data only
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
    });
  }, [isInitialized, mergedConfig.enabled, trackEvent]);

  /**
   * Track product view (gallery navigation)
   */
  const trackProductView = useCallback((product: Product) => {
    trackEvent('product_view', {
      productIndex: product.id,
    }, product);
  }, [trackEvent]);

  /**
   * Track product detail modal open
   */
  const trackProductDetailView = useCallback((product: Product) => {
    trackEvent('product_detail_view', undefined, product);
  }, [trackEvent]);

  /**
   * Track add to cart
   */
  const trackAddToCart = useCallback((product: Product, quantity: number = 1) => {
    trackEvent('add_to_cart', { quantity }, product);
  }, [trackEvent]);

  /**
   * Track remove from cart
   */
  const trackRemoveFromCart = useCallback((product: Product) => {
    trackEvent('remove_from_cart', undefined, product);
  }, [trackEvent]);

  /**
   * Track add to wishlist
   */
  const trackAddToWishlist = useCallback((product: Product) => {
    trackEvent('add_to_wishlist', undefined, product);
  }, [trackEvent]);

  /**
   * Track remove from wishlist
   */
  const trackRemoveFromWishlist = useCallback((product: Product) => {
    trackEvent('remove_from_wishlist', undefined, product);
  }, [trackEvent]);

  /**
   * Track checkout begin
   */
  const trackBeginCheckout = useCallback((cartTotal: number, itemCount: number) => {
    trackEvent('begin_checkout', {
      cartTotal,
      itemCount,
      currency: 'USD',
    });
  }, [trackEvent]);

  /**
   * Track checkout complete
   */
  const trackCompleteCheckout = useCallback((orderId: string, total: number) => {
    trackEvent('complete_checkout', {
      orderId,
      total,
      currency: 'USD',
    });
  }, [trackEvent]);

  /**
   * Track XR session start
   */
  const trackXRSessionStart = useCallback((mode: 'ar' | 'vr', deviceType?: string) => {
    trackEvent(mode === 'ar' ? 'ar_mode_enter' : 'vr_mode_enter', {
      deviceType,
    });
    trackEvent('xr_session_start', {
      mode,
      deviceType,
    });
  }, [trackEvent]);

  /**
   * Track XR session end
   */
  const trackXRSessionEnd = useCallback((mode: 'ar' | 'vr', duration: number) => {
    trackEvent('xr_session_end', {
      mode,
      durationMs: duration,
    });
  }, [trackEvent]);

  /**
   * Track error
   */
  const trackError = useCallback((error: Error | string, context?: Record<string, unknown>) => {
    trackEvent('error', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }, [trackEvent]);

  /**
   * Get stored analytics events (for debugging)
   */
  const getStoredEvents = useCallback((): AnalyticsEvent[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('vs_analytics') || '[]');
  }, []);

  /**
   * Clear stored analytics events
   */
  const clearStoredEvents = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vs_analytics');
    }
  }, []);

  return {
    // Core tracking
    trackEvent,
    // Product tracking
    trackProductView,
    trackProductDetailView,
    // Commerce tracking
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToWishlist,
    trackRemoveFromWishlist,
    trackBeginCheckout,
    trackCompleteCheckout,
    // XR tracking
    trackXRSessionStart,
    trackXRSessionEnd,
    // Error tracking
    trackError,
    // Debug utilities
    getStoredEvents,
    clearStoredEvents,
    flushEvents,
  };
}

export default useAnalytics;
