# Block Quest — Changelog

## 2026-11-16 — Store screenshot capture pipeline

### Added
- `?storeShot=menu|play|daily|gameover` demo routes for store art
- `npm run store:shots` (Playwright) writing 1080×1920 PNGs to `assets/store/screenshots/android/`

## 2026-11-16 — Mobile web framing + release prep docs

### Changed
- Phone / touch browsers use full-bleed canvas (`100dvh`, no card shadow)
- `visualViewport` resize sync so Phaser FIT tracks mobile browser chrome
- Android Studio setup steps + screenshot file naming in store docs

## 2026-11-16 — Pre-game menu hub

### Added
- `MenuScene` before play: block-puzzle backdrop, TOP SCORE, Classic / Daily / locked Multiplayer
- Continue last run as a menu action when a saved run exists

### Changed
- Boot goes to Menu instead of starting GameScene immediately
- Removed in-header Classic/Daily toggles; mode shown as a label
- Game over adds Menu; Android back returns to the menu

## 2026-11-16 — P1 snap assist, continue run, line hints

### Added
- Snap assist while dragging (`placementAssist` / radius 1)
- Almost-full row/column orange hint cells
- Continue last run via localStorage + Continue/New Game modal
- Tests for assist + run snapshot round-trip

### Verified
- `npm test` — 43 passed
- `npm run build` — success

## 2026-11-16 — P1 settings, haptics, clear banners

### Added
- Settings sheet via **Menu** (Sound, Haptics, How to Play, credits)
- `HapticsService` + `@capacitor/haptics` (persisted preference)
- Clear/combo banner (`Nice clear!` / `Double clear!` / combo text)
- Tests for banner copy

### Changed
- Header mute chip replaced by Menu → Settings

### Verified
- `npm test` — 35 passed
- `npm run build` — success
- `npx cap sync android` — includes Haptics plugin

## 2026-11-16 — Tray overflow UI fix + feature backlog

### Fixed
- Long tray pieces (e.g. 1×4) overflowing slots — per-shape `fitTrayCellSize`
- Mute control label clarified (`SFX` / `Mute`)

### Added
- `docs/FEATURE_BACKLOG.md` prioritized improvement list
- `tests/trayFit.test.ts`

### Verified
- `npm test` — 32 passed

## 2026-11-16 — Phase 9 release preparation (no publish)

### Added
- `docs/store/` — listing copy, privacy draft, screenshots guide, release builds, submission checklist
- `assets/store/feature-graphic-1024x500.png` (+ master)
- Screenshot folder placeholder `assets/store/screenshots/android/`

### Notes
- No store upload performed
- Real gameplay screenshots and signed AAB still pending

### Verified
- `npm test` — 31 passed
- `npm run build` — success

## 2026-11-16 — Phase 8 QA (automated)

### Added
- `tests/qa.edgeCases.test.ts` — clear uniqueness, game-over rules, undo caps, storage persistence
- `docs/QA_CHECKLIST.md` — manual/browser/Android/performance checklist

### Verified
- `npm test` — 31 passed
- `npm run build` — success
- Device matrix — pending (no Android SDK on this machine)

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
