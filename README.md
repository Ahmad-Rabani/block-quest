# Block Quest

Commercial 2D block puzzle for mobile (Android / iOS) with browser builds for development.

## Stack

- TypeScript (strict)
- Phaser 4.2.1
- Vite
- Vitest
- Capacitor 8 (later phases)

## Docs

Start with:

- `docs/PROJECT_OVERVIEW.md`
- `docs/CURRENT_STATUS.md`
- `docs/DEVELOPMENT_ROADMAP.md`

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Notes

- Domain logic lives in `src/domain/` and must not import Phaser.
- Do not push, publish, or add ads/analytics without explicit approval.
