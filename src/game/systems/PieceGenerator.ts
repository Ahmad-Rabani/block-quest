import { PIECE_CATALOG, TRAY_SIZE } from '../../domain/constants';
import type { PieceShape, TrayPiece } from '../../domain/types';

export type RandomFn = () => number;

function pickRandom<T>(items: readonly T[], random: RandomFn): T {
  const index = Math.floor(random() * items.length);
  return items[Math.min(index, items.length - 1)]!;
}

/** Mulberry32 — tiny deterministic PRNG for daily challenge seeds. */
export function createSeededRandom(seed: number): RandomFn {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable day key YYYY-MM-DD in local time. */
export function localDayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dayKeyToSeed(dayKey: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dayKey.length; i++) {
    hash ^= dayKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
