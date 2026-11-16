import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';
import { DESIGN_WIDTH } from '../config/gameConfig';
import { clearBannerMessage } from './clearBannerCopy';

export { clearBannerMessage } from './clearBannerCopy';

/** Short floating banner for line clears / combos. */
export function showClearBanner(
  scene: Phaser.Scene,
  linesCleared: number,
  combo: number,
): void {
  const message = clearBannerMessage(linesCleared, combo);
  if (!message) {
    return;
  }

  const y = 160;
  const label = scene.add
    .text(DESIGN_WIDTH / 2, y, message, {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: PALETTE.white,
      backgroundColor: PALETTE.primaryPurple,
      padding: { x: 16, y: 10 },
      align: 'center',
    })
    .setOrigin(0.5)
    .setDepth(90)
    .setAlpha(0)
    .setScale(0.86);

  scene.tweens.add({
    targets: label,
    alpha: 1,
    scale: 1,
    y: y - 12,
    duration: 220,
    ease: 'Back.Out',
    onComplete: () => {
      scene.tweens.add({
        targets: label,
        alpha: 0,
        y: y - 36,
        duration: 320,
        delay: 520,
        onComplete: () => label.destroy(),
      });
    },
  });
}
