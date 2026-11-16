# Block Quest — Architecture

## Layering

```
src/
  domain/          # Pure game rules — NO Phaser imports
  game/            # Phaser integration, scenes, views, systems wiring
  services/        # Platform services (storage, later audio, etc.)
  styles/          # Global CSS
  main.ts          # Bootstrap
tests/             # Vitest unit tests for domain / pure logic
```

### Domain Layer (`src/domain/`)

| File | Responsibility |
|------|----------------|
| `types.ts` | Shared types: board, cell, piece shape, placement, score events |
| `constants.ts` | Board size, scoring table, palette tokens used by logic |
| `puzzleRules.ts` | Placement validation, line detection/clear, available-move checks, scoring helpers |

Domain rules must be callable from Vitest without a browser or Phaser.

### Game Layer (`src/game/`)

| Area | Responsibility |
|------|----------------|
| `config/gameConfig.ts` | Phaser game config (size, scale, scenes) |
| `scenes/` | BootScene, GameScene |
| `systems/` | Orchestration wrapping domain: BoardManager, PieceGenerator, MoveValidator, LineClearSystem, ScoreManager |
| `objects/` | PieceView, BoardView — Phaser display objects |

Systems may call domain functions. Views must not contain game-rule logic.

### Services (`src/services/`)

| File | Responsibility |
|------|----------------|
| `StorageService.ts` | Best-score persistence via localStorage (browser / Capacitor WebView) |

## Data Flow (Placement)

1. Player drags/taps a piece (PieceView / GameScene input).
2. Preview: MoveValidator + domain `canPlace`.
3. On drop/confirm: domain placement → board update → line clear → score update → refill pieces if needed → game-over check.
4. Views re-render from updated state.

## Testing Strategy

- Unit tests target domain and pure systems under `tests/`.
- Do not require Phaser boot for rule tests.
- Manual browser verification for rendering and touch after playable milestones.

## Future Native (Phases 5–6)

Capacitor wraps the same web build. Domain and most game code stay unchanged. iOS native project is created only on macOS.
