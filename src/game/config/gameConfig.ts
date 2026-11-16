import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

/** Logical portrait design size — scaled by Phaser Scale Manager. */
export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;

export function createGameConfig(parent: string | HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: PALETTE.background,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    scene: [BootScene, GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
    },
    input: {
      activePointers: 3,
    },
    banner: false,
  };
}
