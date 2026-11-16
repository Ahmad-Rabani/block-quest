# Block Quest — Improvement & Feature Backlog

Prioritized for a commercial mobile puzzle. Do **not** implement everything at once — pick by value vs complexity.

## P0 — Fix / polish now (quality)

| Item | Why | Status |
|------|-----|--------|
| Tray pieces fit inside slots | Prevents overflow | Done |
| Clearer mute → Menu/settings | Cleaner header | Done |
| Real gameplay screenshots | Needed for store | Open |
| Android device smoke test | Phase 5/8 remaining | Open |

## P1 — High value, medium effort

| Feature | Status |
|---------|--------|
| **Haptic light tick** on place/clear | **Done** (`HapticsService` + Settings toggle) |
| **Combo / clear banner** | **Done** (`showClearBanner`) |
| **Settings sheet** (SFX, haptics, how-to, credits) | **Done** (Menu) |
| **Ghost better + snap assist** near valid cells | Open |
| **Continue last run** (save board to storage) | Open |
| **Subtle board “almost full row” hint** | Open |

## P2 — Retention (evaluate before building)

| Feature | Notes |
|---------|-------|
| **Themes** (2–3 palettes) | Deferred from Phase 4 |
| **Achievements** | Local badges OK |
| **Weekly leaderboard seed** | Local only first |
| **Hard mode** | Optional challenge |
| **Piece rotate** | Test balance carefully |

## P3 — Later / needs approval

| Feature | Notes |
|---------|-------|
| Special blocks / power-ups | High design cost |
| Cloud sync / accounts | Privacy + backend |
| Ads / rewarded undo refill | Phase 7 approval |
| Analytics | Phase 7 approval |
| iOS build | Phase 6 on macOS |

## Suggested next build

1. Snap assist + almost-full-line hints  
2. Continue last run  
3. Capture store screenshots + Android device QA  
