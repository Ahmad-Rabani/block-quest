import { BOARD_SIZE, EMPTY_CELL, SCORING, TRAY_SIZE } from './constants';
import type {
  BoardGrid,
  Coord,
  GameState,
  LineClearResult,
  PieceShape,
  Placement,
  ScoreBreakdown,
  TrayPiece,
} from './types';

export function createEmptyBoard(size: number = BOARD_SIZE): BoardGrid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => EMPTY_CELL));
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => [...row]);
}

export function pieceCellsAt(placement: Placement): Coord[] {
  return placement.piece.cells.map((c) => ({
    x: placement.originX + c.x,
    y: placement.originY + c.y,
  }));
}

export function isInsideBoard(x: number, y: number, size: number = BOARD_SIZE): boolean {
  return x >= 0 && y >= 0 && x < size && y < size;
}

/** True when every cell of the shape fits and lands on empty cells. */
export function canPlace(board: BoardGrid, placement: Placement): boolean {
  const size = board.length;
  for (const cell of pieceCellsAt(placement)) {
    if (!isInsideBoard(cell.x, cell.y, size)) {
      return false;
    }
    if (board[cell.y]![cell.x] !== EMPTY_CELL) {
      return false;
    }
  }
  return true;
}

/** Returns a new board with the piece stamped, or null if invalid. */
export function placePiece(board: BoardGrid, placement: Placement): BoardGrid | null {
  if (!canPlace(board, placement)) {
    return null;
  }
  const next = cloneBoard(board);
  const color = placement.piece.colorId;
  for (const cell of pieceCellsAt(placement)) {
    next[cell.y]![cell.x] = color;
  }
  return next;
}

export function findCompletedLines(board: BoardGrid): LineClearResult {
  const size = board.length;
  const rows: number[] = [];
  const columns: number[] = [];

  for (let y = 0; y < size; y++) {
    if (board[y]!.every((v) => v !== EMPTY_CELL)) {
      rows.push(y);
    }
  }

  for (let x = 0; x < size; x++) {
    let full = true;
    for (let y = 0; y < size; y++) {
      if (board[y]![x] === EMPTY_CELL) {
        full = false;
        break;
      }
    }
    if (full) {
      columns.push(x);
    }
  }

  const clearedSet = new Set<string>();
  const clearedCells: Coord[] = [];

  for (const y of rows) {
    for (let x = 0; x < size; x++) {
      const key = `${x},${y}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ x, y });
      }
    }
  }

  for (const x of columns) {
    for (let y = 0; y < size; y++) {
      const key = `${x},${y}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ x, y });
      }
    }
  }

  return {
    rows,
    columns,
    clearedCells,
    linesCleared: rows.length + columns.length,
  };
}

/** Clears completed rows and columns simultaneously; intersecting cells once. */
export function clearLines(board: BoardGrid): { board: BoardGrid; result: LineClearResult } {
  const result = findCompletedLines(board);
  if (result.clearedCells.length === 0) {
    return { board: cloneBoard(board), result };
  }
  const next = cloneBoard(board);
  for (const cell of result.clearedCells) {
    next[cell.y]![cell.x] = EMPTY_CELL;
  }
  return { board: next, result };
}

export function scorePlacement(
  blocksPlaced: number,
  linesCleared: number,
  comboBefore: number,
): { breakdown: ScoreBreakdown; comboAfter: number } {
  const placementPoints = blocksPlaced * SCORING.pointsPerBlock;

  let linePoints = 0;
  if (linesCleared > 0) {
    if (linesCleared <= 4) {
      linePoints = SCORING.linePoints[linesCleared] ?? 0;
    } else {
      linePoints =
        SCORING.linePoints[4] + (linesCleared - 4) * SCORING.pointsPerExtraLine;
    }
  }

  const comboAfter = linesCleared > 0 ? comboBefore + 1 : 0;
  const comboBonus =
    linesCleared > 0 && comboBefore > 0
      ? comboBefore * SCORING.comboBonusPerStreak
      : 0;

  return {
    breakdown: {
      placementPoints,
      linePoints,
      comboBonus,
      total: placementPoints + linePoints + comboBonus,
    },
    comboAfter,
  };
}

/** True if the shape can be placed anywhere on the board. */
export function canPlaceAnywhere(board: BoardGrid, piece: PieceShape): boolean {
  const size = board.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (canPlace(board, { piece, originX: x, originY: y })) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Game over only when NONE of the remaining available tray pieces can fit.
 * An empty tray of available pieces is treated as not game over (refill pending).
 */
export function isGameOver(board: BoardGrid, tray: readonly TrayPiece[]): boolean {
  const remaining = tray.filter((t) => t.available);
  if (remaining.length === 0) {
    return false;
  }
  return remaining.every((t) => !canPlaceAnywhere(board, t.shape));
}

export function allTrayUsed(tray: readonly TrayPiece[]): boolean {
  return tray.length === TRAY_SIZE && tray.every((t) => !t.available);
}

export function markTrayUsed(tray: TrayPiece[], index: number): TrayPiece[] {
  return tray.map((slot, i) => (i === index ? { ...slot, available: false } : slot));
}

export function createInitialState(bestScore: number = 0): GameState {
  return {
    board: createEmptyBoard(),
    tray: [],
    score: 0,
    bestScore,
    combo: 0,
    isGameOver: false,
  };
}
