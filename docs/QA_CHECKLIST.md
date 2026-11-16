# Block Quest — QA Checklist (Phase 8)

Use this for manual / device verification. Automated unit tests cover rules and persistence; they do **not** replace device smoke tests.

**Last updated:** 2026-11-16  
**Automated suite:** `npm test`  
**Build:** `npm run build`

Mark each item: `[ ]` pending · `[x]` pass · `[!]` fail (note bug)

---

## A. Automated (run every milestone)

- [ ] `npm test` — all tests pass
- [ ] `npm run build` — TypeScript + Vite succeed
- [ ] `npm run cap:sync` — completes without error (when touching native)

---

## B. Game rules (browser)

- [ ] Place pieces only on empty in-bounds cells
- [ ] Invalid drop returns piece to tray
- [ ] Completing a row clears it
- [ ] Completing a column clears it
- [ ] Completing row + column together clears intersection once
- [ ] Score increases for blocks + line bonuses
- [ ] Combo increases only on consecutive clears
- [ ] Game over only when **no remaining available piece** fits
- [ ] After using all 3 tray pieces, a new set of 3 appears
- [ ] Undo restores board/tray/score and decrements remaining undos
- [ ] Cannot undo more than 3 times per run
- [ ] App opens to menu (Classic / Daily / locked Multiplayer), not straight into play
- [ ] TOP SCORE shows on menu; Classic/Daily bests listed
- [ ] Classic / Daily from menu starts a fresh run
- [ ] Continue appears on menu when a mid-run save exists
- [ ] Daily best persists separately from classic best
- [ ] Best score persists after browser refresh
- [ ] Mute persists after refresh
- [ ] Tutorial shows once, then stays dismissed
- [ ] Game over Menu returns to the pre-game hub

---

## C. Interaction / UX

- [ ] Tray slots are easy to grab (mouse)
- [ ] Tray slots are easy to grab (touch, if available)
- [ ] Drag lift keeps piece visible above finger/cursor
- [ ] Placement preview shows valid vs invalid
- [ ] Line-clear animation plays
- [ ] Score floater appears on clears
- [ ] Modals (tutorial / game over) are centered and readable
- [ ] Board and tray alignment look even on portrait frame

---

## D. Screen sizes (browser DevTools)

- [ ] 390×844 (design portrait)
- [ ] 360×740 (small phone)
- [ ] 430×932 (large phone)
- [ ] Narrow desktop window (FIT scale, no broken layout)
- [ ] Safe-area / notched framing does not clip controls (CSS)

---

## E. Interruptions & offline

- [ ] Refresh mid-game: best/mute/tutorial flags survive; current board does not need to (session play)
- [ ] Mute On → background tab → return: no crash; mute preference kept
- [ ] Airplane / offline: game still playable (no network required for core loop)
- [ ] Android back (device): dismisses tutorial/settings; from play returns to menu

---

## F. Android device / emulator (requires SDK)

- [ ] App launches with Block Quest icon (not Capacitor default)
- [ ] Splash shows Block Quest branding
- [ ] Portrait locked
- [ ] Touch drag/drop works
- [ ] Audio plays; mute works
- [ ] Pause app (home) then resume: no freeze; audio policy OK
- [ ] Back button behavior matches E
- [ ] Offline play works on device

---

## G. Performance smoke

- [ ] 2–3 minute play session: no obvious stutter on clear animations
- [ ] No console errors during normal play
- [ ] Memory does not climb unboundedly during repeated restarts (spot check)

---

## Results log

| Date | Tester | Environment | Result | Notes |
|------|--------|-------------|--------|-------|
| 2026-11-16 | Agent | Node unit + Vite build | Automated A pass | Device F blocked (no ANDROID_HOME) |
| 2026-11-16 | Agent | Mobile CSS + visualViewport | Framing polish | Redeploy Vercel to verify phones |
