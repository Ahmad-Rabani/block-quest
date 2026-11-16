import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, EMPTY_CELL } from '../src/domain/constants';
import { clearLines, createEmptyBoard, findCompletedLines } from '../src/domain/puzzleRules';

function fillRow(board: ReturnType<typeof createEmptyBoard>, y: number, value = 1): void {
  for (let x = 0; x < BOARD_SIZE; x++) {
    board[y]![x] = value;
  }
}

function fillCol(board: ReturnType<typeof createEmptyBoard>, x: number, value = 1): void {
  for (let y = 0; y < BOARD_SIZE; y++) {
    board[y]![x] = value;
  }
}

describe('line clearing', () => {
  it('detects a complete horizontal row', () => {
    const board = createEmptyBoard();
    fillRow(board, 3);
    const result = findCompletedLines(board);
    expect(result.rows).toEqual([3]);
    expect(result.columns).toEqual([]);
    expect(result.linesCleared).toBe(1);
    expect(result.clearedCells).toHaveLength(BOARD_SIZE);
  });

  it('detects a complete vertical column', () => {
    const board = createEmptyBoard();
    fillCol(board, 5);
    const result = findCompletedLines(board);
    expect(result.columns).toEqual([5]);
    expect(result.rows).toEqual([]);
    expect(result.linesCleared).toBe(1);
  });

  it('clears intersecting row and column with unique cells only', () => {
    const board = createEmptyBoard();
    fillRow(board, 2);
    fillCol(board, 4);
    const result = findCompletedLines(board);
    expect(result.rows).toEqual([2]);
    expect(result.columns).toEqual([4]);
    expect(result.linesCleared).toBe(2);
    // 8 + 8 - 1 intersection
    expect(result.clearedCells).toHaveLength(15);

    const { board: cleared } = clearLines(board);
    for (let x = 0; x < BOARD_SIZE; x++) {
      expect(cleared[2]![x]).toBe(EMPTY_CELL);
    }
    for (let y = 0; y < BOARD_SIZE; y++) {
      expect(cleared[y]![4]).toBe(EMPTY_CELL);
    }
  });

  it('clears multiple rows and columns simultaneously', () => {
    const board = createEmptyBoard();
    fillRow(board, 0);
    fillRow(board, 1);
    fillCol(board, 0);
    fillCol(board, 1);
    const result = findCompletedLines(board);
    expect(result.linesCleared).toBe(4);
    // 8+8+8+8 - intersections: two rows and two cols share 4 cells
    expect(result.clearedCells).toHaveLength(28);
  });

  it('does nothing when no lines are complete', () => {
    const board = createEmptyBoard();
    board[0]![0] = 1;
    const { board: next, result } = clearLines(board);
    expect(result.linesCleared).toBe(0);
    expect(next[0]![0]).toBe(1);
  });
});
