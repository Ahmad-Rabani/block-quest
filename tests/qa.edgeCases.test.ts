import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BOARD_SIZE, EMPTY_CELL, TRAY_SIZE } from '../src/domain/constants';
import {
  allTrayUsed,
  canPlaceAnywhere,
  clearLines,
  createEmptyBoard,
  isGameOver,
  markTrayUsed,
  placePiece,
} from '../src/domain/puzzleRules';
import type { PieceShape, TrayPiece } from '../src/domain/types';
import { BoardManager, DEFAULT_UNDOS_PER_RUN } from '../src/game/systems/BoardManager';
import { StorageService } from '../src/services/StorageService';

const mono: PieceShape = {
  id: 'mono',
  colorId: 1,
  cells: [{ x: 0, y: 0 }],
};

const square: PieceShape = {
  id: 'sq',
  colorId: 2,
  cells: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
};

function fillExcept(board: ReturnType<typeof createEmptyBoard>, keep: Array<[number, number]>): void {
  const keepSet = new Set(keep.map(([x, y]) => `${x},${y}`));
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      board[y]![x] = keepSet.has(`${x},${y}`) ? EMPTY_CELL : 1;
    }
  }
}

describe('Phase 8 QA — rules edge cases', () => {
  it('clears a full board of complete rows without double-counting cells', () => {
    const board = createEmptyBoard();
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        board[y]![x] = 1;
      }
    }
    const { board: cleared, result } = clearLines(board);
    expect(result.linesCleared).toBe(BOARD_SIZE * 2); // 8 rows + 8 cols
    expect(result.clearedCells).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        expect(cleared[y]![x]).toBe(EMPTY_CELL);
      }
    }
  });

  it('does not declare game over when tray is empty (refill pending)', () => {
    const board = createEmptyBoard();
    expect(isGameOver(board, [])).toBe(false);
  });

  it('game over ignores used tray slots', () => {
    const board = createEmptyBoard();
    fillExcept(board, []); // full board
    const tray: TrayPiece[] = [
      { shape: mono, available: false },
      { shape: mono, available: false },
      { shape: mono, available: true },
    ];
    expect(isGameOver(board, tray)).toBe(true);
  });

  it('one unusable piece does not end the game if another still fits', () => {
    const board = createEmptyBoard();
    fillExcept(board, [[0, 0]]);
    const tray: TrayPiece[] = [
      { shape: square, available: true },
      { shape: mono, available: true },
      { shape: square, available: false },
    ];
    expect(canPlaceAnywhere(board, square)).toBe(false);
    expect(canPlaceAnywhere(board, mono)).toBe(true);
    expect(isGameOver(board, tray)).toBe(false);
  });

  it('markTrayUsed + allTrayUsed triggers refill condition', () => {
    let tray: TrayPiece[] = [
      { shape: mono, available: true },
      { shape: mono, available: true },
      { shape: mono, available: true },
    ];
    expect(tray).toHaveLength(TRAY_SIZE);
    tray = markTrayUsed(tray, 0);
    tray = markTrayUsed(tray, 1);
    tray = markTrayUsed(tray, 2);
    expect(allTrayUsed(tray)).toBe(true);
  });

  it('placePiece returns null for overlap and does not mutate input', () => {
    const board = createEmptyBoard();
    board[0]![0] = 9;
    const snapshot = board.map((r) => [...r]);
    const result = placePiece(board, { piece: mono, originX: 0, originY: 0 });
    expect(result).toBeNull();
    expect(board).toEqual(snapshot);
  });
});

describe('Phase 8 QA — BoardManager undo limits', () => {
  it('cannot undo more times than DEFAULT_UNDOS_PER_RUN', () => {
    const manager = new BoardManager(0);
    manager.restartClassic(0);

    let placements = 0;
    for (let attempt = 0; attempt < 40 && placements < DEFAULT_UNDOS_PER_RUN + 1; attempt++) {
      const tray = manager.getTray();
      outer: for (let i = 0; i < tray.length; i++) {
        if (!tray[i]?.available) {
          continue;
        }
        for (let y = 0; y < BOARD_SIZE; y++) {
          for (let x = 0; x < BOARD_SIZE; x++) {
            const outcome = manager.tryPlace(i, x, y);
            if (outcome.ok) {
              placements += 1;
              break outer;
            }
          }
        }
      }
    }

    expect(placements).toBeGreaterThanOrEqual(DEFAULT_UNDOS_PER_RUN);

    let undos = 0;
    while (manager.undo()) {
      undos += 1;
    }
    expect(undos).toBeLessThanOrEqual(DEFAULT_UNDOS_PER_RUN);
    expect(manager.canUndo()).toBe(false);
    expect(manager.undo()).toBe(false);
  });

  it('restart resets undo budget', () => {
    const manager = new BoardManager(0);
    manager.restartClassic(0);
    expect(manager.getUndosRemaining()).toBe(DEFAULT_UNDOS_PER_RUN);
  });
});

describe('Phase 8 QA — StorageService persistence', () => {
  const memory = new Map<string, string>();

  beforeEach(() => {
    memory.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
    });
  });

  it('persists classic best score and mute/tutorial flags', () => {
    const storage = new StorageService();
    expect(storage.getBestScore()).toBe(0);
    storage.setBestScore(42);
    expect(storage.getBestScore()).toBe(42);

    storage.setMuted(true);
    expect(storage.isMuted()).toBe(true);

    storage.setTutorialSeen(true);
    expect(storage.hasSeenTutorial()).toBe(true);
  });

  it('daily best only increases', () => {
    const storage = new StorageService();
    storage.setDailyBest('2026-11-16', 10);
    storage.setDailyBest('2026-11-16', 5);
    expect(storage.getDailyBest('2026-11-16')).toBe(10);
    storage.setDailyBest('2026-11-16', 25);
    expect(storage.getDailyBest('2026-11-16')).toBe(25);
  });

  it('rejects negative or non-finite best scores', () => {
    const storage = new StorageService();
    storage.setBestScore(-1);
    storage.setBestScore(Number.NaN);
    expect(storage.getBestScore()).toBe(0);
  });
});
