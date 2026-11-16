# Block Quest — Development Roadmap

Phases must be completed against acceptance criteria. Do not mark complete without verification.

---

## PHASE 0 — Project Foundation

**Status:** Complete

### Tasks

- [x] Inspect existing workspace (empty)
- [x] Establish permanent Cursor rules
- [x] Create project documentation set
- [x] Establish Vite + TypeScript + Phaser 4.2.1 project
- [x] Configure Vitest
- [x] Verify basic development environment (`npm run build`, `npm test`, `npm run dev`)

### Acceptance criteria

- [x] Repo has working Vite/TS/Phaser bootstrap
- [x] Permanent rules and docs exist
- [x] Dev server and unit test runner start successfully

---

## PHASE 1 — Core Game Engine

**Status:** Complete

### Tasks

- [x] Board data model (8×8)
- [x] Piece definitions and generation (sets of 3)
- [x] Movement / placement validation
- [x] Row and column detection; simultaneous clear
- [x] Scoring (configurable)
- [x] Available-move detection and game-over calculation
- [x] Unit tests: moveValidator, lineClear, scoring

### Acceptance criteria

- [x] Domain logic has no Phaser imports
- [x] All listed unit tests pass (17/17 as of 2026-11-16)
- [x] Game-over considers all remaining pieces

---

## PHASE 2 — Playable Game

**Status:** Complete (MVP); polish deferred to Phase 3

### Tasks

- [x] BootScene + GameScene
- [x] Board and piece rendering
- [x] Mouse/touch drag-and-drop + placement preview
- [x] Connect engine to Phaser
- [x] Score display, game-over + restart
- [x] Best-score persistence

### Acceptance criteria

- [x] Playable portrait game builds for browser
- [x] Invalid placements blocked; lines clear; score updates (domain + scene wiring)
- [x] Best score persists via localStorage
- [ ] Exhaustive multi-device manual QA (tracked under Phase 3 / Phase 8)

---

## PHASE 3 — Gameplay UX and Polish

**Status:** In progress

### Tasks

- [x] Improve tray touch/mouse picking accuracy
- [x] First-pass UI chrome (header chips, tray panel, board depth)
- [ ] Improve placement / line-clear animations
- [ ] Add sound effects and mute controls
- [ ] Add a simple onboarding/tutorial
- [ ] Test multiple screen sizes
- [ ] Improve performance as needed

---

## PHASE 4 — Progression and Retention

**Status:** Not started (evaluate before implementing)

Daily challenge, themes, special blocks, optional undo, achievements, progression — assess value/complexity first.

---

## PHASE 5 — Android Integration

**Status:** Not started

Capacitor Android, app id, emulator/device, lifecycle, back button, offline, production config prep.

---

## PHASE 6 — iOS Integration

**Status:** Not started — requires macOS/Xcode later

---

## PHASE 7 — Analytics and Monetization

**Status:** Blocked — requires explicit approval

No ads or analytics before approval.

---

## PHASE 8 — Quality Assurance

**Status:** Not started

Rules, edge cases, mobile interaction, sizes, low-end devices, interruptions, persistence, offline.

---

## PHASE 9 — Release Preparation

**Status:** Not started — do not publish without explicit approval

Icons, splash, screenshots, descriptions, privacy, platform review, release builds, store checklist.
