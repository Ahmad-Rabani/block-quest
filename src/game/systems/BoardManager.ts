import {
  allTrayUsed,
  cloneBoard,
  createInitialState,
  isGameOver,
  markTrayUsed,
  placePiece,
} from '../../domain/puzzleRules';
import type { BoardGrid, GameState, Placement, ScoreBreakdown, TrayPiece } from '../../domain/types';
import {
  createSeededRandom,
  dayKeyToSeed,
  generateTray,
  localDayKey,
  type RandomFn,
} from './PieceGenerator';
import { LineClearSystem } from './LineClearSystem';
import { ScoreManager, type ScoreSnapshot } from './ScoreManager';

export type PlayMode = 'classic' | 'daily';

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

interface HistoryEntry {
  board: BoardGrid;
  tray: TrayPiece[];
  score: ScoreSnapshot;
  isGameOver: boolean;
}

export const DEFAULT_UNDOS_PER_RUN = 3;

/**
 * Owns mutable play state and applies domain rules for each placement.
 */
export class BoardManager {
  private state: GameState;
  private readonly lineClear = new LineClearSystem();
  private readonly scoreManager: ScoreManager;
  private random: RandomFn = Math.random;
  private mode: PlayMode = 'classic';
  private dayKey: string | null = null;
  private history: HistoryEntry[] = [];
  private undosRemaining = DEFAULT_UNDOS_PER_RUN;

  constructor(bestScore: number = 0) {
    this.scoreManager = new ScoreManager(bestScore);
    this.state = createInitialState(bestScore);
    this.state.tray = generateTray(this.random);
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

  getMode(): PlayMode {
    return this.mode;
  }

  getDayKey(): string | null {
    return this.dayKey;
  }

  getUndosRemaining(): number {
    return this.undosRemaining;
  }

  canUndo(): boolean {
    return this.undosRemaining > 0 && this.history.length > 0 && !this.state.isGameOver;
  }

  restartClassic(bestScore?: number): void {
    this.mode = 'classic';
    this.dayKey = null;
    this.random = Math.random;
    this.beginRun(bestScore);
  }

  restartDaily(bestScore?: number, dayKey: string = localDayKey()): void {
    this.mode = 'daily';
    this.dayKey = dayKey;
    this.random = createSeededRandom(dayKeyToSeed(dayKey));
    this.beginRun(bestScore);
  }

  /** @deprecated Prefer restartClassic / restartDaily */
  restart(bestScore?: number): void {
    if (this.mode === 'daily' && this.dayKey) {
      this.restartDaily(bestScore, this.dayKey);
      return;
    }
    this.restartClassic(bestScore);
  }

  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }
    const entry = this.history.pop();
    if (!entry) {
      return false;
    }
    this.undosRemaining -= 1;
    this.scoreManager.restore(entry.score);
    this.state = {
      board: cloneBoard(entry.board),
      tray: entry.tray.map((slot) => ({
        available: slot.available,
        shape: {
          ...slot.shape,
          cells: slot.shape.cells.map((c) => ({ ...c })),
        },
      })),
      score: this.scoreManager.getScore(),
      bestScore: this.scoreManager.getBestScore(),
      combo: this.scoreManager.getCombo(),
      isGameOver: entry.isGameOver,
    };
    return true;
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

    this.pushHistory();

    const { board: clearedBoard, result } = this.lineClear.clear(placed);
    const blocksPlaced = slot.shape.cells.length;
    const breakdown = this.scoreManager.applyPlacement(blocksPlaced, result.linesCleared);

    let tray = markTrayUsed(this.state.tray, trayIndex);
    if (allTrayUsed(tray)) {
      tray = generateTray(this.random);
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

  private beginRun(bestScore?: number): void {
    const best = bestScore ?? this.scoreManager.getBestScore();
    this.scoreManager.reset(best);
    this.state = createInitialState(best);
    this.state.tray = generateTray(this.random);
    this.history = [];
    this.undosRemaining = DEFAULT_UNDOS_PER_RUN;
  }

  private pushHistory(): void {
    this.history.push({
      board: cloneBoard(this.state.board),
      tray: this.state.tray.map((slot) => ({
        available: slot.available,
        shape: {
          ...slot.shape,
          cells: slot.shape.cells.map((c) => ({ ...c })),
        },
      })),
      score: this.scoreManager.snapshot(),
      isGameOver: this.state.isGameOver,
    });
    // Cap memory — only need enough for remaining undos.
    const max = DEFAULT_UNDOS_PER_RUN + 2;
    if (this.history.length > max) {
      this.history.shift();
    }
  }
}
