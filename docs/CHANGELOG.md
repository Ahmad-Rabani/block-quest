# Block Quest — Changelog

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
