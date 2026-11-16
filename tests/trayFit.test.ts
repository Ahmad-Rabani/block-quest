import { describe, expect, it } from 'vitest';
import type { PieceShape } from '../src/domain/types';
import { fitTrayCellSize } from '../src/game/ui/trayFit';

const line4: PieceShape = {
  id: 'line4',
  colorId: 5,
  cells: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],
};

describe('tray piece fit', () => {
  it('shrinks cell size so a 4-wide piece fits in a narrow slot', () => {
    const slotW = 100;
    const slotH = 120;
    const gap = 3;
    const preferred = 28;
    const cell = fitTrayCellSize(line4, slotW, slotH, preferred, gap);
    const width = 4 * cell + 3 * gap;
    expect(cell).toBeLessThan(preferred);
    expect(width).toBeLessThanOrEqual(slotW - 20);
  });
});
