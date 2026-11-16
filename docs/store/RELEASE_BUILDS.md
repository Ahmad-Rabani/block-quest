# Block Quest — Release Builds

**Never upload to Play Console / App Store without explicit approval.**

## Prerequisites (Android)

1. Android Studio + SDK (`ANDROID_HOME` set)
2. A Play App Signing / upload keystore (**do not commit keystores**)
3. Latest web assets synced

### First-time Android Studio setup (Windows)

1. Install [Android Studio](https://developer.android.com/studio)
2. Open SDK Manager → install a recent **Android SDK** + a system image (e.g. API 34)
3. Set environment variable (User or System):
   - `ANDROID_HOME` = e.g. `C:\Users\<you>\AppData\Local\Android\Sdk`
   - Add `%ANDROID_HOME%\platform-tools` to `PATH`
4. Restart the terminal / Cursor, then verify: `adb version`
5. From this repo: `npm run cap:sync` then `npm run cap:open:android`
6. Run on emulator or USB device (enable USB debugging)

## Build web + sync

```bash
npm ci
npm test
npm run build
npx cap sync android
```

## Generate a release App Bundle (AAB)

In Android Studio:

1. Open `android/`
2. **Build → Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Sign with your upload key
5. Output typically under `android/app/release/`

Or with Gradle (from `android/`):

```bash
./gradlew bundleRelease
```

(On Windows: `gradlew.bat bundleRelease`)

## Versioning

Keep these in sync before each candidate:

| Field | Current |
|-------|---------|
| `package.json` version | `0.1.0` |
| Android `versionName` | `0.1.0` |
| Android `versionCode` | `1` (increment every Play upload) |

Edit `android/app/build.gradle` → `defaultConfig`.

## Signing secrets

- Store keystore **outside** the repo (or in a secure secrets store)
- Add paths only via `android/keystore.properties` that is **gitignored**
- Never commit `.jks` / `.keystore` / passwords

## Smoke test the release build

Install the release artifact on a device/emulator and verify:

- Launch icon + splash
- One full game + Daily switch
- Undo / mute / best score persistence
- Offline play
- Back button behavior

## iOS

Deferred to Phase 6 on macOS (Xcode Archive). Do not create `ios/` on Windows.
