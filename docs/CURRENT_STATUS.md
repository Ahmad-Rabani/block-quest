# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 6 deferred (Windows) → Phase 9 brand assets started; Phase 8 QA next when ready  
**Active milestone:** Confirm you can see brand icon on boot / favicon; then Android Studio smoke test or Phase 8 QA

## Important: images

Previously there were **no custom Block Quest images**.  
Gameplay blocks are **drawn with Phaser Graphics** (not PNG sprites).  
Android had only **Capacitor default** icon/splash placeholders.

**Now added:**
- `assets/brand/` master icon + splash
- Android mipmap icons + splash drawables (Block Quest branded)
- Browser `public/favicon-32.png`, `icon-192.png`, apple-touch-icon
- Boot screen shows the brand icon

Regenerate with: `npm run assets:brand`

## Project state

- Phases 0–5 configured as before
- Phase 6 (iOS) **skipped on Windows** — needs macOS/Xcode
- Phase 7 still **blocked** without approval
- Phase 9 icon/splash assets **started**
- Unit tests **20/20**; see `docs/PHASES_GUIDE.md` for plain-language phase map

## Incomplete / next

1. Hard-refresh browser (`Ctrl+Shift+R`) — you should see brand icon on boot + tab favicon
2. Android Studio device/emulator smoke test (Phase 5 remainder)
3. Phase 8 QA checklist execution
4. Phase 6 only on a Mac later
5. Phase 7 only with your approval

## Known bugs / limitations

- No Android SDK on this machine → no emulator run yet
- In-game pieces are still vector-drawn (by design), not photo textures
- Store screenshots / privacy copy still Phase 9 remainder

## Blockers / decisions needed

- Approve starting Phase 8 QA now, or Android Studio install first?
- Phase 7 ads/analytics still require explicit approval
