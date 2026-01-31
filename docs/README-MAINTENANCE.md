# README Maintenance Guide

> **For AI Assistants**: This document provides guidelines for keeping `README.md` synchronized with the actual project state. Always consult this guide before updating the README.

---

## 📋 Overview

The `README.md` file serves as the primary documentation for Virtual Studio. It must accurately reflect:
- Current project structure (files and directories)
- Implemented features (marked with ✅ or `[x]`)
- Planned features (marked with `[ ]`)
- Version information (synchronized with `CHANGELOG.md`)
- Technology stack and dependencies

---

## 🔄 Synchronization Points

The README contains several sections that must stay synchronized with actual source code. Below is the mapping:

### 1. Project Structure (Line ~47-88)

**Source of Truth**: Actual file system

| README Section | Verify Against |
|----------------|----------------|
| `app/` files | `ls app/` |
| `components/canvas/` | `ls components/canvas/` |
| `components/ui/` | `ls components/ui/` |
| `stores/` | `ls stores/` |
| `hooks/` | `ls hooks/` |
| `lib/` | `ls lib/` |
| `mcp/` | `ls mcp/` |
| `docs/` | `ls docs/` |

**When to update**: After adding, removing, or renaming any files in these directories.

### 2. Roadmap / Feature Status (Line ~261-329)

**Source of Truth**: Implemented code + `CHANGELOG.md`

| Phase | Key Files to Check |
|-------|-------------------|
| Phase 1: Foundation | All files listed exist and are functional |
| Phase 2: Commerce | `stores/MockStore.ts` (cart implementation) |
| Phase 3: Immersive | `stores/XRPreviewStore.ts`, `stores/DeviceCapabilitiesStore.ts`, `components/canvas/ARPreviewMode.tsx`, `components/canvas/VRPreviewMode.tsx` |
| Phase 4: Polish | Loading states in components, error boundaries |
| Phase 5: Room Designer | `docs/features/virtual-room-designer.md`, related stores/components |

**When to update**: After implementing new features or completing roadmap items.

### 3. Version Number (Line ~397-399)

**Source of Truth**: `CHANGELOG.md` and `package.json`

```markdown
<!-- README.md footer -->
<div align="center">
  <strong>Virtual Studio v1.2.0</strong><br>
  <em>WebXR Commerce Platform</em>
</div>
```

**When to update**: After any release that bumps the version in `CHANGELOG.md`.

### 4. Tech Stack Table (Line ~29-36)

**Source of Truth**: `package.json` dependencies

| Verify | Against |
|--------|---------|
| Next.js version | `package.json` → `next` |
| React Three Fiber | `package.json` → `@react-three/fiber` |
| Drei | `package.json` → `@react-three/drei` |
| XR | `package.json` → `@react-three/xr` |
| Zustand | `package.json` → `zustand` |

**When to update**: After dependency version changes.

### 5. MCP Tools Table (Line ~362-369)

**Source of Truth**: `mcp/src/index.ts` (tool definitions)

**When to update**: After adding, removing, or modifying MCP tools.

---

## ✅ Maintenance Checklist

When making project changes, use this checklist to determine if README updates are needed:

### After Adding New Files
- [ ] Is the new file in `components/canvas/`? → Update Project Structure
- [ ] Is the new file in `components/ui/`? → Update Project Structure
- [ ] Is the new file in `stores/`? → Update Project Structure
- [ ] Is the new file in `hooks/`? → Update Project Structure
- [ ] Is the new file in `lib/`? → Update Project Structure
- [ ] Is the new file in `mcp/src/`? → Update Project Structure + MCP section

### After Implementing Features
- [ ] Does this complete a roadmap item? → Mark as `[x]` in Roadmap
- [ ] Is this a new feature not on roadmap? → Add to appropriate phase
- [ ] Does this add new dependencies? → Update Tech Stack if significant

### After Releases
- [ ] Update version in footer to match `CHANGELOG.md`
- [ ] Review roadmap items completed in this release
- [ ] Ensure "WebXR Commerce Platform" label is current

### After Structural Changes
- [ ] Directory renamed? → Update Project Structure tree
- [ ] Major architectural change? → Update Architecture Overview
- [ ] New design principle? → Add to Core Design Principles

---

## 📝 Step-by-Step Update Process

### 1. Gather Information

```bash
# Check current file structure
ls -la app/ components/canvas/ components/ui/ stores/ hooks/ lib/

# Check current version
cat package.json | grep '"version"'
head -20 CHANGELOG.md

# Check for any index exports
cat components/canvas/index.ts
cat components/ui/index.ts
cat stores/index.ts
cat hooks/index.ts
```

### 2. Identify Discrepancies

Compare actual files against README's Project Structure section. Look for:
- Files that exist but aren't documented
- Files documented that no longer exist
- Incorrect file descriptions

### 3. Update README Sections

Edit `README.md` with the following priorities:
1. **Project Structure** - Must match actual files
2. **Roadmap** - Must reflect implementation status
3. **Version** - Must match CHANGELOG.md
4. **Tech Stack** - Must match package.json

### 4. Verify Changes

After updating, verify:
- All listed files actually exist
- All `[x]` marked items are actually implemented
- Version matches `CHANGELOG.md` header
- No broken internal links (e.g., to `docs/features/`)

---

## 🔗 Cross-Reference Map

| README Section | Primary Source | Secondary Source |
|----------------|----------------|------------------|
| Project Structure | File system | `**/index.ts` exports |
| Tech Stack | `package.json` | Lock file versions |
| Roadmap Phase 1 | Files existence | Component functionality |
| Roadmap Phase 2 | `stores/MockStore.ts` | Cart features |
| Roadmap Phase 3 | XR stores + components | Device detection hook |
| Roadmap Phase 4 | Loading/error UI | Component code |
| Roadmap Phase 5 | `docs/features/virtual-room-designer.md` | XR Preview stores |
| MCP Tools | `mcp/src/index.ts` | `mcp/README.md` |
| Version | `CHANGELOG.md` | `package.json` |

---

## ⚠️ Common Pitfalls

### Don't
- ❌ Mark features as complete (`[x]`) without verifying implementation
- ❌ Add files to Project Structure that don't exist
- ❌ Update version without checking CHANGELOG.md
- ❌ Remove roadmap items that were completed (keep history)
- ❌ Change the AI Assistant Guidelines section without discussion

### Do
- ✅ Always verify files exist before documenting them
- ✅ Check CHANGELOG.md before updating version
- ✅ Keep roadmap items even when complete (shows progress)
- ✅ Update both README.md AND CHANGELOG.md for releases
- ✅ Maintain consistent formatting with existing sections

---

## 📊 Version History Tracking

| Version | Key README Changes |
|---------|-------------------|
| v1.0.0 | Initial README with architecture and roadmap |
| v1.1.0 | Added Phase 1 completion details |
| v1.2.0 | Added MCP section, updated Phase 3 & 5 with XR Preview |

**Next expected updates**:
- Phase 2 commerce features completion
- Phase 3 WebXR hit-test implementation
- Phase 5 Room Designer implementation

---

## 🤖 AI Assistant Quick Reference

When asked to update the README:

1. **First**: Read this maintenance guide
2. **Then**: Run file system checks to see current state
3. **Compare**: README content vs actual state
4. **Update**: Only sections that are out of sync
5. **Verify**: All changes are accurate before committing

**Key commands to run**:
```bash
# Quick structure check
find app components stores hooks lib mcp -name "*.ts" -o -name "*.tsx" | head -50

# Version check
grep -E '"version"' package.json && head -10 CHANGELOG.md

# Index exports (what's publicly exposed)
cat stores/index.ts hooks/index.ts 2>/dev/null
```

---

<div align="center">
  <em>Last updated: January 2026</em><br>
  <strong>Keep this guide synchronized with README.md structure changes</strong>
</div>
