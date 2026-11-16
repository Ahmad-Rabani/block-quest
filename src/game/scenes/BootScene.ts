import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(PALETTE.background);

    const title = this.add
      .text(width / 2, height / 2 - 20, 'BLOCK QUEST', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '36px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, height / 2 + 24, 'Loading…', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        color: PALETTE.text,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.7, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        subtitle.destroy();
        this.scene.start('GameScene');
      },
    });
  }
}
