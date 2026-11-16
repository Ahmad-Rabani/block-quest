# Block Quest — Screenshot Guide

**Do not upload store assets without approval.**  
Capture real gameplay frames; keep brand colors consistent (`#F4F2FA`, `#6545D6`, `#42A5F5`, `#FF9B54`).

## Folder

Save captures here (create as needed):

```
assets/store/screenshots/
  android/
  ios/          # later on macOS
```

## Google Play (phone) — recommended set

Capture **portrait** frames. Useful minimum set (4–8):

| # | Shot | What to show |
|---|------|--------------|
| 1 | Hero board | Mid-game board with colorful blocks + score chips |
| 2 | Drag / preview | Piece lifted with valid placement preview |
| 3 | Line clear | Moment of clear feedback / score floater |
| 4 | Tray focus | Three tray pieces in the bottom panel |
| 5 | Daily mode | Daily selected + board in progress |
| 6 | Game over | Game Over modal with score / Play Again |

### Size targets (Play Console)

- Phone: commonly **1080 × 1920** (or other accepted portrait sizes in current Play Console docs)
- Keep UI readable; avoid browser chrome if possible

## How to capture (browser)

1. `npm run dev` (or use the Vercel deploy on a phone)
2. Open DevTools → device toolbar → **390×844** (or 1080×1920 scaled)
3. Hide DevTools overlay if it appears in the shot
4. Capture from the menu hub, mid-game board, clear feedback, and game over
5. Crop to the game canvas only (no browser URL bar)
6. Save as PNG into `assets/store/screenshots/android/` using names like:
   - `01-menu.png`, `02-classic-play.png`, `03-drag-preview.png`,
     `04-line-clear.png`, `05-daily.png`, `06-game-over.png`

## How to capture (Android)

1. `npm run cap:sync` → run on emulator/device
2. Use emulator camera / `adb exec-out screencap`
3. Prefer clean status bar when possible

## Feature graphic (Play)

- Size: **1024 × 500**
- Source idea: brand splash colors + “BLOCK QUEST” wordmark + a few blocks
- File suggestion: `assets/store/feature-graphic-1024x500.png` *(create before submit)*

## Checklist before upload

- [ ] No debug text / FPS counters
- [ ] No competitor branding
- [ ] No personal data visible
- [ ] Portrait orientation matches the app
- [ ] Text is sharp at phone size
