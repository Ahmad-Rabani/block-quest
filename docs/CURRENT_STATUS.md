# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 8/9 release readiness — mobile web polish done; device QA blocked on Android SDK  
**Active milestone:** Install Android Studio → device smoke test → store screenshots → signed AAB

## Project state

- Boot → **MenuScene** → GameScene; Play Store path docs ready
- Mobile browser framing improved (`100dvh` + `visualViewport` resize sync)
- Android project present (`com.blockquest.game`); **ANDROID_HOME unset** on this machine
- Phase 6 iOS deferred; Phase 7 ads blocked without approval

## Completed this milestone

- Full-bleed phone framing for Vercel/mobile browsers
- Viewport resize/orientation refresh so FIT scale tracks the visible area
- Android Studio first-time setup steps in `docs/store/RELEASE_BUILDS.md`
- Screenshot capture naming guide updated
- Capacitor web assets sync when build succeeds

## Incomplete / next

1. **You:** Install Android Studio + set `ANDROID_HOME`, then run section F of `docs/QA_CHECKLIST.md`
2. Capture gameplay screenshots into `assets/store/screenshots/android/`
3. Replace privacy placeholders (`support@example.com`, publisher name) + host privacy URL
4. Produce signed release AAB (`docs/store/RELEASE_BUILDS.md`)
5. Optional P2 / Multiplayer later
6. **Publish only after explicit approval**

## How to verify new features

1. Hard-refresh Vercel/mobile — game should fill the phone frame (no floating card)
2. Rotate / show-hide browser chrome — layout should re-fit without clipping
3. Menu → Classic/Daily still works after redeploy

## Known limitations

- Device QA (Phase 5/8 F) blocked until Android SDK is installed
- Store screenshots folder is empty (placeholder only)
- Privacy contact still placeholders
- Multiplayer locked; haptics no-op on desktop browser
