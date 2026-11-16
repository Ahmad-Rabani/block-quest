import type { PieceShape } from './types';

export const BOARD_SIZE = 8;

/** Occupied cells use positive color ids; 0 is empty. */
export const EMPTY_CELL = 0;

export const TRAY_SIZE = 3;

/** Initial scoring balance — tunable, not final design. */
export const SCORING = {
  pointsPerBlock: 1,
  /** Index = number of simultaneous lines cleared; 0 unused. */
  linePoints: [0, 10, 25, 45, 70] as const,
  /** Extra points for each line beyond 4 simultaneous. */
  pointsPerExtraLine: 20,
  /** Combo: consecutive placements that clear at least one line. */
  comboBonusPerStreak: 5,
} as const;

export const STORAGE_KEYS = {
  bestScore: 'block-quest.bestScore',
  dailyBestPrefix: 'block-quest.dailyBest.',
  muted: 'block-quest.muted',
  haptics: 'block-quest.haptics',
  tutorialSeen: 'block-quest.tutorialSeen',
} as const;

export const PALETTE = {
  background: '#F4F2FA',
  primaryPurple: '#6545D6',
  blue: '#42A5F5',
  orange: '#FF9B54',
  white: '#FFFFFF',
  cellEmpty: '#E8E4F5',
  cellShadow: 'rgba(101, 69, 214, 0.12)',
  text: '#2A2550',
  previewValid: 'rgba(101, 69, 214, 0.35)',
  previewInvalid: 'rgba(255, 90, 90, 0.35)',
} as const;

/** Color ids map to tray/piece tint families. */
export const COLOR_HEX: Record<number, string> = {
  1: PALETTE.primaryPurple,
  2: PALETTE.blue,
  3: PALETTE.orange,
  4: '#7C6CF0',
  5: '#5BB8F7',
  6: '#FFB06E',
};

function shape(id: string, colorId: number, cells: Array<[number, number]>): PieceShape {
  return {
    id,
    colorId,
    cells: cells.map(([x, y]) => ({ x, y })),
  };
}

/**
 * Catalog of block shapes (relative coordinates).
 * Keep shapes modest for 8×8 playability.
 */
export const PIECE_CATALOG: readonly PieceShape[] = [
  shape('mono', 1, [[0, 0]]),
  shape('domino-h', 2, [
    [0, 0],
    [1, 0],
  ]),
  shape('domino-v', 2, [
    [0, 0],
    [0, 1],
  ]),
  shape('tri-line-h', 3, [
    [0, 0],
    [1, 0],
    [2, 0],
  ]),
  shape('tri-line-v', 3, [
    [0, 0],
    [0, 1],
    [0, 2],
  ]),
  shape('tri-L', 1, [
    [0, 0],
    [0, 1],
    [1, 1],
  ]),
  shape('tri-L-mirror', 1, [
    [1, 0],
    [0, 1],
    [1, 1],
  ]),
  shape('square-2', 4, [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]),
  shape('tetro-line-h', 5, [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]),
  shape('tetro-line-v', 5, [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ]),
  shape('tetro-T', 6, [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ]),
  shape('tetro-L', 4, [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ]),
  shape('tetro-S', 3, [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ]),
  shape('plus', 2, [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ]),
  shape('corner-3', 6, [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ]),
];
