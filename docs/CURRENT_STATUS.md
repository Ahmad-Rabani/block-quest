# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** P1 gameplay polish **complete**; Phase 9 release / Phase 8 device QA still open  
**Active milestone:** Store screenshots + Android device smoke test, or optional P2 features

## Project state

- Full P1 pack shipped: settings, haptics, clear banners, snap assist, continue run, near-complete hints
- Unit tests **43/43**
- Phase 6 iOS deferred; Phase 7 ads blocked without approval

## Completed this milestone

- Snap assist (`findNearestValidOrigin`, radius 1)
- Almost-full line hints (orange soft cells)
- Continue last run (localStorage snapshot + Continue/New Game modal)
- Tests: `placementAssist.test.ts`, `runSnapshot.test.ts`

## Incomplete / next

1. Capture gameplay screenshots (`docs/store/SCREENSHOTS.md`)
2. Android Studio device QA (`docs/QA_CHECKLIST.md` section F)
3. Privacy contact + signed AAB when ready
4. Optional P2: themes / achievements / hard mode / rotate
5. **Publish only after explicit approval**

## How to verify new features

1. Hard-refresh the browser
2. Drag slightly off a valid cell — preview should snap
3. Nearly fill a row — empty cell shows soft orange hint
4. Place a few pieces, refresh — **Continue?** prompt appears

## Known limitations

- Snap radius is 1 cell (intentional, not magnetic across the board)
- Continue ignores expired Daily runs from a previous calendar day
- Haptics still no-op on desktop browser
