/** Cell occupancy: 0 empty, positive values encode color/piece family ids. */
export type CellValue = number;

export type BoardGrid = CellValue[][];

export interface Coord {
  readonly x: number;
  readonly y: number;
}

/** Piece shape as relative offsets from an anchor (min bounding origin). */
export interface PieceShape {
  readonly id: string;
  readonly cells: readonly Coord[];
  readonly colorId: number;
}

export interface TrayPiece {
  readonly shape: PieceShape;
  /** False when the slot has been used this round. */
  readonly available: boolean;
}

export interface Placement {
  readonly piece: PieceShape;
  readonly originX: number;
  readonly originY: number;
}

export interface LineClearResult {
  readonly rows: readonly number[];
  readonly columns: readonly number[];
  /** Unique cells removed (row+col intersections counted once). */
  readonly clearedCells: readonly Coord[];
  readonly linesCleared: number;
}

export interface ScoreBreakdown {
  readonly placementPoints: number;
  readonly linePoints: number;
  readonly comboBonus: number;
  readonly total: number;
}

export interface GameState {
  board: BoardGrid;
  tray: TrayPiece[];
  score: number;
  bestScore: number;
  combo: number;
  isGameOver: boolean;
}
