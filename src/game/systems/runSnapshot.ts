import type { BoardGrid, TrayPiece } from '../../domain/types';
import type { PlayMode } from './BoardManager';

export interface RunSnapshot {
  version: 1;
  mode: PlayMode;
  dayKey: string | null;
  board: BoardGrid;
  tray: TrayPiece[];
  score: number;
  bestScore: number;
  combo: number;
  undosRemaining: number;
  isGameOver: boolean;
}

export function isRunSnapshot(value: unknown): value is RunSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    (v.mode === 'classic' || v.mode === 'daily') &&
    Array.isArray(v.board) &&
    Array.isArray(v.tray) &&
    typeof v.score === 'number' &&
    typeof v.undosRemaining === 'number'
  );
}

export function boardHasProgress(board: BoardGrid): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell !== 0) {
        return true;
      }
    }
  }
  return false;
}
