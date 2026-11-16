# Block Quest — Current Status

**Last updated:** 2026-11-16  
**Current phase:** Phase 9 — Release Preparation (**docs + brand/store graphics ready; no publish**)  
**Active milestone:** Capture real gameplay screenshots; complete Phase 8 device QA; await approval before any store upload

## Project state

- Phases 0–5 + Phase 8 automated QA in place
- Phase 6 iOS deferred (macOS); Phase 7 ads blocked
- Phase 9 store package drafted under `docs/store/` + `assets/store/`
- Unit tests **31/31**; build green

## Completed (Phase 9 this milestone)

- Store listing draft (`docs/store/STORE_LISTING.md`)
- Privacy policy draft (`docs/store/PRIVACY.md`)
- Screenshot capture guide (`docs/store/SCREENSHOTS.md`)
- Release build instructions (`docs/store/RELEASE_BUILDS.md`)
- Submission checklist (`docs/store/SUBMISSION_CHECKLIST.md`)
- Play feature graphic `assets/store/feature-graphic-1024x500.png`
- Screenshot folder placeholder `assets/store/screenshots/android/`

## Incomplete / next

1. Capture real gameplay screenshots into `assets/store/screenshots/android/`
2. Finish Phase 8 manual + Android device checklist
3. Replace privacy contact placeholders
4. Build signed AAB when Android SDK/keystore available
5. **Publish only after your explicit approval**

## Known bugs / limitations

- Gameplay screenshots not yet captured from a live session
- No Android SDK here → no release AAB produced
- Privacy contact still placeholder email
- Tray overflow for long pieces — **fixed** via `fitTrayCellSize` (refresh browser)

## Blockers / decisions needed

- Approve store submission when checklists are green
- Approve Phase 7 if/when ads or analytics are desired
