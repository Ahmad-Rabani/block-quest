# Block Quest — Project Overview

## Product Vision

**Block Quest** is a commercial 2D block puzzle game for mobile (Android and iOS), with browser builds used for development and testing.

| Attribute | Value |
|-----------|-------|
| Category | 2D Block Puzzle |
| Orientation | Portrait |
| Business goal | Commercial mobile game with future monetization |
| Visual direction | Premium, modern, clean, smooth animations, original identity |

Do not copy another game's branding, assets, artwork, or exact visual presentation.

## Technology Stack

| Technology | Version / Notes |
|------------|-----------------|
| TypeScript | Strict mode |
| Phaser | 4.2.1 (initial) |
| Vite | Bundler / dev server |
| Vitest | Unit testing |
| Capacitor | 8 (Phase 5+) |
| Node.js | 22+ |

## Core Gameplay (MVP)

- **Board:** 8×8 grid, square cells, responsive portrait layout
- **Pieces:** Three available at a time; drag/touch; placement preview; invalid placement blocked; new set when all three used
- **Placement:** Boundary and overlap validation; logic independent of Phaser
- **Line clearing:** Complete rows and columns cleared simultaneously; intersecting cells counted once
- **Scoring:** Configurable points for placement and multi-line clears; combo bonus
- **Game over:** No remaining piece can fit anywhere on the board
- **Progression:** Current score, best score (localStorage), game-over screen, restart

## Visual Palette (Starting)

| Token | Hex |
|-------|-----|
| Background | `#F4F2FA` |
| Primary Purple | `#6545D6` |
| Blue | `#42A5F5` |
| Orange | `#FF9B54` |
| White | `#FFFFFF` |

## Architecture Principle

Domain / game rules must remain independent of Phaser rendering so they are unit-testable without launching the game. See `docs/ARCHITECTURE.md`.

## Out of Scope Until Approved

Ads, analytics, online accounts, unnecessary network requests, store publishing, iOS native project on Windows.

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/PHASES_GUIDE.md` | Plain-language explanation of every phase |
| `docs/CURRENT_STATUS.md` | Current phase, completed work, bugs |
| `docs/DEVELOPMENT_ROADMAP.md` | Phased plan and acceptance criteria |
| `docs/ARCHITECTURE.md` | Layering and module responsibilities |
| `docs/DEVELOPMENT_WORKFLOW.md` | Mandatory task workflow |
| `docs/DECISIONS.md` | Technical decisions (ADR-style) |
| `docs/CHANGELOG.md` | Milestone change history |
| `docs/ANDROID.md` | Capacitor Android setup |
| `docs/QA_CHECKLIST.md` | Phase 8 manual + device QA checklist |
