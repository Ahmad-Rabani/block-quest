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

**Status:** Complete (planned scope)

### Tasks

- [x] Improve tray touch/mouse picking accuracy
- [x] First-pass UI chrome (header chips, tray panel, board depth)
- [x] Improve placement / line-clear animations
- [x] Add sound effects and mute controls
- [x] Add a simple onboarding/tutorial
- [x] Harden multi-size framing (FIT scale + safe-area CSS); full device matrix → Phase 8
- [x] Light performance passes (roundPixels, avoid extra drag plugins)

### Acceptance criteria

- [x] Placement and line clears have visible animated feedback
- [x] Mute persists across refresh
- [x] First-run tutorial can be dismissed and stays dismissed
- [x] Unit tests still pass; production build succeeds

---

## PHASE 4 — Progression and Retention

**Status:** Partial complete (evaluated slice)

### Evaluation (2026-11-16)

| Feature | Value | Complexity | Decision |
|---------|-------|------------|----------|
| Optional undo | High | Medium | **Ship now** (3/run) |
| Daily challenge | High | Medium | **Ship now** (seeded local) |
| Themes | Medium | Medium | Defer |
| Achievements | Medium | Medium | Defer |
| Special blocks | Medium-High | High | Defer |
| Deep progression meta | Medium | High | Defer |

### Tasks

- [x] Evaluate feature list for value/complexity
- [x] Implement optional Undo
- [x] Implement Daily Challenge (date-seeded trays + daily best)
- [x] Fix modal + tray alignment (shared layout + modal factory)
- [ ] Themes (deferred)
- [ ] Achievements (deferred)
- [ ] Special block abilities (deferred)

---

## PHASE 5 — Android Integration

**Status:** Configured on Windows — emulator/device QA pending SDK

### Tasks

- [x] Integrate Capacitor 8
- [x] Configure Android project (`com.blockquest.game`)
- [x] Configure application identifier + portrait lock
- [x] Handle app lifecycle (pause/resume audio)
- [x] Handle Android back button (dismiss tutorial / minimize)
- [x] Verify offline gameplay architecture (localStorage; no network required for play)
- [x] Prepare Android production config basics (versionName, docs)
- [ ] Test on Android emulator (requires Android SDK / `ANDROID_HOME`)
- [ ] Test on a physical Android device

---

## PHASE 6 — iOS Integration

**Status:** Deferred on Windows — requires macOS/Xcode (DEC-006)

### Tasks

- [ ] Configure Capacitor iOS (on Mac)
- [ ] Open in Xcode; set app identity
- [ ] Simulator + device tests
- [ ] Lifecycle + safe areas
- [ ] Offline gameplay validation

---

## PHASE 7 — Analytics and Monetization

**Status:** Blocked — requires explicit approval

No ads or analytics before approval.

---

## PHASE 8 — Quality Assurance

**Status:** In progress — automated + mobile web framing; manual/device pending

### Tasks

- [x] Expand automated edge-case + persistence + undo-limit tests
- [x] Create permanent `docs/QA_CHECKLIST.md`
- [x] Verify `npm test` + `npm run build` on this machine
- [x] Mobile browser framing polish (`100dvh` + visualViewport sync)
- [ ] Manual browser checklist (sections B–D) — owner playtest
- [ ] Multi-size DevTools pass
- [ ] Android emulator/device checklist (section F) — needs SDK / `ANDROID_HOME`
- [ ] Interruption / offline device pass
- [ ] Low-end performance soak

### Acceptance criteria

- [x] Automated rules/persistence tests pass (31+)
- [x] QA checklist documented for future chats
- [ ] Manual + device items signed off before store submission

---

## PHASE 9 — Release Preparation

**Status:** Documentation + graphics ready — **do not publish without explicit approval**

### Tasks

- [x] Create Block Quest brand icon + splash masters
- [x] Generate Android mipmaps / splash drawables + web favicon
- [x] Show brand icon on BootScene
- [x] Store descriptions draft (`docs/store/STORE_LISTING.md`)
- [x] Privacy documentation draft (`docs/store/PRIVACY.md`)
- [x] Screenshot guide + folder (`docs/store/SCREENSHOTS.md`)
- [x] Feature graphic (`assets/store/feature-graphic-1024x500.png`)
- [x] Release build instructions (`docs/store/RELEASE_BUILDS.md`)
- [x] Store submission checklist (`docs/store/SUBMISSION_CHECKLIST.md`)
- [x] Capture store screenshots into `assets/store/screenshots/android/` (`npm run store:shots`)
- [ ] Optional extra shots (drag / clear) if listing needs more than 4
- [ ] Host privacy policy URL + real support contact
- [ ] Produce signed release AAB (needs SDK + keystore)
- [ ] Owner approval to upload
