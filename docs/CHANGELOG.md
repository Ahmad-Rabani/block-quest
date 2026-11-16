# Block Quest — Changelog

## 2026-11-16 — Phases guide + brand images

### Clarified
- Added `docs/PHASES_GUIDE.md` (plain-language phase map)
- Confirmed prior builds had **no custom images** (Graphics-drawn blocks; Capacitor default icons)

### Added
- Brand masters in `assets/brand/`
- Android launcher icons + splash PNGs (Block Quest branded)
- Web favicon / apple-touch / icon-192
- BootScene brand icon
- `npm run assets:brand` generator script

### Deferred
- Phase 6 iOS on Windows (macOS required)

### Verified
- Brand asset generation succeeded
- (tests/build re-run in same milestone)

## 2026-11-16 — Phase 5 Android / Capacitor

### Added
- Capacitor 8.6.2 + `@capacitor/app` 8.1.2
- `android/` native project (`com.blockquest.game`)
- `capacitor.config.ts`, `docs/ANDROID.md`
- `NativeLifecycleService` (back button + app state audio suspend/resume)
- Scripts: `cap:sync`, `cap:open:android`

### Changed
- Portrait locked in `AndroidManifest.xml`
- `versionName` set to `0.1.0`
- `.gitignore` tracks Android sources; ignores build outputs / iOS

### Verified
- `npm test` — 20 passed
- `npm run build` — success
- `npx cap add android` / `npx cap sync android` — success
- Emulator/device run — **not executed** (no Android SDK on this machine)

## 2026-11-16 — Phase 4 slice + UI alignment

### Fixed
- Modal content/button vertical centering via shared `ModalFactory`
- Board/tray/slot alignment via shared `LAYOUT` (same side margins; slots vertically centered)

### Added
- Undo (3 per run) with history restore
- Classic / Daily mode toggle; seeded daily trays; daily best persistence
- Tests for seeded trays + undo (`tests/undoAndDaily.test.ts`)

### Verified
- `npm test` — 20 passed
- `npm run build` — success

## 2026-11-16 — Phase 3 UX polish

### Added
- Placement pop + line-clear shrink/fade animations; score floaters; tray appear tween
- `AudioService` procedural SFX (place, clear, invalid, game over, UI)
- Mute toggle with localStorage persistence
- First-run tutorial overlay (`tutorialSeen` persistence)
- Safe-area padding and short-screen canvas framing

### Changed
- `StorageService` supports mute + tutorial flags
- Game config: scale min bounds, antialias + roundPixels

### Verified
- `npm test` — 17 passed
- `npm run build` — success

## 2026-11-16 — UI polish + tray picking fix

### Changed
- Tray input: slot-sized hit areas, manual pointer drag, drag lift above finger/cursor
- Game UI: score/best chips, ambient backdrop, board depth, tray panel with slot pads, richer block shading
- Page CSS: soft gradient atmosphere and stronger canvas frame

### Fixed
- Unreliable piece picking from the bottom tray (tight Phaser Container hit areas / drag)

### Verified
- `npm test` — 17 passed
- `npm run build` — success

## 2026-11-16 — Phases 0–2 MVP

### Added

- Permanent Cursor rule: `.cursor/rules/00-block-quest-core.mdc`
- Documentation set under `docs/`
- Vite + TypeScript + Phaser 4.2.1 + Vitest project
- Domain layer: board, pieces, placement, line clear, scoring, game-over (`src/domain/`)
- Game systems: BoardManager, PieceGenerator, MoveValidator, LineClearSystem, ScoreManager
- Phaser scenes: BootScene, GameScene; views: BoardView, PieceView
- StorageService for best-score persistence
- Unit tests: moveValidator, lineClear, scoring (17 tests)

### Verified

- `npm test` — 17 passed
- `npm run build` — success
- `npm run dev` — starts on port 5173

### Notes

- Phase 3 polish (animations, SFX, onboarding) not started
- No ads, analytics, Capacitor, or store publishing

## 2026-11-16 — Phase 0 foundation kickoff

### Added

- Initial technical decisions DEC-001 through DEC-008
- Project documentation skeleton
