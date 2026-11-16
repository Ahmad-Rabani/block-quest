# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 2 — Playable Game (MVP implemented; polish deferred to Phase 3)  
**Active milestone:** Ready for Phase 3 UX polish (or directed bugfixes)

## Project state

- Vite + TypeScript (strict) + Phaser **4.2.1** + Vitest project is operational.
- Domain rules are Phaser-free and covered by unit tests.
- Browser playable MVP: board, tray pieces, drag/drop, preview, line clear, scoring, game over, restart, best-score persistence.

## Completed

### Phase 0 — Foundation

- Inspected empty workspace (Node v22.21.0)
- Permanent rule: `.cursor/rules/00-block-quest-core.mdc`
- Docs: PROJECT_OVERVIEW, CURRENT_STATUS, DEVELOPMENT_ROADMAP, ARCHITECTURE, DEVELOPMENT_WORKFLOW, DECISIONS, CHANGELOG
- Scaffold: Vite, TypeScript, Phaser 4.2.1, Vitest
- Verified: `npm test` (17 passed), `npm run build` (success), `npm run dev` starts

### Phase 1 — Core engine

- 8×8 board model, piece catalog, tray generation (3)
- Placement validation, simultaneous row/column clear (unique cells)
- Configurable scoring + combo
- Available-move / game-over logic
- Unit tests: `tests/moveValidator.test.ts`, `lineClear.test.ts`, `scoring.test.ts`

### Phase 2 — Playable MVP

- BootScene + GameScene
- BoardView + PieceView
- Mouse/touch drag-and-drop, placement preview
- Tap-to-place (first valid cell assist)
- Score / best score UI, game-over overlay + restart
- `StorageService` best-score via localStorage

## Incomplete / next

1. **Next task:** Phase 3 — gameplay UX polish (animations, clearer line-clear feedback, touch accuracy tuning, SFX + mute, light onboarding, multi-size checks)
2. Do not start monetization, analytics, Capacitor, or store work without approval

## Known bugs / limitations

- Tap-to-place uses the first valid board origin (functional, not ideal UX).
- Line-clear feedback is a short white flash only (no particle/score pop yet).
- No audio yet (Phase 3).
- Manual multi-device / multi-size playtesting not yet exhaustively performed.
- Large Phaser bundle size warning on build (expected; code-split later if needed).

## Blockers / decisions needed

- None blocking Phase 3.
- Confirm when to begin Phase 3 vs. additional MVP gameplay tweaks first.
