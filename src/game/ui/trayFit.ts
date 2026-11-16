import type { PieceShape } from '../../domain/types';

const TRAY_PIECE_PAD = 14;

/**
 * Shrink tray cell size so the piece's bounding box fits inside the slot.
 * Fixes long pieces (e.g. 1×4) overflowing the white tray panel.
 */
export function fitTrayCellSize(
  shape: PieceShape,
  slotWidth: number,
  slotHeight: number,
  preferredCell: number,
  gap: number,
): number {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of shape.cells) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x);
    maxY = Math.max(maxY, c.y);
  }
  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const availW = Math.max(16, slotWidth - TRAY_PIECE_PAD * 2);
  const availH = Math.max(16, slotHeight - TRAY_PIECE_PAD * 2);
  const cellFromW = (availW + gap) / cols - gap;
  const cellFromH = (availH + gap) / rows - gap;
  return Math.max(10, Math.floor(Math.min(preferredCell, cellFromW, cellFromH)));
}
