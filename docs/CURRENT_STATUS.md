# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 9 screenshots captured; Android Studio install in progress → device QA next  
**Active milestone:** Finish Android Studio setup → device smoke test → privacy URL → signed AAB

## Project state

- Boot → **MenuScene** → GameScene; Play Store path docs ready
- Store screenshots generated (1080×1920) under `assets/store/screenshots/android/`
- Android Studio installer was observed running; **ANDROID_HOME** still unset until SDK install finishes
- Phase 6 iOS deferred; Phase 7 ads blocked without approval

## Completed this milestone

- `?storeShot=` demo routes for menu / play / daily / gameover
- `npm run store:shots` (Playwright) → `01-menu` … `04-game-over` PNGs
- Mobile framing + Capacitor sync from prior step

## Incomplete / next

1. **You:** Finish Android Studio setup + set `ANDROID_HOME`, then section F of `docs/QA_CHECKLIST.md`
2. Replace privacy placeholders + host privacy URL
3. Produce signed release AAB (`docs/store/RELEASE_BUILDS.md`)
4. Optional: more shots (drag preview / line clear) if Play listing wants 6–8
5. **Publish only after explicit approval**

## How to verify new features

1. Hard-refresh Vercel/mobile — game should fill the phone frame (no floating card)
2. Rotate / show-hide browser chrome — layout should re-fit without clipping
3. Menu → Classic/Daily still works after redeploy

## Known limitations

- Device QA (Phase 5/8 F) blocked until Android SDK is installed
- Store screenshots folder is empty (placeholder only)
- Privacy contact still placeholders
- Multiplayer locked; haptics no-op on desktop browser
