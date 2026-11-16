# Block Quest — Phases Explained

This is the plain-language map of every development phase.  
**Source of truth for progress:** `docs/CURRENT_STATUS.md` and `docs/DEVELOPMENT_ROADMAP.md`.

---

## What you should see in the game today

| Expectation | Reality |
|-------------|---------|
| Custom Block Quest **app icon / splash** | Until Phase 9 assets are installed, Android still shows **Capacitor default** placeholders |
| Photo-like block **PNG/JPG art** | Blocks are **drawn in code** (Phaser Graphics), not loaded as image files |
| Ads / analytics | **Not added** — Phase 7 only after your approval |
| iOS app | **Not on Windows** — Phase 6 needs a Mac + Xcode |

---

## Phase overview

| Phase | Name | Purpose | Status (typical) |
|------:|------|---------|------------------|
| **0** | Foundation | Repo, docs, Vite, TypeScript, Phaser, tests | Done |
| **1** | Core engine | Rules: board, pieces, place, clear, score, game over | Done |
| **2** | Playable game | You can play in the browser | Done |
| **3** | UX polish | Animations, sound, mute, tutorial, better touch | Done |
| **4** | Retention | Undo, Daily challenge (themes/achievements deferred) | Partial |
| **5** | Android | Capacitor wrap, app id, back button, lifecycle | Configured; device test needs Android Studio |
| **6** | iOS | Same web game inside an iOS app | **Mac only — deferred on Windows** |
| **7** | Ads & analytics | Monetization / tracking | **Blocked until you approve** |
| **8** | QA | Edge cases, devices, interruptions, offline | Next after assets / when SDK available |
| **9** | Release prep | Icons, splash, store listing, privacy, builds | Icons/splash started when missing visuals are fixed |

---

## Phase 0 — Project Foundation

**Goal:** A stable project that any new chat can continue from files alone.

**Includes:** Cursor rules, documentation, Vite + TypeScript + Phaser + Vitest.

**Does not include:** Gameplay.

---

## Phase 1 — Core Game Engine

**Goal:** Correct puzzle rules that work without opening the game.

**Includes:** 8×8 board, piece shapes, valid placement, row/column clears, scoring, game over when *no* remaining piece fits.

**Does not include:** Graphics, touch, sound.

---

## Phase 2 — Playable Game

**Goal:** A browser MVP you can actually play.

**Includes:** Board + tray rendering, drag/drop, preview, score, game over, best score in local storage.

**Does not include:** Fancy polish or native apps.

---

## Phase 3 — Gameplay UX and Polish

**Goal:** Feel like a product, not a prototype.

**Includes:** Better picking, animations, SFX + mute, tutorial, safer layout on different screens.

---

## Phase 4 — Progression and Retention

**Goal:** Reasons to come back (without bloating the game).

**Shipped:** Undo (3/run), Daily challenge.

**Deferred on purpose:** Themes, special blocks, full achievements (higher cost, lower urgency before mobile).

---

## Phase 5 — Android Integration

**Goal:** Same game inside an Android app shell.

**Done:** Capacitor 8, `com.blockquest.game`, portrait lock, back button, pause/resume audio, sync scripts.

**Still needs you / Android Studio:** Run on emulator or a phone (`ANDROID_HOME`).

**Important:** Default Capacitor icon/splash are **not** Block Quest branding until Phase 9 assets replace them.

---

## Phase 6 — iOS Integration

**Goal:** iPhone/iPad app via Capacitor + Xcode.

**Why skipped on this PC:** Apple requires **macOS + Xcode**. We do **not** add an `ios/` project on Windows (project rule DEC-006).

**When:** Later on a Mac: `npx cap add ios`, open Xcode, test simulator/device.

---

## Phase 7 — Analytics and Monetization

**Goal:** Optional ads / analytics after the game is stable.

**Blocked** until you explicitly approve. No ads in active gameplay by policy.

---

## Phase 8 — Quality Assurance

**Goal:** Prove the game is solid before store submission.

**Includes:** Rules edge cases, touch, screen sizes, low-end devices, app interruptions, persistence, offline.

**Where to work:** `docs/QA_CHECKLIST.md` + `npm test`.  
Automated checks can pass while manual/device rows are still open.

---

## Phase 9 — Release Preparation

**Goal:** Store-ready packaging (still **no publish** without your OK).

**Includes:** Custom icons, splash screens, screenshots, descriptions, privacy text, release builds, checklist.

**Docs:** `docs/store/` · **Graphics:** `assets/store/`

---

## Recommended path on Windows right now

1. Capture gameplay screenshots (`docs/store/SCREENSHOTS.md`).
2. Finish Phase 8 manual + Android device QA.
3. Fill privacy contact placeholders; host privacy URL when ready.
4. Skip Phase 6 until you have a Mac.
5. Do **not** start Phase 7 unless you ask for ads/analytics.
6. Upload to stores **only** after you explicitly approve.
