# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 5 — Android Integration (**configured; device/emulator QA pending SDK**)  
**Active milestone:** Install Android SDK / Studio and run on emulator or device; or proceed to Phase 6 on macOS later

## Project state

- Capacitor **8.6.2** integrated; Android platform at `android/`
- App ID: `com.blockquest.game` (portrait locked)
- Native lifecycle: back button + pause/resume audio via `@capacitor/app`
- Web build + `cap sync` verified; unit tests **20/20**
- This machine has **no `ANDROID_HOME` / Android SDK** — emulator and physical-device runs not executed here

## Completed

### Phases 0–4
- Foundation, engine, playable MVP, UX polish, Undo + Daily (see changelog)

### Phase 5 (this session)
- Capacitor core/cli/android/app installed
- `capacitor.config.ts` + `docs/ANDROID.md`
- `android/` project generated and synced
- Portrait orientation, versionName `0.1.0`
- `NativeLifecycleService` (back button, app state)
- npm scripts: `cap:sync`, `cap:open:android`
- **Not done here:** emulator/device smoke test (SDK missing)

## Incomplete / next

1. On a machine with Android Studio/SDK: `npm run cap:sync` → Run on emulator/device → verify touch, offline, back, lifecycle
2. Phase 6 iOS on macOS when ready
3. Phase 7 ads/analytics only with explicit approval
4. Phase 8 full QA matrix

## Known bugs / limitations

- Emulator/device verification blocked without Android SDK on this Windows environment
- Default Capacitor launcher icons (store icons later in Phase 9)
- INTERNET permission present (WebView); gameplay itself is offline

## Blockers / decisions needed

- Confirm Android Studio/SDK path for local device testing
- Whether to continue with Phase 6 (macOS) or Phase 8 QA next
