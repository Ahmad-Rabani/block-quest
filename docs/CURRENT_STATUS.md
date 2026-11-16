# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Pre-game menu hub shipped; Phase 9 release / Phase 8 device QA still open  
**Active milestone:** Store screenshots + Android device smoke test, or optional P2 features

## Project state

- Boot → **MenuScene** (mode select) → GameScene
- Full P1 pack + menu hub: Classic / Daily / locked Multiplayer, top score, continue from menu
- Phase 6 iOS deferred; Phase 7 ads blocked without approval

## Completed this milestone

- `MenuScene` pre-game hub with block backdrop, TOP SCORE, Classic / Daily / locked Multiplayer
- Continue last run offered on the menu (not mid-game popup)
- In-game Classic/Daily header toggles removed; mode label only
- Game over → Play Again or Menu; Android back returns to menu

## Incomplete / next

1. Capture gameplay screenshots (`docs/store/SCREENSHOTS.md`)
2. Android Studio device QA (`docs/QA_CHECKLIST.md` section F)
3. Privacy contact + signed AAB when ready
4. Optional P2: themes / achievements / hard mode / rotate
5. Multiplayer (currently locked on menu)
6. **Publish only after explicit approval**

## How to verify new features

1. Hard-refresh the browser — menu appears before play
2. Confirm TOP SCORE + Classic / Daily / locked Multiplayer
3. Start Classic or Daily from the menu
4. Place pieces, refresh — **Continue** appears on the menu

## Known limitations

- Multiplayer is locked (placeholder only)
- Continue ignores expired Daily runs from a previous calendar day
- Haptics still no-op on desktop browser
