/**
 * Lightweight procedural SFX via Web Audio API.
 * No external audio assets — keeps the MVP offline and dependency-light.
 */
export class AudioService {
  private ctx: AudioContext | null = null;
  private muted = false;

  constructor(muted: boolean = false) {
    this.muted = muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      void this.ctx?.suspend();
    } else {
      void this.ensureContext()?.resume();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Suspend audio graph without changing mute preference (app background). */
  suspendOutput(): void {
    void this.ctx?.suspend();
  }

  /** Resume audio graph if not muted (app foreground). */
  resumeOutput(): void {
    if (!this.muted) {
      void this.ensureContext()?.resume();
    }
  }

  playPlace(): void {
    this.tone(420, 0.05, 'triangle', 0.05);
    this.tone(560, 0.06, 'triangle', 0.035, 0.04);
  }

  playClear(lines: number): void {
    const count = Math.max(1, Math.min(lines, 6));
    for (let i = 0; i < count; i++) {
      this.tone(520 + i * 90, 0.08, 'sine', 0.055, i * 0.045);
    }
  }

  playInvalid(): void {
    this.tone(180, 0.09, 'sawtooth', 0.03);
  }

  playGameOver(): void {
    this.tone(360, 0.12, 'triangle', 0.05);
    this.tone(260, 0.16, 'triangle', 0.045, 0.1);
    this.tone(180, 0.22, 'sine', 0.04, 0.22);
  }

  playUi(): void {
    this.tone(640, 0.04, 'sine', 0.03);
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    gainValue: number,
    delay: number = 0,
  ): void {
    if (this.muted) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }
}
