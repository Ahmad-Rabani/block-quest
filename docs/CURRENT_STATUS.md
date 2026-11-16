# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 8 — Quality Assurance (**automated + checklist done; device matrix pending**)  
**Active milestone:** Manual browser checklist + Android Studio device smoke when SDK available; then finish Phase 9 store prep

## Project state

- Automated QA expanded: **31** unit tests passing
- Permanent manual checklist: `docs/QA_CHECKLIST.md`
- Phase 6 iOS deferred (Windows); Phase 7 ads blocked without approval
- Brand icons/splash present (Phase 9 partial)

## Completed this milestone (Phase 8)

- Edge-case tests: full-board clear uniqueness, game-over rules, tray refill condition, undo limits
- Storage persistence tests (best score, daily best, mute, tutorial)
- `docs/QA_CHECKLIST.md` sections A–G for browser / size / offline / Android / performance
- Verified: `npm test` 31/31, `npm run build` success

## Incomplete / next

1. You: walk through `docs/QA_CHECKLIST.md` sections B–D in the browser
2. Android Studio: section F when SDK is installed
3. Finish Phase 9 (screenshots, descriptions, privacy, release checklist)
4. Phase 6 on macOS later; Phase 7 only with approval

## Known bugs / limitations

- Device/emulator QA not run here (`ANDROID_HOME` missing)
- Low-end device + long soak tests not yet executed

## Blockers / decisions needed

- Confirm any checklist failures you find
- Approve Phase 7 only if you want ads/analytics
