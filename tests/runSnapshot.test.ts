import { describe, expect, it } from 'vitest';
import { BoardManager } from '../src/game/systems/BoardManager';
import { boardHasProgress, isRunSnapshot } from '../src/game/systems/runSnapshot';
import { createEmptyBoard } from '../src/domain/puzzleRules';

describe('run snapshot continue', () => {
  it('round-trips board score and undos through export/restore', () => {
    const manager = new BoardManager(0);
    manager.restartClassic(0);

    let placed = false;
    const tray = manager.getTray();
    for (let i = 0; i < tray.length && !placed; i++) {
      for (let y = 0; y < 8 && !placed; y++) {
        for (let x = 0; x < 8 && !placed; x++) {
          const outcome = manager.tryPlace(i, x, y);
          if (outcome.ok) {
            placed = true;
          }
        }
      }
    }
    expect(placed).toBe(true);

    const snap = manager.exportRunSnapshot();
    expect(isRunSnapshot(snap)).toBe(true);
    expect(boardHasProgress(snap.board)).toBe(true);

    const other = new BoardManager(0);
    other.restartClassic(0);
    other.restoreRunSnapshot(snap);
    expect(other.getState().score).toBe(snap.score);
    expect(other.getUndosRemaining()).toBe(snap.undosRemaining);
    expect(other.getBoard()).toEqual(snap.board);
  });

  it('boardHasProgress is false for empty board', () => {
    expect(boardHasProgress(createEmptyBoard())).toBe(false);
  });
});
