import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { AudioService } from './AudioService';

export type BackButtonHandler = () => boolean;

/**
 * Capacitor app lifecycle + Android back button.
 * Safe to construct in browser — listeners only attach on native platforms.
 */
export class NativeLifecycleService {
  private readonly audio: AudioService;
  private backHandler: BackButtonHandler | null = null;
  private removeBack?: () => void;
  private removeState?: () => void;

  constructor(audio: AudioService) {
    this.audio = audio;
  }

  async start(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const backSub = await App.addListener('backButton', ({ canGoBack }) => {
      if (this.backHandler?.()) {
        return;
      }
      if (canGoBack) {
        window.history.back();
        return;
      }
      void App.minimizeApp();
    });
    this.removeBack = () => {
      void backSub.remove();
    };

    const stateSub = await App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.audio.resumeOutput();
      } else {
        this.audio.suspendOutput();
      }
    });
    this.removeState = () => {
      void stateSub.remove();
    };
  }

  /**
   * Register a handler that returns true if it consumed the back press
   * (e.g. closed a modal).
   */
  setBackButtonHandler(handler: BackButtonHandler | null): void {
    this.backHandler = handler;
  }

  stop(): void {
    this.removeBack?.();
    this.removeState?.();
    this.removeBack = undefined;
    this.removeState = undefined;
    this.backHandler = null;
  }
}
