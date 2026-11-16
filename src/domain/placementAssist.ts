import { BOARD_SIZE, EMPTY_CELL } from './constants';
import { canPlace } from './puzzleRules';
import type { BoardGrid, Coord, PieceShape } from './types';

/**
 * If `rough` is valid, return it. Otherwise search nearby origins within
 * `maxRadius` (Chebyshev) and return the closest valid placement.
 */
export function findNearestValidOrigin(
  board: BoardGrid,
  piece: PieceShape,
  rough: Coord,
  maxRadius: number = 1,
): Coord | null {
  if (canPlace(board, { piece, originX: rough.x, originY: rough.y })) {
    return rough;
  }

  let best: Coord | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let dy = -maxRadius; dy <= maxRadius; dy++) {
    for (let dx = -maxRadius; dx <= maxRadius; dx++) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const x = rough.x + dx;
      const y = rough.y + dy;
      if (!canPlace(board, { piece, originX: x, originY: y })) {
        continue;
      }
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      if (dist < bestDist) {
        bestDist = dist;
        best = { x, y };
      }
    }
  }

  return best;
}

/**
 * Empty cells that sit on rows/columns missing only `emptiesAllowed` cells.
 * Used for subtle “almost complete” board hints.
 */
export function findNearCompleteHintCells(
  board: BoardGrid,
  emptiesAllowed: number = 1,
): Coord[] {
  const size = board.length || BOARD_SIZE;
  const hints: Coord[] = [];
  const seen = new Set<string>();

  const add = (x: number, y: number): void => {
    const key = `${x},${y}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    hints.push({ x, y });
  };

  for (let y = 0; y < size; y++) {
    const empties: Coord[] = [];
    for (let x = 0; x < size; x++) {
      if (board[y]![x] === EMPTY_CELL) {
        empties.push({ x, y });
      }
    }
    if (empties.length === emptiesAllowed) {
      for (const c of empties) {
        add(c.x, c.y);
      }
    }
  }

  for (let x = 0; x < size; x++) {
    const empties: Coord[] = [];
    for (let y = 0; y < size; y++) {
      if (board[y]![x] === EMPTY_CELL) {
        empties.push({ x, y });
      }
    }
    if (empties.length === emptiesAllowed) {
      for (const c of empties) {
        add(c.x, c.y);
      }
    }
  }

  return hints;
}
