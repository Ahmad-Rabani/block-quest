import {
  allTrayUsed,
  createInitialState,
  isGameOver,
  markTrayUsed,
  placePiece,
} from '../../domain/puzzleRules';
import type { BoardGrid, GameState, Placement, ScoreBreakdown, TrayPiece } from '../../domain/types';
import { generateTray } from './PieceGenerator';
import { LineClearSystem } from './LineClearSystem';
import { ScoreManager } from './ScoreManager';

export interface PlacementOutcome {
  ok: boolean;
  breakdown?: ScoreBreakdown;
  linesCleared?: number;
  board?: BoardGrid;
  tray?: TrayPiece[];
  isGameOver?: boolean;
  score?: number;
  bestScore?: number;
  combo?: number;
}

/**
 * Owns mutable play state and applies domain rules for each placement.
 */
export class BoardManager {
  private state: GameState;
  private readonly lineClear = new LineClearSystem();
  private readonly scoreManager: ScoreManager;

  constructor(bestScore: number = 0) {
    this.scoreManager = new ScoreManager(bestScore);
    this.state = createInitialState(bestScore);
    this.state.tray = generateTray();
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  getBoard(): BoardGrid {
    return this.state.board;
  }

  getTray(): readonly TrayPiece[] {
    return this.state.tray;
  }

  restart(bestScore?: number): void {
    const best = bestScore ?? this.scoreManager.getBestScore();
    this.scoreManager.reset(best);
    this.state = createInitialState(best);
    this.state.tray = generateTray();
  }

  tryPlace(trayIndex: number, originX: number, originY: number): PlacementOutcome {
    if (this.state.isGameOver) {
      return { ok: false };
    }

    const slot = this.state.tray[trayIndex];
    if (!slot || !slot.available) {
      return { ok: false };
    }

    const placement: Placement = {
      piece: slot.shape,
      originX,
      originY,
    };

    const placed = placePiece(this.state.board, placement);
    if (!placed) {
      return { ok: false };
    }

    const { board: clearedBoard, result } = this.lineClear.clear(placed);
    const blocksPlaced = slot.shape.cells.length;
    const breakdown = this.scoreManager.applyPlacement(blocksPlaced, result.linesCleared);

    let tray = markTrayUsed(this.state.tray, trayIndex);
    if (allTrayUsed(tray)) {
      tray = generateTray();
    }

    const gameOver = isGameOver(clearedBoard, tray);

    this.state = {
      board: clearedBoard,
      tray,
      score: this.scoreManager.getScore(),
      bestScore: this.scoreManager.getBestScore(),
      combo: this.scoreManager.getCombo(),
      isGameOver: gameOver,
    };

    return {
      ok: true,
      breakdown,
      linesCleared: result.linesCleared,
      board: this.state.board,
      tray: this.state.tray,
      isGameOver: gameOver,
      score: this.state.score,
      bestScore: this.state.bestScore,
      combo: this.state.combo,
    };
  }
}
