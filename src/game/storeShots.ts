import { PIECE_CATALOG } from '../domain/constants';
import type { BoardGrid, TrayPiece } from '../domain/types';
import type { RunSnapshot } from './systems/runSnapshot';

export type StoreShotId = 'menu' | 'play' | 'daily' | 'gameover';

export function readStoreShotParam(): StoreShotId | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('storeShot');
    if (raw === 'menu' || raw === 'play' || raw === 'daily' || raw === 'gameover') {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

function emptyBoard(): BoardGrid {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 0));
}

function paint(board: BoardGrid, cells: Array<[number, number]>, colorId: number): void {
  for (const [x, y] of cells) {
    board[y]![x] = colorId;
  }
}

function trayFromIds(ids: string[]): TrayPiece[] {
  return ids.map((id) => {
    const shape = PIECE_CATALOG.find((p) => p.id === id);
    if (!shape) {
      throw new Error(`Unknown piece id for store shot: ${id}`);
    }
    return { shape, available: true };
  });
}

/** Mid-game classic board that looks busy and premium for store art. */
export function createPlayDemoSnapshot(): RunSnapshot {
  const board = emptyBoard();
  paint(board, [[0, 7], [1, 7], [2, 7], [3, 7], [5, 7], [6, 7]], 1);
  paint(board, [[0, 6], [1, 6], [2, 6], [4, 6], [5, 6]], 2);
  paint(board, [[1, 5], [2, 5], [3, 5], [4, 5], [6, 5]], 3);
  paint(board, [[0, 4], [1, 4], [3, 4], [4, 4], [5, 4], [6, 4]], 4);
  paint(board, [[2, 3], [3, 3], [4, 3], [5, 3]], 5);
  paint(board, [[0, 2], [1, 2], [2, 2], [6, 2], [7, 2]], 6);
  paint(board, [[3, 1], [4, 1], [5, 1]], 1);
  paint(board, [[6, 0], [7, 0], [7, 1]], 2);

  return {
    version: 1,
    mode: 'classic',
    dayKey: null,
    board,
    tray: trayFromIds(['tetro-T', 'square-2', 'tri-L']),
    score: 2860,
    bestScore: 12480,
    combo: 2,
    undosRemaining: 2,
    isGameOver: false,
  };
}

export function createDailyDemoSnapshot(): RunSnapshot {
  const snap = createPlayDemoSnapshot();
  return {
    ...snap,
    mode: 'daily',
    dayKey: 'store-demo',
    score: 1540,
    bestScore: 3200,
    combo: 1,
  };
}

/** Board with no valid tray placements — triggers game-over presentation. */
export function createGameOverDemoSnapshot(): RunSnapshot {
  const board = emptyBoard();
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // Leave a checker of gaps too small for the remaining pieces.
      if ((x + y) % 2 === 0) {
        board[y]![x] = ((x + y) % 6) + 1;
      }
    }
  }
  // Fill most empties so large pieces cannot fit.
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y]![x] === 0 && !(x === 7 && y === 7)) {
        board[y]![x] = 3;
      }
    }
  }

  return {
    version: 1,
    mode: 'classic',
    dayKey: null,
    board,
    tray: trayFromIds(['tetro-line-h', 'square-2', 'tetro-T']),
    score: 4120,
    bestScore: 12480,
    combo: 0,
    undosRemaining: 0,
    isGameOver: true,
  };
}

export function snapshotForStoreShot(shot: Exclude<StoreShotId, 'menu'>): RunSnapshot {
  switch (shot) {
    case 'daily':
      return createDailyDemoSnapshot();
    case 'gameover':
      return createGameOverDemoSnapshot();
    case 'play':
    default:
      return createPlayDemoSnapshot();
  }
}
