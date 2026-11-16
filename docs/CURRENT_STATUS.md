# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 3 — Gameplay UX and Polish (**complete** for planned scope)  
**Active milestone:** Await approval before Phase 4 evaluation (or Phase 5 Android)

## Project state

- Playable browser game with polished feedback: animations, procedural SFX + mute, first-run tutorial, safer multi-size framing.
- Domain rules remain Phaser-free; 17 unit tests passing.

## Completed

### Phases 0–2
- Foundation, core engine, playable MVP (see prior changelog entries)

### Phase 3 — UX and polish
- Tray picking + UI chrome (earlier)
- Placement pop + line-clear shrink/fade + score floaters
- Procedural Web Audio SFX (`AudioService`) + mute toggle (persisted)
- First-run onboarding tutorial (persisted)
- Safe-area CSS, FIT scale mins, roundPixels / short-screen canvas framing

## Incomplete / next

1. **Next task:** Phase 4 — evaluate progression/retention features (do not implement blindly)
2. Or jump to Phase 5 Android (Capacitor) if preferred
3. Exhaustive multi-device QA remains under Phase 8
4. Do **not** start ads/analytics without Phase 7 approval

## Known bugs / limitations

- SFX are procedural beeps (no authored audio pack yet)
- Tutorial is a single panel (not multi-step interactive coach marks)
- Physical-device matrix not exhaustively tested

## Blockers / decisions needed

- Approve Phase 4 feature evaluation vs skip to Android (Phase 5)
