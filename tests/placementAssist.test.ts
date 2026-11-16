import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, EMPTY_CELL } from '../src/domain/constants';
import {
  findNearestValidOrigin,
  findNearCompleteHintCells,
} from '../src/domain/placementAssist';
import { createEmptyBoard } from '../src/domain/puzzleRules';
import type { PieceShape } from '../src/domain/types';

const mono: PieceShape = {
  id: 'mono',
  colorId: 1,
  cells: [{ x: 0, y: 0 }],
};

const domino: PieceShape = {
  id: 'domino',
  colorId: 2,
  cells: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
};

describe('snap assist', () => {
  it('returns rough origin when already valid', () => {
    const board = createEmptyBoard();
    expect(findNearestValidOrigin(board, mono, { x: 3, y: 3 }, 1)).toEqual({
      x: 3,
      y: 3,
    });
  });

  it('snaps to a nearby empty cell when rough is occupied', () => {
    const board = createEmptyBoard();
    board[2]![2] = 1;
    const snapped = findNearestValidOrigin(board, mono, { x: 2, y: 2 }, 1);
    expect(snapped).not.toBeNull();
    expect(snapped).not.toEqual({ x: 2, y: 2 });
    expect(Math.max(Math.abs(snapped!.x - 2), Math.abs(snapped!.y - 2))).toBeLessThanOrEqual(1);
  });

  it('returns null when nothing nearby fits a large piece', () => {
    const board = createEmptyBoard();
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        board[y]![x] = 1;
      }
    }
    expect(findNearestValidOrigin(board, domino, { x: 0, y: 0 }, 1)).toBeNull();
  });
});

describe('near-complete hints', () => {
  it('flags the single empty cell on a nearly full row', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (x !== 3) {
        board[1]![x] = 1;
      }
    }
    const hints = findNearCompleteHintCells(board, 1);
    expect(hints).toContainEqual({ x: 3, y: 1 });
  });

  it('does not hint empty boards', () => {
    const board = createEmptyBoard();
    expect(findNearCompleteHintCells(board, 1)).toEqual([]);
  });

  it('ignores rows with more empties than allowed', () => {
    const board = createEmptyBoard();
    board[0]![0] = EMPTY_CELL;
    board[0]![1] = 1;
    // row 0 has many empties
    expect(findNearCompleteHintCells(board, 1).some((c) => c.y === 0)).toBe(false);
  });
});
