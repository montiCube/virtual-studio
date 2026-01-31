# Virtual Studio - WebXR Spatial Commerce Platform

> **AI Assistant Context**: When assisting with this project, assume the role of a **Senior Principal Software Architect specializing in WebXR and Spatial Computing**. Your expertise spans real-time 3D graphics, immersive commerce experiences, and performance optimization for mobile/spatial computing devices.

---

## 🔗 Live Demo

**[▶️ Launch Virtual Studio](https://monticube.github.io/virtual-studio/)**

Experience the immersive 3D gallery directly in your browser.

---

## 🎯 Project Vision

**Virtual Studio** is a production-grade WebXR commerce application that enables users to experience furniture and art in immersive 3D environments—and place them in their physical spaces using Augmented Reality.

### Target Platform
- **Primary Device**: Rokid Station 2 (Android-based Spatial Computer)
- **Secondary**: Desktop browsers, Mobile Safari/Chrome with WebXR support
- **Input Methods**: Touch, Mouse, Keyboard, and Gamepad API (Rokid remote as D-Pad)

---

## 🏗️ Architecture Overview

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ (App Router) | SSR, routing, optimization |
| 3D Engine | React Three Fiber | Declarative Three.js |
| 3D Utilities | @react-three/drei | Helpers, controls, loaders |
| WebXR | @react-three/xr | AR/VR session management |
| State | Zustand + Immer | Global state with immutability |
| Styling | Tailwind CSS | Glassmorphism AR-friendly UI |

### Core Design Principles
1. **Performance First**: Optimized for mobile GPUs with adaptive quality
2. **Plug-and-Play Assets**: Single source of truth for all asset URLs (`lib/constants.ts`)
3. **Procedural Geometry**: Frames generated from code, not loaded models
4. **Unified Input**: Seamless keyboard, gamepad, and touch navigation
5. **Spatial Audio Ready**: Vibe-based audio system architecture (Howler.js compatible)

---

## 📁 Project Structure

```
virtual-studio/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main entry point
│   └── globals.css        # Tailwind + glassmorphism utilities
├── components/
│   ├── canvas/            # R3F 3D Components
│   │   ├── ImmersiveGallery.tsx   # Main scene orchestrator
│   │   ├── ProceduralFrame.tsx    # Parametric art frames
│   │   ├── ModelViewer.tsx        # GLB loader with auto-scale
│   │   ├── GalleryFloor.tsx       # Reflective floor
│   │   └── ProductSpotlight.tsx   # Dynamic lighting
│   └── ui/                # 2D Overlay Components
│       ├── ProductHUD.tsx         # Product info card
│       ├── NavigationHint.tsx     # Input hints
│       └── ARButton.tsx           # WebXR session toggle
├── stores/
│   └── MockStore.ts       # Zustand store with mock data
├── hooks/
│   ├── useGalleryNavigation.ts    # Keyboard + Gamepad input
│   └── useAudioController.ts      # Audio state management
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   └── constants.ts       # Configuration & asset URLs
├── docs/                   # Feature Documentation
│   └── features/
│       └── virtual-room-designer.md  # Room Designer specification
└── public/                # Static assets
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| `←` `→` Arrow Keys | Browse products |
| `A` `D` Keys | Browse products (alt) |
| Mouse Drag | Rotate camera |
| Scroll Wheel | Zoom in/out |
| Gamepad D-Pad | Browse (Rokid remote) |
| Gamepad A Button | Select |

---

## 🔧 Customization Guide

### Swapping Assets

All asset URLs are centralized in `lib/constants.ts`:

```typescript
export const MOCK_ASSETS = {
  images: {
    art1: 'YOUR_IMAGE_URL',  // Artwork textures
    art2: 'YOUR_IMAGE_URL',
  },
  models: {
    table: 'YOUR_GLB_URL',   // 3D furniture models
  },
  audio: {
    calm: '/audio/calm.mp3',
    upbeat: '/audio/upbeat.mp3',
  },
};
```

### Adding Products

Edit `stores/MockStore.ts`:

```typescript
// For framed artwork
const MOCK_ART_PRODUCTS: ArtProduct[] = [
  {
    id: 'art-001',
    name: 'Your Art Name',
    type: 'art',
    vibe: 'calm',           // Audio mapping
    imageUri: MOCK_ASSETS.images.art1,
    frameColor: '#5c4033',  // Hex color
    dimensions: { width: 1.2, height: 0.9 },
    price: 450,
    description: 'Description here',
  },
];

// For 3D furniture
const MOCK_TABLE_PRODUCTS: TableProduct[] = [
  {
    id: 'table-001',
    name: 'Your Furniture Name',
    type: 'table',
    vibe: 'upbeat',
    modelUri: MOCK_ASSETS.models.table,
    scale: 1.5,
    price: 1200,
    description: 'Description here',
  },
];
```

---

## 🥽 WebXR Deployment

### Requirements for AR
- HTTPS (required by WebXR spec)
- Compatible browser (Chrome Android, Safari iOS 15+, Rokid Browser)

### Quick Deploy Options

**Vercel** (Recommended):
```bash
npx vercel --prod
```

**Local HTTPS Testing**:
```bash
npx next dev --experimental-https
# Or use ngrok
ngrok http 3000
```

---

## 📐 Performance Guidelines

### For Rokid Station 2 / Mobile GPUs

| Asset Type | Recommendation |
|------------|----------------|
| Textures | Max 2048×2048, prefer 1024×1024 |
| GLB Models | < 50k triangles, Draco compressed |
| Draw Calls | Target < 100 per frame |
| Frame Rate | Target 60 FPS, min 30 FPS |

### Optimization Features Included
- `<AdaptiveDpr>` - Auto pixel ratio adjustment
- `<BakeShadows>` - Static shadow optimization  
- `<PerformanceMonitor>` - Quality tier switching
- Texture anisotropy capped at 4x
- HTML5 audio for memory efficiency

---

## 🤖 AI Assistant Guidelines

When working on this codebase, the AI assistant should:

### Assume This Role
> **Senior Principal Software Architect** specializing in:
> - WebXR and Spatial Computing
> - React Three Fiber ecosystem
> - Real-time 3D graphics optimization
> - Mobile GPU performance constraints
> - Immersive commerce UX patterns

### Key Technical Decisions to Maintain
1. **Procedural over Loaded**: Generate geometry in code when possible (see `ProceduralFrame.tsx`)
2. **Type Safety**: Full TypeScript with strict mode, explicit interfaces
3. **State Isolation**: Zustand stores are domain-specific (cart, gallery, audio, vibe)
4. **Input Abstraction**: Single hook handles all input sources (`useGalleryNavigation`)
5. **Asset Indirection**: Never hardcode URLs; always reference `MOCK_ASSETS`

### When Extending Features
- Maintain the glassmorphism design language for AR legibility
- Test with `AdaptiveDpr` on low-end devices
- Consider Rokid remote (D-Pad only, no pointer) as primary input
- Audio changes must crossfade, never cut abruptly
- XR sessions need explicit user gesture to start

### Code Style
- Functional components with hooks
- Named exports for components
- Colocate types near usage
- Comments for "why", not "what"
- Performance-critical code gets `useMemo`/`useCallback`

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Project scaffolding
- [x] Procedural frame generation (`components/canvas/ProceduralFrame.tsx`)
- [x] GLB model loading (`components/canvas/ModelViewer.tsx`)
- [x] Zustand state management (`stores/MockStore.ts`)
- [x] Keyboard/Gamepad navigation (`hooks/useGalleryNavigation.ts`)
- [x] Audio controller hook (`hooks/useAudioController.ts`)
- [x] Gallery floor with reflections (`components/canvas/GalleryFloor.tsx`)
- [x] Dynamic product spotlight (`components/canvas/ProductSpotlight.tsx`)
- [x] Product HUD overlay (`components/ui/ProductHUD.tsx`)
- [x] Navigation hints UI (`components/ui/NavigationHint.tsx`)
- [x] AR button component (`components/ui/ARButton.tsx`)
- [x] Main gallery scene orchestrator (`components/canvas/ImmersiveGallery.tsx`)
- [x] Next.js App Router setup (`app/layout.tsx`, `app/page.tsx`)
- [x] Glassmorphism CSS utilities (`app/globals.css`)
- [x] Configuration constants (`lib/constants.ts`)

### Phase 2: Commerce Features
- [x] Shopping cart state management (basic implementation in `stores/MockStore.ts`)
- [ ] Shopping cart persistence (localStorage/IndexedDB)
- [ ] Product detail modal
- [ ] Checkout flow UI
- [ ] Wishlist functionality

### Phase 3: Immersive Features  
- [x] Mixed Reality Preview System (core feature)
  - [x] AR Preview Mode - transparent passthrough for real-world overlay
  - [x] VR Preview Mode - virtual room environment with head tracking
  - [x] Room template selection (Living Room, Bedroom, Studio, Custom)
  - [x] XR Preview button with mode selection
- [x] Device Detection System
  - [x] Auto-detect device type (AR glasses, VR headsets, mobile, tablet, desktop)
  - [x] Camera capability detection for room scanning
  - [x] Known device profiles (Meta Quest, RayNeo, Rokid, iPhone, etc.)
  - [x] Feature recommendations based on device capabilities
- [ ] WebXR AR placement with hit-test
- [ ] Hit-test surface detection
- [ ] Product scaling in AR
- [ ] Spatial audio with Howler.js

### Phase 4: Polish
- [x] Loading states and transitions
- [ ] Error boundaries
- [ ] Analytics integration
- [ ] PWA support

### Phase 5: Virtual Room Designer 🆕
> **Feature Branch**: `feature/virtual-room-designer`  
> **Full Specification**: [docs/features/virtual-room-designer.md](docs/features/virtual-room-designer.md)

A standalone module enabling users to assemble virtual furniture and art into customizable 3D room environments to test interior design before purchasing.

- [ ] Room template system (Living Room, Bedroom, Studio)
- [ ] Item placement and manipulation (drag, rotate, scale)
- [ ] Wall-mounted item support (art, shelves)
- [ ] Design persistence and undo/redo history
- [ ] Lighting and material customization
- [ ] Shopping list generation with cost calculation
- [ ] WebXR AR room overlay and VR walkthrough

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - Declarative Three.js
- [Drei](https://github.com/pmndrs/drei) - Useful R3F helpers
- [Zustand](https://github.com/pmndrs/zustand) - Minimal state management
- [Three.js](https://threejs.org/) - 3D graphics foundation

---

<div align="center">
  <strong>Virtual Studio v1.0</strong><br>
  <em>WebXR Commerce Prototype</em>
</div>