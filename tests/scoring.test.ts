import { describe, expect, it } from 'vitest';
import { SCORING } from '../src/domain/constants';
import { scorePlacement } from '../src/domain/puzzleRules';
import { ScoreManager } from '../src/game/systems/ScoreManager';

describe('scoring', () => {
  it('scores 1 point per placed block', () => {
    const { breakdown, comboAfter } = scorePlacement(4, 0, 0);
    expect(breakdown.placementPoints).toBe(4);
    expect(breakdown.linePoints).toBe(0);
    expect(breakdown.comboBonus).toBe(0);
    expect(breakdown.total).toBe(4);
    expect(comboAfter).toBe(0);
  });

  it('applies configured points for 1–4 simultaneous lines', () => {
    expect(scorePlacement(1, 1, 0).breakdown.linePoints).toBe(SCORING.linePoints[1]);
    expect(scorePlacement(1, 2, 0).breakdown.linePoints).toBe(SCORING.linePoints[2]);
    expect(scorePlacement(1, 3, 0).breakdown.linePoints).toBe(SCORING.linePoints[3]);
    expect(scorePlacement(1, 4, 0).breakdown.linePoints).toBe(SCORING.linePoints[4]);
  });

  it('adds extra points for 5+ simultaneous lines', () => {
    const expected = SCORING.linePoints[4] + SCORING.pointsPerExtraLine;
    expect(scorePlacement(1, 5, 0).breakdown.linePoints).toBe(expected);
  });

  it('awards combo bonus on consecutive clears', () => {
    const first = scorePlacement(3, 1, 0);
    expect(first.comboAfter).toBe(1);
    expect(first.breakdown.comboBonus).toBe(0);

    const second = scorePlacement(2, 1, first.comboAfter);
    expect(second.comboAfter).toBe(2);
    expect(second.breakdown.comboBonus).toBe(1 * SCORING.comboBonusPerStreak);
  });

  it('resets combo when a placement clears no lines', () => {
    const { comboAfter } = scorePlacement(2, 0, 3);
    expect(comboAfter).toBe(0);
  });

  it('ScoreManager tracks score and best score', () => {
    const manager = new ScoreManager(10);
    manager.applyPlacement(3, 1);
    expect(manager.getScore()).toBe(3 + SCORING.linePoints[1]);
    expect(manager.getBestScore()).toBeGreaterThanOrEqual(manager.getScore());
    expect(manager.getBestScore()).toBe(manager.getScore() > 10 ? manager.getScore() : 10);
  });
});
