import { PIECE_CATALOG, TRAY_SIZE } from '../../domain/constants';
import type { PieceShape, TrayPiece } from '../../domain/types';

export type RandomFn = () => number;

function pickRandom<T>(items: readonly T[], random: RandomFn): T {
  const index = Math.floor(random() * items.length);
  return items[Math.min(index, items.length - 1)]!;
}

/** Generates a tray of three pieces from the catalog. */
export function generateTray(
  random: RandomFn = Math.random,
  catalog: readonly PieceShape[] = PIECE_CATALOG,
): TrayPiece[] {
  const tray: TrayPiece[] = [];
  for (let i = 0; i < TRAY_SIZE; i++) {
    const shape = pickRandom(catalog, random);
    tray.push({
      shape: {
        ...shape,
        id: `${shape.id}-${i}-${Math.floor(random() * 1_000_000)}`,
      },
      available: true,
    });
  }
  return tray;
}
