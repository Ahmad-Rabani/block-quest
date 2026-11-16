# Block Quest — Android (Phase 5)

## Identity

| Field | Value |
|-------|-------|
| App ID | `com.blockquest.game` |
| App name | Block Quest |
| Orientation | Portrait (locked in AndroidManifest) |
| Web assets | Vite `dist/` synced via Capacitor |

## Prerequisites (Windows)

1. JDK 17+ recommended for Android Gradle (JDK 23 may work; prefer 17 LTS if builds fail)
2. Android Studio with Android SDK
3. Set `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) to your SDK path
4. An emulator AVD or a USB-debuggable device

## Commands

```bash
npm install
npm run cap:sync          # build web + sync into android/
npm run cap:open:android  # open Android Studio
```

In Android Studio: Run on emulator or device.

## Offline / lifecycle

- Gameplay and persistence use localStorage only — works offline in the WebView.
- `@capacitor/app` handles:
  - **Back button:** dismisses tutorial overlay; otherwise minimizes the app
  - **App pause/resume:** suspends/resumes audio output without changing mute preference

## Not in this phase

- iOS project (macOS / Phase 6)
- Store signing / Play Console upload
- Ads or analytics
