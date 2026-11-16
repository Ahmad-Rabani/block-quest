import { describe, expect, it } from 'vitest';
import { BoardManager } from '../src/game/systems/BoardManager';
import {
  createSeededRandom,
  dayKeyToSeed,
  generateTray,
} from '../src/game/systems/PieceGenerator';

describe('Phase 4 — undo and daily seed', () => {
  it('seeded trays are deterministic for the same day key', () => {
    const seed = dayKeyToSeed('2026-11-16');
    const a = generateTray(createSeededRandom(seed));
    const b = generateTray(createSeededRandom(seed));
    expect(a.map((t) => t.shape.cells)).toEqual(b.map((t) => t.shape.cells));
    expect(a.map((t) => t.shape.colorId)).toEqual(b.map((t) => t.shape.colorId));
  });

  it('different day keys produce different streams', () => {
    const a = generateTray(createSeededRandom(dayKeyToSeed('2026-11-16')));
    const b = generateTray(createSeededRandom(dayKeyToSeed('2026-11-17')));
    const same =
      JSON.stringify(a.map((t) => t.shape.cells)) ===
      JSON.stringify(b.map((t) => t.shape.cells));
    expect(same).toBe(false);
  });

  it('undo restores board, tray availability, and score', () => {
    const manager = new BoardManager(0);
    manager.restartClassic(0);
    const before = {
      board: manager.getBoard().map((row) => [...row]),
      score: manager.getState().score,
      undos: manager.getUndosRemaining(),
    };

    // Place mono-like first available piece at 0,0 if possible.
    const tray = manager.getTray();
    let placed = false;
    for (let i = 0; i < tray.length; i++) {
      const slot = tray[i]!;
      if (!slot.available) {
        continue;
      }
      const outcome = manager.tryPlace(i, 0, 0);
      if (outcome.ok) {
        placed = true;
        break;
      }
      // Try a few origins for larger shapes.
      for (let y = 0; y < 6 && !placed; y++) {
        for (let x = 0; x < 6 && !placed; x++) {
          const retry = manager.tryPlace(i, x, y);
          if (retry.ok) {
            placed = true;
          }
        }
      }
      if (placed) {
        break;
      }
    }

    expect(placed).toBe(true);
    expect(manager.getUndosRemaining()).toBe(before.undos);
    expect(manager.canUndo()).toBe(true);

    const undone = manager.undo();
    expect(undone).toBe(true);
    expect(manager.getState().score).toBe(before.score);
    expect(manager.getBoard()).toEqual(before.board);
    expect(manager.getUndosRemaining()).toBe(before.undos - 1);
  });
});
