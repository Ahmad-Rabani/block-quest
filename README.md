# Block Quest

Commercial 2D block puzzle for mobile (Android / iOS) with browser builds for development.

## Stack

- TypeScript (strict)
- Phaser 4.2.1
- Vite
- Vitest
- Capacitor 8.6 (Android; iOS deferred to macOS)

## Docs

Start with:

- `docs/PROJECT_OVERVIEW.md`
- `docs/CURRENT_STATUS.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/ANDROID.md` (Phase 5)

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run cap:sync          # web build + sync Android
npm run cap:open:android  # open in Android Studio
```

## Notes

- Domain logic lives in `src/domain/` and must not import Phaser.
- App ID: `com.blockquest.game`
- Do not push, publish, or add ads/analytics without explicit approval.
- iOS native project is not created on Windows.
