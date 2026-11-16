import { scorePlacement } from '../../domain/puzzleRules';
import type { ScoreBreakdown } from '../../domain/types';

export interface ScoreSnapshot {
  score: number;
  bestScore: number;
  combo: number;
}

export class ScoreManager {
  private score = 0;
  private bestScore = 0;
  private combo = 0;

  constructor(bestScore: number = 0) {
    this.bestScore = bestScore;
  }

  getScore(): number {
    return this.score;
  }

  getBestScore(): number {
    return this.bestScore;
  }

  getCombo(): number {
    return this.combo;
  }

  snapshot(): ScoreSnapshot {
    return {
      score: this.score,
      bestScore: this.bestScore,
      combo: this.combo,
    };
  }

  restore(snapshot: ScoreSnapshot): void {
    this.score = snapshot.score;
    this.bestScore = snapshot.bestScore;
    this.combo = snapshot.combo;
  }

  reset(bestScore?: number): void {
    this.score = 0;
    this.combo = 0;
    if (bestScore !== undefined) {
      this.bestScore = bestScore;
    }
  }

  applyPlacement(blocksPlaced: number, linesCleared: number): ScoreBreakdown {
    const { breakdown, comboAfter } = scorePlacement(
      blocksPlaced,
      linesCleared,
      this.combo,
    );
    this.combo = comboAfter;
    this.score += breakdown.total;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }
    return breakdown;
  }
}
