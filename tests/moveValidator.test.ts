import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from '../src/domain/constants';
import {
  canPlace,
  canPlaceAnywhere,
  createEmptyBoard,
  isGameOver,
  placePiece,
} from '../src/domain/puzzleRules';
import type { PieceShape, TrayPiece } from '../src/domain/types';
import { MoveValidator } from '../src/game/systems/MoveValidator';

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

describe('MoveValidator / placement', () => {
  it('allows placement on empty cells inside bounds', () => {
    const board = createEmptyBoard();
    expect(canPlace(board, { piece: mono, originX: 0, originY: 0 })).toBe(true);
    expect(canPlace(board, { piece: square, originX: 6, originY: 6 })).toBe(true);
  });

  it('rejects out-of-bounds placement', () => {
    const board = createEmptyBoard();
    expect(canPlace(board, { piece: square, originX: 7, originY: 7 })).toBe(false);
    expect(canPlace(board, { piece: mono, originX: -1, originY: 0 })).toBe(false);
    expect(canPlace(board, { piece: mono, originX: BOARD_SIZE, originY: 0 })).toBe(false);
  });

  it('rejects overlapping occupied cells', () => {
    const board = createEmptyBoard();
    const placed = placePiece(board, { piece: mono, originX: 2, originY: 2 });
    expect(placed).not.toBeNull();
    expect(canPlace(placed!, { piece: mono, originX: 2, originY: 2 })).toBe(false);
  });

  it('MoveValidator mirrors domain canPlace', () => {
    const validator = new MoveValidator();
    const board = createEmptyBoard();
    expect(validator.canPlace(board, { piece: mono, originX: 3, originY: 3 })).toBe(true);
    expect(validator.canPlaceAnywhere(board, square)).toBe(true);
  });

  it('detects when a piece cannot fit anywhere', () => {
    const board = createEmptyBoard();
    // Fill entire board
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        board[y]![x] = 1;
      }
    }
    expect(canPlaceAnywhere(board, mono)).toBe(false);
  });

  it('game over only when all remaining pieces cannot fit', () => {
    const board = createEmptyBoard();
    // Leave only one empty cell — mono fits, square does not.
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        board[y]![x] = 1;
      }
    }
    board[0]![0] = 0;

    const trayBoth: TrayPiece[] = [
      { shape: mono, available: true },
      { shape: square, available: true },
      { shape: square, available: false },
    ];
    expect(isGameOver(board, trayBoth)).toBe(false);

    const traySquareOnly: TrayPiece[] = [
      { shape: square, available: true },
      { shape: square, available: true },
      { shape: square, available: false },
    ];
    expect(isGameOver(board, traySquareOnly)).toBe(true);
  });
});
