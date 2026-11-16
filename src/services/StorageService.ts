import { STORAGE_KEYS } from '../domain/constants';

export class StorageService {
  getBestScore(): number {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.bestScore);
      if (raw === null) {
        return 0;
      }
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  setBestScore(score: number): void {
    if (!Number.isFinite(score) || score < 0) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.bestScore, String(Math.floor(score)));
    } catch {
      // Quota / private mode — ignore persistence failure for MVP.
    }
  }
}
