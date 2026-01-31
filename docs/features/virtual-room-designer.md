# Virtual Room Designer - Feature Specification

> **Feature Branch**: `feature/virtual-room-designer`  
> **Status**: Planning Phase  
> **Priority**: High  
> **Estimated Effort**: 6-8 Sprints

---

## 📋 Executive Summary

The **Virtual Room Designer** is a standalone module within Virtual Studio that enables users to assemble virtual furniture and art items into customizable 3D room environments. This feature empowers customers to test interior design combinations and assess functionality before making purchasing decisions, reducing returns and increasing customer confidence.

---

## 🎯 Feature Vision

### Core Value Proposition
- **Try Before You Buy**: Users can visualize products in realistic room contexts
- **Design Experimentation**: Mix and match furniture, art, and decor combinations
- **Spatial Planning**: Test proportions and arrangements without physical commitment
- **Confidence Builder**: Reduce purchase anxiety through virtual validation

### Target Users
1. **Homeowners** planning room renovations or updates
2. **Interior Designers** creating client presentations
3. **Renters** testing furniture layouts before moving
4. **Gift Shoppers** visualizing items in recipient spaces

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Virtual Room Designer Module                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Room Template  │  │  Item Placement │  │  Save/Load      │ │
│  │  Selector       │  │  Engine         │  │  Manager        │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│  ┌────────▼────────────────────▼────────────────────▼────────┐ │
│  │                   Scene State Manager                      │ │
│  │                   (Zustand + Immer)                        │ │
│  └────────────────────────────┬──────────────────────────────┘ │
│                               │                                │
│  ┌────────────────────────────▼──────────────────────────────┐ │
│  │                 React Three Fiber Renderer                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│ │
│  │  │ Room Mesh   │  │ Placed Items│  │ Interaction Handlers││ │
│  │  │ Generator   │  │ Collection  │  │ (Drag/Rotate/Scale) ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack Integration

| Component | Technology | Rationale |
|-----------|------------|-----------|
| 3D Room Rendering | React Three Fiber | Consistent with main app architecture |
| State Management | Zustand + Immer | Undo/redo support, persistence |
| Room Templates | Procedural + GLB | Balance flexibility and performance |
| Drag & Drop | @react-three/drei TransformControls | Battle-tested interaction patterns |
| Persistence | IndexedDB + Cloud Sync | Offline-first with optional backup |
| Snapshots | Canvas toDataURL | Share design previews |

---

## 🚀 Feature Roadmap

### Phase 1: Foundation (Sprint 1-2)
**Goal**: Establish core room rendering and basic item placement

#### Deliverables
- [ ] Room template system with 3 starter rooms
  - [ ] Living Room (12' x 14')
  - [ ] Bedroom (10' x 12')
  - [ ] Studio Apartment (20' x 25')
- [ ] Basic floor, wall, and ceiling rendering
- [ ] Item spawning from product catalog
- [ ] Ground-plane item placement
- [ ] Camera orbit controls with room bounds

#### Technical Tasks
```typescript
// New stores to create
stores/RoomDesignerStore.ts     // Room state, placed items
stores/RoomTemplateStore.ts     // Template definitions

// New components
components/room-designer/
├── RoomCanvas.tsx              // R3F scene wrapper
├── RoomShell.tsx               // Walls, floor, ceiling
├── PlacedItem.tsx              // Individual placed product
├── ItemPalette.tsx             // Product selection panel
└── RoomSelector.tsx            // Template picker
```

#### Acceptance Criteria
- [ ] User can select from 3 room templates
- [ ] User can add products from catalog to room
- [ ] Items snap to floor plane on placement
- [ ] Camera can orbit around room center
- [ ] Room renders at 60 FPS on target devices

---

### Phase 2: Interaction (Sprint 3-4)
**Goal**: Enable intuitive item manipulation

#### Deliverables
- [ ] Drag-to-reposition items on floor
- [ ] Rotation controls (90° snap + free rotation)
- [ ] Scale adjustments (within realistic bounds)
- [ ] Wall-mounted item placement (art, shelves)
- [ ] Item collision detection (prevent overlaps)
- [ ] Multi-select and group operations

#### Technical Tasks
```typescript
// New hooks
hooks/useItemTransform.ts       // Transform state machine
hooks/useCollisionDetection.ts  // Bounding box checks
hooks/useWallPlacement.ts       // Surface detection

// Enhanced components
components/room-designer/
├── TransformGizmo.tsx          // Visual manipulation handles
├── CollisionIndicator.tsx      // Overlap warning visuals
└── WallSnapGuide.tsx           // Wall placement helpers
```

#### Acceptance Criteria
- [ ] Items can be dragged to new positions
- [ ] Rotation snaps to 90° with Shift modifier
- [ ] Scale slider respects product constraints
- [ ] Wall items attach to detected wall surfaces
- [ ] Overlapping items show warning indicator
- [ ] Multi-select with Shift+Click

---

### Phase 3: Persistence (Sprint 5)
**Goal**: Save, load, and share room designs

#### Deliverables
- [ ] Local storage with IndexedDB
- [ ] Design naming and organization
- [ ] Undo/Redo history (50 steps)
- [ ] Export as image snapshot
- [ ] Shareable design links (optional cloud)
- [ ] Design versioning

#### Technical Tasks
```typescript
// New utilities
lib/roomDesignerPersistence.ts  // IndexedDB operations
lib/designSerializer.ts         // State serialization
lib/snapshotGenerator.ts        // Canvas capture

// State extensions (uses PlacedItem from API Contracts)
interface RoomDesignDocument {
  id: string;
  name: string;
  version: number;
  templateId: string;
  items: PlacedItem[];       // See API Contracts section
  cameraPosition: Vector3Tuple;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}
```

#### Acceptance Criteria
- [ ] Designs persist across browser sessions
- [ ] User can name and organize saved designs
- [ ] Undo/Redo works for placement operations
- [ ] PNG snapshot exports at 1920x1080
- [ ] Designs load correctly after format updates

---

### Phase 4: Enhancement (Sprint 6)
**Goal**: Polish and advanced features

#### Deliverables
- [ ] Lighting customization (time of day presets)
- [ ] Wall color/texture swapping
- [ ] Flooring material selection
- [ ] Measurement overlay tools
- [ ] Shopping list generation
- [ ] Cost calculator integration

#### Technical Tasks
```typescript
// Environment controls
components/room-designer/
├── LightingPresets.tsx         // Time of day simulation
├── WallMaterialPicker.tsx      // Surface customization
├── FloorMaterialPicker.tsx     // Flooring options
├── MeasurementTool.tsx         // Dimension display
└── ShoppingListPanel.tsx       // Cart integration
```

#### Acceptance Criteria
- [ ] 4 lighting presets (morning, noon, evening, night)
- [ ] 10+ wall colors/textures available
- [ ] 6+ flooring options (wood, tile, carpet)
- [ ] Measurements display in feet/meters toggle
- [ ] Shopping list totals all placed items

---

### Phase 5: WebXR Integration (Sprint 7-8) ✅ CORE FEATURE
**Goal**: View designed room in AR/VR

> **Status**: Foundation implemented as core platform feature.
> See `components/canvas/ARPreviewMode.tsx` and `components/canvas/VRPreviewMode.tsx`

#### Deliverables
- [x] AR Preview Mode - transparent passthrough for real-world item overlay
- [x] VR Preview Mode - virtual room environment with head tracking
- [x] Room template selection (Living Room, Bedroom, Studio, Custom)
- [x] Head tracking navigation support in VR
- [ ] AR room overlay on physical space (advanced hit-test)
- [ ] Scale model preview (tabletop AR)
- [ ] Collaborative VR viewing (stretch goal)

#### Technical Implementation (Completed)
```typescript
// Core XR Preview System
stores/XRPreviewStore.ts           // XR preview state management
components/ui/XRPreviewButton.tsx  // Mode selection button
components/canvas/ARPreviewMode.tsx // AR transparent overlay mode
components/canvas/VRPreviewMode.tsx // VR room environment mode

// Configuration
lib/constants.ts                   // XR_PREVIEW_CONFIG, VR_ROOM_TEMPLATES
lib/types.ts                       // XRPreviewMode, VRRoomTemplate, XRPreviewState
```

#### XR Preview Features
| Feature | AR Mode | VR Mode |
|---------|---------|---------|
| Background | Transparent (passthrough) | Virtual room |
| Navigation | Touch/gesture | Head tracking |
| Product Placement | Floating in space | Wall/floor mounted |
| Room Templates | N/A | 4 options |
| Controls | Pinch/rotate | Look around |

#### Acceptance Criteria
- [x] AR session shows product on transparent background
- [x] VR room renders with selectable templates
- [x] Head tracking enables view navigation
- [x] User can switch between AR and VR modes
- [ ] AR session anchors room to floor plane (advanced)
- [ ] Scale model fits on 3' surface
- [ ] Session state syncs (if collaborative)

---

## 📊 DevOps & Quality Assurance

### Iterative Refinement Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Cycle                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│   │  Plan   │───▶│  Build  │───▶│  Test   │───▶│ Review  │ │
│   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘ │
│        │              │              │              │       │
│        └──────────────┴──────────────┴──────────────┘       │
│                         ▲         │                         │
│                         │         ▼                         │
│                    ┌─────────────────┐                      │
│                    │    Feedback     │                      │
│                    │    & Metrics    │                      │
│                    └─────────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Error Reduction Strategies

#### 1. Type Safety
```typescript
// Strict TypeScript throughout
// All item placements validated
// See PlacedItem interface in API Contracts section
// position: Vector3Tuple - validated within room bounds
// rotation: QuaternionTuple - auto-normalized
// scale: number - constrained by product min/max scale
```

#### 2. State Machine Validation
```typescript
// All interactions follow defined state machines
type PlacementState = 
  | { status: 'idle' }
  | { status: 'selecting'; productId: string }
  | { status: 'placing'; productId: string; previewPosition: Vector3Tuple }
  | { status: 'placed'; placedItemId: string }
  | { status: 'error'; message: string };
```

#### 3. Automated Testing Strategy

| Test Type | Tools | Coverage Target |
|-----------|-------|-----------------|
| Unit | Vitest | 80% utilities |
| Component | React Testing Library | 70% components |
| Visual | Playwright + Percy | Key interaction flows |
| Performance | Lighthouse CI | 60+ score on mobile |
| E2E | Playwright | Critical user journeys |

#### 4. Continuous Integration Pipeline

```yaml
# .github/workflows/room-designer-ci.yml
name: Room Designer CI

on:
  push:
    paths:
      - 'components/room-designer/**'
      - 'stores/RoomDesigner*.ts'
      - 'hooks/use*Room*.ts'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Lint (ESLint + TypeScript strict)
        run: npm run lint
      - name: Test (Vitest unit + component)
        run: npm run test
      - name: Build (Next.js production)
        run: npm run build
        
  visual-regression:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Playwright screenshots
        run: npx playwright test
      - name: Percy visual diff
        run: npx percy exec -- npx playwright test
```

#### 5. Feature Flags for Safe Rollout

```typescript
// lib/featureFlags.ts
export const ROOM_DESIGNER_FLAGS = {
  enabled: process.env.NEXT_PUBLIC_ROOM_DESIGNER === 'true',
  phases: {
    foundation: true,      // Phase 1
    interaction: true,     // Phase 2
    persistence: false,    // Phase 3 - in development
    enhancement: false,    // Phase 4 - planned
    webxr: false,          // Phase 5 - planned
  },
};
```

---

## 📐 User Interface Specifications

### Layout Overview

```
┌────────────────────────────────────────────────────────────────┐
│  Virtual Room Designer                          [Save] [Share] │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌────────────────────────────────────────────┐│
│ │              │ │                                            ││
│ │  Item        │ │                                            ││
│ │  Palette     │ │           3D Room Viewport                 ││
│ │              │ │                                            ││
│ │ ┌──────────┐ │ │                                            ││
│ │ │ Chair    │ │ │                                            ││
│ │ │ $299     │ │ │                                            ││
│ │ └──────────┘ │ │                                            ││
│ │ ┌──────────┐ │ │                                            ││
│ │ │ Table    │ │ │                                            ││
│ │ │ $599     │ │ │                                            ││
│ │ └──────────┘ │ │                                            ││
│ │ ┌──────────┐ │ │                                            ││
│ │ │ Art      │ │ │                                            ││
│ │ │ $150     │ │ └────────────────────────────────────────────┘│
│ │ └──────────┘ │ ┌────────────────────────────────────────────┐│
│ │              │ │ Room: Living Room │ Total: $1,048 │ 3 Items ││
│ └──────────────┘ └────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Glassmorphism Design Tokens

```css
/* Consistent with main app aesthetics */
.room-designer-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.room-designer-button {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.2), 
    rgba(255, 255, 255, 0.05));
  transition: all 0.3s ease;
}
```

---

## 🔒 Performance Constraints

### Target Metrics (Rokid Station 2)

| Metric | Target | Minimum |
|--------|--------|---------|
| FPS | 60 | 30 |
| Draw Calls | < 150 | < 200 |
| Texture Memory | < 256MB | < 384MB |
| Placed Items | 50 | 20 |
| Initial Load | < 3s | < 5s |

### Optimization Strategies

1. **Level of Detail (LOD)**: Switch to simplified meshes at distance
2. **Instancing**: Batch identical placed items
3. **Texture Atlasing**: Combine material textures
4. **Occlusion Culling**: Don't render items behind walls
5. **Lazy Loading**: Load item models on demand

---

## 📝 API Contracts

### Room Design State Schema

```typescript
// Type imports from Three.js ecosystem
import type { Vector3Tuple, QuaternionTuple } from 'three';

// Core placed item structure (used throughout the specification)
interface PlacedItem {
  id: string;
  productId: string;           // Must exist in catalog
  position: Vector3Tuple;      // [x, y, z] validated bounds
  rotation: QuaternionTuple;   // [x, y, z, w] normalized
  scale: number;               // Within product constraints
}

// Snapshot for undo/redo history
interface RoomDesignSnapshot {
  items: PlacedItem[];
  room: RoomConfiguration;
  timestamp: number;
}

// Room configuration
interface RoomConfiguration {
  templateId: string;
  dimensions: { width: number; depth: number; height: number };
  wallColor: string;
  floorMaterial: string;
  lighting: 'morning' | 'noon' | 'evening' | 'night';
}

// Main state interface
interface RoomDesignState {
  // Room configuration
  room: RoomConfiguration;
  
  // Placed items
  items: Map<string, PlacedItem>;
  
  // Selection state
  selection: {
    selectedIds: Set<string>;
    hoveredId: string | null;
    transformMode: 'translate' | 'rotate' | 'scale';
  };
  
  // History
  history: {
    past: RoomDesignSnapshot[];
    future: RoomDesignSnapshot[];
    maxSteps: number;
  };
  
  // Actions
  placeItem: (productId: string, position: Vector3Tuple) => string;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<PlacedItem>) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<string>;
  load: (designId: string) => Promise<void>;
}
```

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Adoption | 40% of users | Analytics |
| Design Completion Rate | 60% | Saved designs / started |
| Add to Cart from Designer | 25% | E-commerce tracking |
| Return Rate Reduction | -15% | Post-launch comparison |
| User Satisfaction | 4.5/5 | In-app survey |

### Qualitative Goals
- Intuitive first-time user experience (< 30s to place first item)
- Professional-quality snapshots suitable for social sharing
- Seamless transition between gallery and room designer modes

---

## 📚 References

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js TransformControls](https://threejs.org/docs/#examples/en/controls/TransformControls)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [WebXR Device API - W3C Specification](https://www.w3.org/TR/webxr/)

---

## 📅 Timeline Summary

| Phase | Duration | Dependencies | Status |
|-------|----------|--------------|--------|
| Phase 1: Foundation | 2 sprints | None | 📋 Planned |
| Phase 2: Interaction | 2 sprints | Phase 1 | 📋 Planned |
| Phase 3: Persistence | 1 sprint | Phase 2 | 📋 Planned |
| Phase 4: Enhancement | 1 sprint | Phase 3 | 📋 Planned |
| Phase 5: WebXR | 2 sprints | Phase 4 | 📋 Planned |

**Total Estimated Duration**: 8 sprints (16 weeks)

---

<div align="center">
  <strong>Virtual Room Designer v0.1 Specification</strong><br>
  <em>Last Updated: January 2026</em>
</div>
