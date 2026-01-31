# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
