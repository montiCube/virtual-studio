# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-01-31

### Fixed

**Spatial Audio (`hooks/useSpatialAudio.ts`):**
- Fixed race condition in crossfade when rapidly switching vibes
- Added abort mechanism to prevent audio operations on unmounted components
- Queued crossfade requests now process sequentially

**Analytics (`hooks/useAnalytics.ts`):**
- Removed UserAgent tracking (privacy improvement - no fingerprinting)
- Fixed stale closure issue in initialization effect
- Made localStorage storage development-only by default
- Referrer now only stores hostname (not full URL)
- Added proper double-initialization prevention

**Service Worker (`public/sw.js`):**
- Changed URL matching from `.includes()` to strict prefix matching
- Prevents false positives like `/checkoutpage` being blocked

### Security

- Analytics no longer collects browser fingerprinting data
- Local analytics storage disabled by default in production

## [1.4.0] - 2026-01-31

### Added

#### Phase 3: Immersive Features

**Spatial Audio (`hooks/useSpatialAudio.ts`):**
- Howler.js integration for 3D positional audio
- HRTF (Head-Related Transfer Function) support for realistic spatial sound
- Web Audio API for low-latency audio processing
- Listener position and orientation tracking for XR experiences
- Sound positioning in 3D space
- Crossfade between vibe tracks
- Volume rolloff based on distance

#### Phase 4: Polish

**Analytics Integration (`hooks/useAnalytics.ts`):**
- Event tracking for product views, cart actions, XR sessions
- Session management with unique session IDs
- Event batching and queue management
- localStorage storage for debugging/development
- Support for backend analytics endpoints
- Tracking methods:
  - `trackProductView` / `trackProductDetailView`
  - `trackAddToCart` / `trackRemoveFromCart`
  - `trackAddToWishlist` / `trackRemoveFromWishlist`
  - `trackBeginCheckout` / `trackCompleteCheckout`
  - `trackXRSessionStart` / `trackXRSessionEnd`
  - `trackError`

### Dependencies

- Added `howler` ^2.2.4 for spatial audio
- Added `@types/howler` for TypeScript support

## [1.3.1] - 2026-01-31

### Security

**Critical security hardening for commerce features:**

- **Service Worker Security** (`public/sw.js`):
  - Added URL pattern filtering to exclude sensitive routes from caching
  - Checkout, payment, user, order, and auth endpoints are never cached
  - Prevents accidental PII exposure through browser cache

- **HTTP Security Headers** (`next.config.js`):
  - Added `X-Frame-Options: DENY` to prevent clickjacking attacks
  - Added `X-Content-Type-Options: nosniff` to prevent MIME sniffing
  - Added `Referrer-Policy: strict-origin-when-cross-origin` for privacy
  - Added `X-XSS-Protection: 1; mode=block` for legacy XSS protection
  - Added `Permissions-Policy` to restrict sensitive browser features

- **Input Validation** (`components/ui/CheckoutFlow.tsx`):
  - Added input sanitization to strip potential XSS characters
  - Added validation for names, email, postal codes
  - Added `maxLength` attributes to prevent buffer overflow attacks
  - Added proper `autoComplete` attributes for browser security
  - Added visual validation error feedback

### Changed

- Checkout form now resets properly when reopened
- Form fields now show red ring on validation errors

## [1.3.0] - 2026-01-31

### Added

#### Phase 2: Commerce Features (Complete)

**Shopping Cart Persistence:**
- Cart state now persists to localStorage using Zustand persist middleware
- Cart items survive browser refresh and page navigation

**Product Detail Modal (`components/ui/ProductDetailModal.tsx`):**
- Full-screen modal displaying detailed product information
- Product specifications (dimensions, frame color, scale)
- Add to Cart and Wishlist actions
- Keyboard navigation (Escape to close)

**Checkout Flow (`components/ui/CheckoutFlow.tsx`):**
- Multi-step checkout process (Review → Shipping → Payment → Confirmation)
- Progress indicator showing current step
- Shipping information form
- Mock payment form (demo mode)
- Order confirmation with generated order ID

**Wishlist Functionality:**
- `useWishlistStore` - Zustand store with localStorage persistence
- Add/remove products from wishlist
- Wishlist count badge
- `WishlistButton` component with visual state

**Cart UI Components:**
- `CartPanel` - Slide-out drawer showing cart items
- `CartButton` - Header button showing cart item count
- Quantity controls (+/-) for cart items
- Clear cart functionality

#### Phase 4: Polish (Partial)

**Error Boundaries:**
- `ErrorBoundary` - Generic error boundary with retry functionality
- `Canvas3DErrorBoundary` - Specialized boundary for 3D/WebGL errors
- User-friendly error messages with troubleshooting tips

**PWA Support:**
- `public/manifest.json` - Web app manifest with icons and metadata
- `public/sw.js` - Service worker for offline caching
- Apple Web App meta tags for iOS
- Stale-while-revalidate caching strategy

### Changed

- Updated `ProductHUD` to include "Details" button for modal
- Enhanced `app/page.tsx` with commerce UI components
- Added slide-left animation for cart panel
- Updated project structure documentation in README

## [1.2.0] - 2026-01-31

### Added

#### MCP Server for Art Display (`mcp/`)

A new Model Context Protocol (MCP) server enabling AI assistants to prepare stunning art pieces for spatial display on Rokid Station 2 and other WebXR devices.

**MCP Tools:**
- **prepare_art_piece** - Configure art with optimal framing, lighting, and positioning for immersive viewing
- **configure_frame** - Create procedural frames (modern, classic, minimalist, ornate, floating)
- **create_gallery_layout** - Arrange multiple pieces in immersive 3D room environments (living-room, bedroom, studio, custom)
- **optimize_for_spatial** - Device-specific optimization for Rokid Station 2, Meta Quest, mobile, and desktop
- **get_display_config** - Export TypeScript configuration ready for Virtual Studio integration
- **suggest_vibe_pairing** - AI-powered audio and lighting recommendations based on artwork characteristics
- **list_art_pieces** - List all prepared art pieces in the current session

**MCP Resources:**
- `virtual-studio://config/rokid-station-2` - Optimal display settings for Rokid Station 2
- `virtual-studio://config/frame-styles` - Available procedural frame styles and color palettes
- `virtual-studio://config/room-templates` - VR room templates for gallery layouts

**MCP Prompts:**
- **create_art_gallery** - Guided workflow for creating a complete art gallery display
- **optimize_for_rokid** - Recommendations for optimizing art display on Rokid Station 2

#### Rokid Station 2 Optimization
- Texture size optimization (1024x1024 max for performance)
- D-Pad navigation mapping for Rokid remote control
- AR passthrough mode configuration
- 60 FPS performance targeting with adaptive quality settings

### Security
- Updated `@modelcontextprotocol/sdk` to v1.25.2 to fix ReDoS and DNS rebinding vulnerabilities

### Configuration
- Updated `tsconfig.json` to exclude MCP directory from main Next.js compilation
- Added MCP integration documentation to README.md

## [1.1.0] - 2026-01-30

### Added

#### Core Application Structure
- **Next.js App Router** (`app/layout.tsx`, `app/page.tsx`)
  - Root layout with comprehensive metadata for SEO and social sharing
  - Main page with dynamic loading and suspense boundaries
  - Client-side rendering setup for 3D components

#### 3D Canvas Components (`components/canvas/`)
- **ImmersiveGallery.tsx** - Main scene orchestrator
  - React Three Fiber canvas setup with optimized camera configuration
  - Performance monitoring with adaptive quality tiers
  - OrbitControls for camera interaction
  - Environment lighting from @react-three/drei
  
- **ProceduralFrame.tsx** - Parametric art frames
  - Generates frame geometry programmatically (no external models needed)
  - Customizable frame color, depth, and thickness
  - Artwork texture loading with proper material setup
  - Subtle floating animation for visual interest
  
- **ModelViewer.tsx** - GLB/GLTF loader
  - Auto-scaling based on model bounding box
  - Optional auto-rotate animation
  - Loading progress indicator component
  
- **GalleryFloor.tsx** - Reflective floor
  - MeshReflectorMaterial for realistic reflections
  - Configurable size, color, roughness, and metalness
  
- **ProductSpotlight.tsx** - Dynamic lighting
  - Main spotlight with subtle intensity animation
  - Fill and back lights for depth

#### UI Components (`components/ui/`)
- **ProductHUD.tsx** - Product information overlay
  - Displays product name, description, price
  - Type-specific details (dimensions for art, scale for furniture)
  - Add to Cart functionality
  - Product counter navigation
  
- **NavigationHint.tsx** - Input hints
  - Keyboard navigation indicators
  - Current position display
  
- **ARButton.tsx** - WebXR session toggle
  - WebXR AR support detection
  - Enter/Exit AR toggle (UI scaffolding)

#### State Management (`stores/MockStore.ts`)
- **useGalleryStore** - Gallery navigation state
  - Product list with mock art and furniture data
  - Navigation functions (next, previous, goTo)
  - Transition state management
  - Audio track references by vibe category
  
- **useCartStore** - Shopping cart state
  - Add/remove/update cart items
  - Total price and item count calculations
  
- **useAudioStore** - Audio playback state
  - Vibe category tracking
  - Play/pause, volume, mute controls

#### Custom Hooks (`hooks/`)
- **useGalleryNavigation.ts** - Unified input handling
  - Keyboard support (Arrow keys, WASD)
  - Gamepad API support (D-Pad navigation)
  - Debounced input handling
  - Gamepad connection event handling
  
- **useAudioController.ts** - Audio management
  - HTML5 Audio integration
  - Crossfade between tracks
  - Volume and mute controls
  - Vibe-based track selection synced with current product

#### Configuration (`lib/constants.ts`)
- Mock asset URLs for images, models, and audio
- Gallery configuration (camera, navigation, display)
- Audio configuration (volume, fade durations)
- Input configuration (keyboard keys, gamepad buttons)
- Performance tier settings

#### Styling (`app/globals.css`)
- Tailwind CSS integration
- Glassmorphism utilities (`.glass`, `.glass-strong`, `.glass-dark`)
- Glow effects (`.glow`, `.glow-primary`, `.glow-accent`)
- AR-friendly high contrast text (`.ar-text`)
- XR button styles (`.xr-button`, `.xr-button-primary`, `.xr-button-secondary`)
- Animation utilities (float, pulse-glow, fade-in, slide-up)
- Product card and navigation hint styles

### Technical Improvements
- ESLint strict configuration for code quality
- TypeScript strict mode compliance
- Performance optimizations:
  - AdaptiveDpr for dynamic pixel ratio
  - BakeShadows for static shadow optimization
  - PerformanceMonitor for quality tier switching
- Proper cleanup of intervals and event listeners

### Updated
- README.md roadmap with detailed completed items
- Project structure now matches documentation

## [1.0.0] - 2026-01-26

### Added
- Initial project setup
- README.md with architecture documentation
- TypeScript type definitions (`lib/types.ts`)
- Next.js configuration
- Tailwind CSS configuration
- ESLint configuration
- Package.json with dependencies
