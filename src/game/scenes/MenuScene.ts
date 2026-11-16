import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';
import { localDayKey } from '../systems/PieceGenerator';
import { boardHasProgress } from '../systems/runSnapshot';
import { AudioService } from '../../services/AudioService';
import { StorageService } from '../../services/StorageService';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';
import type { PlayMode } from '../systems/BoardManager';

export type GameStartData = {
  mode: PlayMode;
  continueRun?: boolean;
};

/**
 * Pre-game hub: decorative block backdrop, top scores, mode select.
 * Multiplayer is shown locked until a later phase.
 */
export class MenuScene extends Phaser.Scene {
  private storage = new StorageService();
  private audio = new AudioService(false);

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.audio = new AudioService(this.storage.isMuted());
    this.cameras.main.setBackgroundColor(PALETTE.background);
    this.drawGameBackdrop();
    this.drawHeroCard();
  }

  private drawGameBackdrop(): void {
    const g = this.add.graphics().setDepth(0);

    // Soft ambient washes
    g.fillStyle(0x6545d6, 0.1);
    g.fillCircle(60, 120, 160);
    g.fillStyle(0x42a5f5, 0.1);
    g.fillCircle(DESIGN_WIDTH - 40, 260, 180);
    g.fillStyle(0xff9b54, 0.08);
    g.fillCircle(120, DESIGN_HEIGHT - 100, 150);

    // Decorative floating blocks — reads as a real block puzzle world.
    const blocks: Array<{ x: number; y: number; color: number; size: number; alpha: number }> = [
      { x: 36, y: 170, color: 0x6545d6, size: 28, alpha: 0.35 },
      { x: 68, y: 170, color: 0x42a5f5, size: 28, alpha: 0.3 },
      { x: 36, y: 202, color: 0xff9b54, size: 28, alpha: 0.28 },
      { x: DESIGN_WIDTH - 92, y: 200, color: 0x7c6cf0, size: 26, alpha: 0.32 },
      { x: DESIGN_WIDTH - 62, y: 200, color: 0x6545d6, size: 26, alpha: 0.28 },
      { x: DESIGN_WIDTH - 92, y: 230, color: 0x42a5f5, size: 26, alpha: 0.26 },
      { x: DESIGN_WIDTH - 62, y: 230, color: 0xff9b54, size: 26, alpha: 0.24 },
      { x: 48, y: DESIGN_HEIGHT - 220, color: 0x5bb8f7, size: 30, alpha: 0.22 },
      { x: 82, y: DESIGN_HEIGHT - 220, color: 0x6545d6, size: 30, alpha: 0.25 },
      { x: 116, y: DESIGN_HEIGHT - 220, color: 0xffb06e, size: 30, alpha: 0.22 },
      { x: DESIGN_WIDTH - 110, y: DESIGN_HEIGHT - 250, color: 0x6545d6, size: 24, alpha: 0.2 },
      { x: DESIGN_WIDTH - 82, y: DESIGN_HEIGHT - 250, color: 0x42a5f5, size: 24, alpha: 0.2 },
      { x: DESIGN_WIDTH - 82, y: DESIGN_HEIGHT - 222, color: 0xff9b54, size: 24, alpha: 0.18 },
    ];

    for (const b of blocks) {
      g.fillStyle(0x2a2550, 0.08);
      g.fillRoundedRect(b.x + 2, b.y + 3, b.size, b.size, 7);
      g.fillStyle(b.color, b.alpha);
      g.fillRoundedRect(b.x, b.y, b.size, b.size, 7);
    }

    // Faint mini board silhouette behind the card
    const boardX = DESIGN_WIDTH / 2 - 70;
    const boardY = 210;
    const cell = 16;
    const gap = 3;
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(boardX - 10, boardY - 10, 8 * (cell + gap) - gap + 20, 8 * (cell + gap) - gap + 20, 16);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        g.fillStyle(0xe8e4f5, 0.55);
        g.fillRoundedRect(boardX + x * (cell + gap), boardY + y * (cell + gap), cell, cell, 4);
      }
    }
    // A few “played” cells on the silhouette
    const filled = [
      [1, 6],
      [2, 6],
      [2, 5],
      [5, 4],
      [5, 5],
      [6, 5],
      [3, 3],
    ];
    const colors = [0x6545d6, 0x42a5f5, 0xff9b54];
    filled.forEach(([x, y], i) => {
      g.fillStyle(colors[i % colors.length]!, 0.45);
      g.fillRoundedRect(boardX + x! * (cell + gap), boardY + y! * (cell + gap), cell, cell, 4);
    });
  }

  private drawHeroCard(): void {
    const classicBest = this.storage.getBestScore();
    const dailyBest = this.storage.getDailyBest(localDayKey());
    const topScore = Math.max(classicBest, dailyBest);

    const snap = this.storage.getActiveRun();
    const canContinue =
      snap &&
      !snap.isGameOver &&
      (snap.score > 0 || boardHasProgress(snap.board)) &&
      !(snap.mode === 'daily' && snap.dayKey !== localDayKey());

    const modeCount = (canContinue ? 1 : 0) + 3;
    const cardW = DESIGN_WIDTH - 40;
    const cardH = 278 + modeCount * 64 + 24;
    const cardX = 20;
    const cardY = Math.max(36, DESIGN_HEIGHT / 2 - cardH / 2);

    const shadow = this.add.graphics().setDepth(5);
    shadow.fillStyle(0x6545d6, 0.14);
    shadow.fillRoundedRect(cardX + 4, cardY + 8, cardW, cardH, 28);

    const card = this.add.graphics().setDepth(6);
    card.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 0.96);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 28);

    if (this.textures.exists('brand-icon')) {
      this.add
        .image(DESIGN_WIDTH / 2, cardY + 58, 'brand-icon')
        .setDisplaySize(72, 72)
        .setOrigin(0.5)
        .setDepth(7);
    }

    this.add
      .text(DESIGN_WIDTH / 2, cardY + 118, 'BLOCK QUEST', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(7);

    this.add
      .text(DESIGN_WIDTH / 2, cardY + 152, 'Clear lines. Beat your best.', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        color: '#7A7499',
      })
      .setOrigin(0.5)
      .setDepth(7);

    // Top score panel
    const scorePanel = this.add.graphics().setDepth(7);
    scorePanel.fillStyle(0x6545d6, 0.08);
    scorePanel.fillRoundedRect(DESIGN_WIDTH / 2 - 120, cardY + 178, 240, 56, 16);

    this.add
      .text(DESIGN_WIDTH / 2, cardY + 192, 'TOP SCORE', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#7A7499',
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.add
      .text(DESIGN_WIDTH / 2, cardY + 216, String(topScore), {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.add
      .text(
        DESIGN_WIDTH / 2,
        cardY + 250,
        `Classic ${classicBest}   ·   Daily ${dailyBest}`,
        {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '12px',
          color: '#7A7499',
        },
      )
      .setOrigin(0.5)
      .setDepth(8);

    let buttonTop = cardY + 278;

    if (canContinue && snap) {
      this.addModeButton({
        y: buttonTop,
        label: `Continue · Score ${snap.score}`,
        subtitle: snap.mode === 'daily' ? 'Daily run' : 'Classic run',
        locked: false,
        fill: PALETTE.orange,
        onClick: () => this.startGame(snap.mode, true),
      });
      buttonTop += 64;
    }

    this.addModeButton({
      y: buttonTop,
      label: 'Classic',
      subtitle: 'Endless puzzle',
      locked: false,
      fill: PALETTE.primaryPurple,
      onClick: () => this.startGame('classic', false),
    });
    buttonTop += 64;

    this.addModeButton({
      y: buttonTop,
      label: 'Daily',
      subtitle: 'New challenge every day',
      locked: false,
      fill: PALETTE.blue,
      onClick: () => this.startGame('daily', false),
    });
    buttonTop += 64;

    this.addModeButton({
      y: buttonTop,
      label: 'Multiplayer',
      subtitle: 'Coming soon',
      locked: true,
      fill: '#9A94B8',
      onClick: () => {
        this.audio.playInvalid();
      },
    });
  }

  private addModeButton(options: {
    y: number;
    label: string;
    subtitle: string;
    locked: boolean;
    fill: string;
    onClick: () => void;
  }): void {
    const w = 280;
    const h = 54;
    const x = DESIGN_WIDTH / 2 - w / 2;
    const color = Phaser.Display.Color.HexStringToColor(options.fill).color;

    const gfx = this.add.graphics().setDepth(8);
    if (options.locked) {
      gfx.fillStyle(0xe8e4f5, 1);
      gfx.fillRoundedRect(x, options.y, w, h, 16);
      gfx.lineStyle(2, 0xd4cee8, 1);
      gfx.strokeRoundedRect(x, options.y, w, h, 16);
    } else {
      gfx.fillStyle(0x2a2550, 0.12);
      gfx.fillRoundedRect(x + 2, options.y + 3, w, h, 16);
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(x, options.y, w, h, 16);
    }

    gfx.setInteractive(
      new Phaser.Geom.Rectangle(x, options.y, w, h),
      Phaser.Geom.Rectangle.Contains,
    );

    const titleColor = options.locked ? '#7A7499' : PALETTE.white;
    const subColor = options.locked ? '#9A94B8' : 'rgba(255,255,255,0.85)';

    this.add
      .text(DESIGN_WIDTH / 2, options.y + (options.locked ? 18 : 16), options.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: titleColor,
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.add
      .text(DESIGN_WIDTH / 2, options.y + (options.locked ? 36 : 36), options.subtitle, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '11px',
        color: subColor,
      })
      .setOrigin(0.5)
      .setDepth(9);

    if (options.locked) {
      this.add
        .text(x + w - 18, options.y + h / 2, 'Locked', {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#9A94B8',
        })
        .setOrigin(1, 0.5)
        .setDepth(9);
    }

    gfx.on('pointerup', () => {
      if (!options.locked) {
        this.audio.playUi();
      }
      options.onClick();
    });
  }

  private startGame(mode: PlayMode, continueRun: boolean): void {
    if (!continueRun) {
      this.storage.clearActiveRun();
    }
    const data: GameStartData = { mode, continueRun };
    this.scene.start('GameScene', data);
  }
}
