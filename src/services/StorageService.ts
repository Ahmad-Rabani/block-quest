import { STORAGE_KEYS } from '../domain/constants';

export class StorageService {
  getBestScore(): number {
    return this.readInt(STORAGE_KEYS.bestScore, 0);
  }

  setBestScore(score: number): void {
    if (!Number.isFinite(score) || score < 0) {
      return;
    }
    this.write(STORAGE_KEYS.bestScore, String(Math.floor(score)));
  }

  getDailyBest(dayKey: string): number {
    return this.readInt(`${STORAGE_KEYS.dailyBestPrefix}${dayKey}`, 0);
  }

  setDailyBest(dayKey: string, score: number): void {
    if (!Number.isFinite(score) || score < 0) {
      return;
    }
    const key = `${STORAGE_KEYS.dailyBestPrefix}${dayKey}`;
    const prev = this.getDailyBest(dayKey);
    if (score > prev) {
      this.write(key, String(Math.floor(score)));
    }
  }

  isMuted(): boolean {
    return this.readBool(STORAGE_KEYS.muted, false);
  }

  setMuted(muted: boolean): void {
    this.write(STORAGE_KEYS.muted, muted ? '1' : '0');
  }

  hasSeenTutorial(): boolean {
    return this.readBool(STORAGE_KEYS.tutorialSeen, false);
  }

  setTutorialSeen(seen: boolean): void {
    this.write(STORAGE_KEYS.tutorialSeen, seen ? '1' : '0');
  }

  private readInt(key: string, fallback: number): number {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value >= 0 ? value : fallback;
    } catch {
      return fallback;
    }
  }

  private readBool(key: string, fallback: boolean): boolean {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return raw === '1' || raw === 'true';
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Quota / private mode — ignore persistence failure.
    }
  }
}
