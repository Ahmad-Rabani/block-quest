import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Light haptic feedback. No-ops on web / when disabled.
 */
export class HapticsService {
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async tickLight(): Promise<void> {
    await this.impact(ImpactStyle.Light);
  }

  async tickMedium(): Promise<void> {
    await this.impact(ImpactStyle.Medium);
  }

  private async impact(style: ImpactStyle): Promise<void> {
    if (!this.enabled || !Capacitor.isNativePlatform()) {
      return;
    }
    try {
      await Haptics.impact({ style });
    } catch {
      // Device may not support haptics.
    }
  }
}
