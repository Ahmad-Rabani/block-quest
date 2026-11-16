# Block Quest — Technical Decisions

Record significant decisions here. New chats must read this before changing established choices.

## DEC-001 — Technology baseline

- **Date:** 2026-11-16
- **Decision:** TypeScript (strict) + Phaser 4.2.1 + Vite + Vitest. Capacitor 8 deferred to Phase 5.
- **Rationale:** Matches product brief; Phaser 4.2.1 confirmed on npm; Node 22 available in environment.
- **Status:** Accepted

## DEC-002 — Domain / rendering separation

- **Date:** 2026-11-16
- **Decision:** Pure game rules live in `src/domain/` with no Phaser imports. Phaser scenes/views consume domain results.
- **Rationale:** Unit-testable rules; safer future native wrap; clearer architecture.
- **Status:** Accepted

## DEC-003 — Board and piece model

- **Date:** 2026-11-16
- **Decision:** 8×8 board as a flat or 2D occupancy grid of cell states. Pieces defined as relative `{x,y}` offsets from an anchor. Three tray slots; refill when all used.
- **Rationale:** Spec requirement; simple validation and generation.
- **Status:** Accepted

## DEC-004 — Scoring values are configurable constants

- **Date:** 2026-11-16
- **Decision:** Initial scoring (1 per block, 10/25/45/70+ lines, combo bonus) lives in domain constants and may be tuned later without rewriting systems.
- **Rationale:** Spec states these are initial balancing values, not final design.
- **Status:** Accepted

## DEC-005 — Persistence

- **Date:** 2026-11-16
- **Decision:** Best score via `localStorage` through `StorageService`. No backend for MVP.
- **Rationale:** Offline-first; works in browser and future Capacitor WebView.
- **Status:** Accepted

## DEC-006 — No iOS project on Windows

- **Date:** 2026-11-16
- **Decision:** Do not add Capacitor iOS platform during Windows development.
- **Rationale:** Xcode/macOS required; avoids broken/partial native trees.
- **Status:** Accepted

## DEC-007 — Monetization / analytics deferred

- **Date:** 2026-11-16
- **Decision:** No ads, analytics, accounts, or network telemetry until Phase 7 and explicit approval.
- **Rationale:** Core experience first; privacy and store compliance later.
- **Status:** Accepted

## DEC-008 — Source layout

- **Date:** 2026-11-16
- **Decision:** Use the structure in `docs/ARCHITECTURE.md` (`domain`, `game/{config,scenes,systems,objects}`, `services`, `styles`, `tests/`).
- **Rationale:** Matches product brief; clear separation of concerns.
- **Status:** Accepted

## DEC-009 — Combo scoring formula

- **Date:** 2026-11-16
- **Decision:** Combo streak increments on each placement that clears ≥1 line; resets on a placement with zero lines. Combo bonus = `comboBefore * comboBonusPerStreak` (default 5) when a clear happens with an existing streak.
- **Rationale:** Spec required a configurable combo bonus; keeps first clear of a streak without retroactive bonus.
- **Status:** Accepted

## DEC-010 — Tap-to-place behavior (MVP)

- **Date:** 2026-11-16
- **Decision:** Short tap on a tray piece places it at the first valid origin (scan order top-left). Drag remains primary.
- **Rationale:** Spec asked for tap-to-place where practical; refined targeting deferred to Phase 3.
- **Status:** Superseded by DEC-011

## DEC-011 — Manual tray drag + full-slot hit targets

- **Date:** 2026-11-16
- **Decision:** Tray pieces use slot-sized hit boxes and manual pointer drag (with vertical lift). Short tap no longer auto-places.
- **Rationale:** Phaser Container `setDraggable` with tight shape bounds made pieces hard to pick; auto first-cell tap felt unpredictable.
- **Status:** Accepted

## DEC-012 — Procedural SFX (no audio assets)

- **Date:** 2026-11-16
- **Decision:** Use Web Audio API oscillators for MVP sound; persist mute in localStorage.
- **Rationale:** Avoid asset pipeline and CDN dependency; offline-friendly; easy to replace with authored SFX later.
- **Status:** Accepted

## DEC-013 — First-run tutorial is a single dismissible panel

- **Date:** 2026-11-16
- **Decision:** Show a one-time “How to Play” overlay; store `tutorialSeen`. No interactive coach marks in Phase 3.
- **Rationale:** Fast onboarding without blocking core play loop development.
- **Status:** Accepted

## DEC-014 — Phase 4 ships Undo + Daily first

- **Date:** 2026-11-16
- **Decision:** Implement Undo (3/run) and local Daily Challenge; defer themes, special blocks, and achievements.
- **Rationale:** Highest retention value per complexity; keeps domain testable; avoids scope explosion before Android.
- **Status:** Accepted

## DEC-015 — Shared layout + modal factory

- **Date:** 2026-11-16
- **Decision:** Board/tray use `src/game/ui/layout.ts`; overlays use `ModalFactory` for centered stacking.
- **Rationale:** Fixes drift between tray panel vs piece slots and uneven modal text/button alignment.
- **Status:** Accepted

## DEC-016 — Android app identity

- **Date:** 2026-11-16
- **Decision:** Application ID `com.blockquest.game`; Capacitor 8.6.2; portrait-only activity.
- **Rationale:** Stable reverse-DNS id for Play Console; matches product orientation.
- **Status:** Accepted

## DEC-017 — Commit Android project, not iOS

- **Date:** 2026-11-16
- **Decision:** Version-control `android/` sources; keep `ios/` out of the tree on Windows.
- **Rationale:** Enables Android iteration without macOS; respects DEC-006.
- **Status:** Accepted
