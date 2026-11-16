# Block Quest — Improvement & Feature Backlog

Prioritized for a commercial mobile puzzle. Do **not** implement everything at once — pick by value vs complexity.

## P0 — Fix / polish now (quality)

| Item | Why |
|------|-----|
| Tray pieces fit inside slots | Prevents overflow (long I-pieces); done this session |
| Real gameplay screenshots | Needed for store |
| Android device smoke test | Phase 5/8 remaining |
| Clearer mute control label | SFX / Mute (done this session) |

## P1 — High value, medium effort (next product wins)

| Feature | Why players care |
|---------|------------------|
| **Haptic light tick** on place/clear (Capacitor Haptics) | Feels premium on phone |
| **Combo / clear banner** (“Double clear!”) | Makes scoring readable |
| **Ghost better + snap assist** near valid cells | Fewer misdrops |
| **Settings sheet** (SFX, haptics, how-to, credits) | Cleaner than header clutter |
| **Continue last run** (save board to storage) | Retention without accounts |
| **Subtle board “almost full row” hint** | Helps new players |

## P2 — Retention (evaluate before building)

| Feature | Notes |
|---------|-------|
| **Themes** (2–3 palettes) | Deferred from Phase 4; low risk cosmetic |
| **Achievements** (first clear, score milestones) | Local badges OK |
| **Weekly leaderboard seed** (local only first) | Avoid accounts initially |
| **Hard mode** (larger pieces / no undo) | Optional challenge |
| **Piece rotate** (tap to rotate) | Fun but changes balance — test carefully |

## P3 — Later / needs approval

| Feature | Notes |
|---------|-------|
| Special blocks / power-ups | High design cost |
| Cloud sync / accounts | Privacy + backend |
| Ads / rewarded undo refill | **Phase 7 — your approval required** |
| Analytics | **Phase 7 — your approval required** |
| iOS build | Phase 6 on macOS |

## Explicitly avoid for now

- Cloning another game’s exact UI/art
- Crowding the first screen with stats/promos
- Interrupting active drag with ads
- Adding libraries without a clear need

## Suggested next build (one milestone)

1. Settings sheet + haptics  
2. Combo clear banner  
3. Capture store screenshots  

Ask which of these you want implemented next.
