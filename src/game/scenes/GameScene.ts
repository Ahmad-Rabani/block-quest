import Phaser from 'phaser';
import { BOARD_SIZE, PALETTE } from '../../domain/constants';
import { canPlace, findCompletedLines, pieceCellsAt } from '../../domain/puzzleRules';
import type { Coord } from '../../domain/types';
import { BoardManager } from '../systems/BoardManager';
import { BoardView } from '../objects/BoardView';
import { PieceView } from '../objects/PieceView';
import { AudioService } from '../../services/AudioService';
import { StorageService } from '../../services/StorageService';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';

/** Lift piece above finger/cursor so the board preview stays visible. */
const DRAG_LIFT_Y = 92;
/** Movement threshold before a press becomes a drag. */
const DRAG_THRESHOLD = 8;

export class GameScene extends Phaser.Scene {
  private storage = new StorageService();
  private audio!: AudioService;
  private boardManager!: BoardManager;
  private boardView!: BoardView;
  private pieceViews: PieceView[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private muteLabel!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private trayPanel?: Phaser.GameObjects.Graphics;
  private inputLocked = false;

  private activePiece: PieceView | null = null;
  private dragPointerId: number | null = null;
  private pressOrigin: { x: number; y: number } | null = null;
  private isDragging = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.background);
    this.audio = new AudioService(this.storage.isMuted());
    this.drawBackdrop();

    const best = this.storage.getBestScore();
    this.boardManager = new BoardManager(best);

    this.createHeader();
    this.createBoard();
    this.drawTrayPanel();
    this.refreshTray();
    this.bindInput();
    this.renderAll();

    if (!this.storage.hasSeenTutorial()) {
      this.showTutorial();
    }
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(0x6545d6, 0.06);
    g.fillCircle(DESIGN_WIDTH * 0.15, 120, 140);
    g.fillStyle(0x42a5f5, 0.07);
    g.fillCircle(DESIGN_WIDTH * 0.9, 280, 160);
    g.fillStyle(0xff9b54, 0.05);
    g.fillCircle(DESIGN_WIDTH * 0.3, DESIGN_HEIGHT - 80, 120);
  }

  private createHeader(): void {
    this.add
      .text(DESIGN_WIDTH / 2, 36, 'BLOCK QUEST', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(5);

    const chipY = 82;
    const chipH = 36;
    const scoreChip = this.add.graphics().setDepth(5);
    scoreChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    scoreChip.fillRoundedRect(20, chipY - chipH / 2, 118, chipH, 18);
    scoreChip.fillStyle(0x6545d6, 0.08);
    scoreChip.fillRoundedRect(20, chipY - chipH / 2, 118, chipH, 18);

    const bestChip = this.add.graphics().setDepth(5);
    bestChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bestChip.fillRoundedRect(DESIGN_WIDTH - 138, chipY - chipH / 2, 118, chipH, 18);
    bestChip.fillStyle(0xff9b54, 0.1);
    bestChip.fillRoundedRect(DESIGN_WIDTH - 138, chipY - chipH / 2, 118, chipH, 18);

    this.scoreText = this.add
      .text(79, chipY, 'Score 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestText = this.add
      .text(DESIGN_WIDTH - 79, chipY, `Best ${this.boardManager.getState().bestScore}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.createMuteButton();
  }

  private createMuteButton(): void {
    const bx = DESIGN_WIDTH - 28;
    const by = 34;
    const bg = this.add.graphics().setDepth(8);
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bg.fillCircle(bx, by, 16);
    bg.fillStyle(0x6545d6, 0.1);
    bg.fillCircle(bx, by, 16);
    bg.setInteractive(new Phaser.Geom.Circle(bx, by, 18), Phaser.Geom.Circle.Contains);

    this.muteLabel = this.add
      .text(bx, by, this.audio.isMuted() ? 'Off' : 'On', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(9);

    bg.on('pointerup', () => {
      if (this.inputLocked) {
        return;
      }
      const next = !this.audio.isMuted();
      this.audio.setMuted(next);
      this.storage.setMuted(next);
      this.muteLabel.setText(next ? 'Off' : 'On');
      if (!next) {
        this.audio.playUi();
      }
    });
  }

  private createBoard(): void {
    const gap = 5;
    const horizontalPad = 26;
    const available = DESIGN_WIDTH - horizontalPad * 2;
    const cellSize = Math.floor((available - gap * (BOARD_SIZE - 1)) / BOARD_SIZE);
    const boardPixel = BOARD_SIZE * (cellSize + gap) - gap;
    const originX = (DESIGN_WIDTH - boardPixel) / 2;
    const originY = 118;

    this.boardView = new BoardView(this, { originX, originY, cellSize, gap });
  }

  private drawTrayPanel(): void {
    const panelTop = this.boardView.getBoardBottom() + 28;
    const panelHeight = DESIGN_HEIGHT - panelTop - 24;
    const margin = 16;

    this.trayPanel?.destroy();
    this.trayPanel = this.add.graphics().setDepth(4);
    this.trayPanel.fillStyle(0x6545d6, 0.1);
    this.trayPanel.fillRoundedRect(margin + 3, panelTop + 5, DESIGN_WIDTH - margin * 2, panelHeight, 24);
    this.trayPanel.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    this.trayPanel.fillRoundedRect(margin, panelTop, DESIGN_WIDTH - margin * 2, panelHeight, 24);

    const innerPad = 14;
    const slotGap = 10;
    const usable = DESIGN_WIDTH - margin * 2 - innerPad * 2;
    const slotW = (usable - slotGap * 2) / 3;
    const slotH = panelHeight - 28;
    const slotY = panelTop + 14;

    for (let i = 0; i < 3; i++) {
      const sx = margin + innerPad + i * (slotW + slotGap);
      this.trayPanel.fillStyle(0x6545d6, 0.06);
      this.trayPanel.fillRoundedRect(sx, slotY, slotW, slotH, 16);
    }
  }

  private getTrayLayout(): {
    slotCenters: Array<{ x: number; y: number }>;
    hitWidth: number;
    hitHeight: number;
    cellSize: number;
    gap: number;
  } {
    const panelTop = this.boardView.getBoardBottom() + 28;
    const panelHeight = DESIGN_HEIGHT - panelTop - 24;
    const margin = 16;
    const innerPad = 14;
    const slotGap = 10;
    const usable = DESIGN_WIDTH - margin * 2 - innerPad * 2;
    const slotW = (usable - slotGap * 2) / 3;
    const slotH = panelHeight - 28;
    const slotY = panelTop + 14;
    const centerY = slotY + slotH / 2 + 6;

    const slotCenters = [0, 1, 2].map((i) => ({
      x: margin + innerPad + i * (slotW + slotGap) + slotW / 2,
      y: centerY,
    }));

    const boardCell = this.boardView.getLayout().cellSize;
    const cellSize = Math.max(22, Math.floor(boardCell * 0.88));

    return {
      slotCenters,
      hitWidth: slotW,
      hitHeight: slotH,
      cellSize,
      gap: 3,
    };
  }

  private refreshTray(animate: boolean = true): void {
    for (const view of this.pieceViews) {
      view.destroy();
    }
    this.pieceViews = [];
    this.activePiece = null;
    this.isDragging = false;
    this.dragPointerId = null;
    this.pressOrigin = null;

    const tray = this.boardManager.getTray();
    const layout = this.getTrayLayout();

    tray.forEach((slot, index) => {
      if (!slot.available) {
        return;
      }
      const center = layout.slotCenters[index]!;
      const view = new PieceView(this, {
        trayIndex: index,
        shape: slot.shape,
        cellSize: layout.cellSize,
        gap: layout.gap,
        centerX: center.x,
        centerY: center.y,
        hitWidth: layout.hitWidth,
        hitHeight: layout.hitHeight,
      });
      if (animate) {
        view.setScale(0.7);
        view.setAlpha(0);
        this.tweens.add({
          targets: view,
          scale: 1,
          alpha: 1,
          duration: 180,
          delay: index * 40,
          ease: 'Back.Out',
        });
      }
      this.pieceViews.push(view);
    });
  }

  private bindInput(): void {
    this.input.addPointer(2);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.inputLocked || this.overlay || this.activePiece) {
        return;
      }
      const hit = this.findPieceAt(pointer.x, pointer.y);
      if (!hit) {
        return;
      }
      this.activePiece = hit;
      this.dragPointerId = pointer.id;
      this.pressOrigin = { x: pointer.x, y: pointer.y };
      this.isDragging = false;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.activePiece || pointer.id !== this.dragPointerId || !this.pressOrigin) {
        return;
      }

      const dist = Math.hypot(pointer.x - this.pressOrigin.x, pointer.y - this.pressOrigin.y);
      if (!this.isDragging && dist >= DRAG_THRESHOLD) {
        this.isDragging = true;
        this.activePiece.markDragging(true);
        this.audio.playUi();
      }

      if (this.isDragging) {
        this.activePiece.setPosition(pointer.x, pointer.y - DRAG_LIFT_Y);
        this.updatePreview(this.activePiece);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.activePiece || pointer.id !== this.dragPointerId) {
        return;
      }

      const piece = this.activePiece;
      if (this.isDragging) {
        this.tryDrop(piece);
      } else {
        this.tweens.add({
          targets: piece,
          x: piece.x + 5,
          duration: 45,
          yoyo: true,
          repeat: 2,
        });
        this.activePiece = null;
      }

      this.dragPointerId = null;
      this.pressOrigin = null;
      this.isDragging = false;
    });

    this.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (!this.activePiece || pointer.id !== this.dragPointerId) {
        return;
      }
      if (this.isDragging) {
        this.tryDrop(this.activePiece);
      } else {
        this.activePiece = null;
      }
      this.dragPointerId = null;
      this.pressOrigin = null;
      this.isDragging = false;
    });
  }

  private findPieceAt(x: number, y: number): PieceView | null {
    for (let i = this.pieceViews.length - 1; i >= 0; i--) {
      const piece = this.pieceViews[i]!;
      if (piece.containsPoint(x, y)) {
        return piece;
      }
    }
    return null;
  }

  private updatePreview(piece: PieceView): void {
    const origin = this.resolveOrigin(piece);
    const valid =
      origin !== null &&
      canPlace(this.boardManager.getBoard(), {
        piece: piece.shape,
        originX: origin.x,
        originY: origin.y,
      });
    this.boardView.showPreview(piece.shape, origin, valid);
  }

  private resolveOrigin(piece: PieceView): Coord | null {
    const cells = piece.shape.cells;
    const minX = Math.min(...cells.map((c) => c.x));
    const minY = Math.min(...cells.map((c) => c.y));
    const maxX = Math.max(...cells.map((c) => c.x));
    const maxY = Math.max(...cells.map((c) => c.y));
    const layout = this.boardView.getLayout();
    const stride = layout.cellSize + layout.gap;
    const width = (maxX - minX + 1) * stride - layout.gap;
    const height = (maxY - minY + 1) * stride - layout.gap;
    const topLeftX = piece.x - width / 2;
    const topLeftY = piece.y - height / 2;
    const cell = this.boardView.worldToCell(
      topLeftX + layout.cellSize / 2,
      topLeftY + layout.cellSize / 2,
    );
    if (!cell) {
      return null;
    }
    return { x: cell.x - minX, y: cell.y - minY };
  }

  private tryDrop(piece: PieceView): void {
    const origin = this.resolveOrigin(piece);
    this.boardView.clearPreview();
    piece.markDragging(false);
    this.activePiece = null;

    if (
      origin &&
      canPlace(this.boardManager.getBoard(), {
        piece: piece.shape,
        originX: origin.x,
        originY: origin.y,
      })
    ) {
      this.commitPlacement(piece, origin);
      return;
    }

    this.audio.playInvalid();
    piece.returnHome(true);
  }

  private commitPlacement(piece: PieceView, origin: Coord): void {
    const before = this.boardManager.getBoard();
    const previewCells = pieceCellsAt({
      piece: piece.shape,
      originX: origin.x,
      originY: origin.y,
    });
    const stamped = before.map((row) => [...row]);
    for (const c of previewCells) {
      stamped[c.y]![c.x] = piece.shape.colorId;
    }
    const lines = findCompletedLines(stamped);

    const outcome = this.boardManager.tryPlace(piece.trayIndex, origin.x, origin.y);
    if (!outcome.ok) {
      this.audio.playInvalid();
      piece.returnHome(true);
      return;
    }

    this.storage.setBestScore(outcome.bestScore ?? this.boardManager.getState().bestScore);
    this.boardView.clearPreview();
    piece.setVisible(false);

    // Show placed cells first, then clear animation, then final board.
    this.boardView.render(stamped);
    this.audio.playPlace();
    this.boardView.animatePlacement(previewCells, piece.shape.colorId);

    const finish = (): void => {
      this.boardView.render(this.boardManager.getBoard());
      this.refreshTray(true);
      this.scoreText.setText(`Score ${this.boardManager.getState().score}`);
      this.bestText.setText(`Best ${this.boardManager.getState().bestScore}`);
      this.pulseScore();

      if (outcome.breakdown && outcome.breakdown.total > 0 && lines.linesCleared > 0) {
        this.showScoreFloat(outcome.breakdown.total, lines.clearedCells);
      }

      if (outcome.isGameOver) {
        this.audio.playGameOver();
        this.showGameOver();
      }
    };

    if (lines.clearedCells.length > 0) {
      this.time.delayedCall(140, () => {
        this.audio.playClear(lines.linesCleared);
        this.boardView.animateClear(lines.clearedCells, finish);
      });
    } else {
      this.time.delayedCall(140, finish);
    }
  }

  private pulseScore(): void {
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.12,
      duration: 100,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  private showScoreFloat(points: number, cells: readonly Coord[]): void {
    if (cells.length === 0) {
      return;
    }
    let sumX = 0;
    let sumY = 0;
    for (const c of cells) {
      const w = this.boardView.cellToWorld(c.x, c.y);
      sumX += w.x;
      sumY += w.y;
    }
    const x = sumX / cells.length;
    const y = sumY / cells.length;

    const label = this.add
      .text(x, y, `+${points}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setAlpha(0);

    this.tweens.add({
      targets: label,
      y: y - 46,
      alpha: 1,
      duration: 220,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.tweens.add({
          targets: label,
          alpha: 0,
          y: y - 70,
          duration: 280,
          delay: 120,
          onComplete: () => label.destroy(),
        });
      },
    });
  }

  private renderAll(): void {
    const state = this.boardManager.getState();
    this.boardView.render(state.board);
    this.scoreText.setText(`Score ${state.score}`);
    this.bestText.setText(`Best ${state.bestScore}`);
  }

  private showTutorial(): void {
    this.inputLocked = true;
    const container = this.add.container(0, 0).setDepth(220);

    const dim = this.add.rectangle(
      DESIGN_WIDTH / 2,
      DESIGN_HEIGHT / 2,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      0x2a2550,
      0.55,
    );

    const panel = this.add.graphics();
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    panel.fillRoundedRect(DESIGN_WIDTH / 2 - 155, DESIGN_HEIGHT / 2 - 150, 310, 300, 28);

    const title = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 - 110, 'How to Play', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5);

    const body = this.add
      .text(
        DESIGN_WIDTH / 2,
        DESIGN_HEIGHT / 2 - 20,
        '1. Drag a piece from the tray\n    onto the board.\n\n2. Fill a full row or column\n    to clear it and score.\n\n3. Game over when none of your\n    remaining pieces can fit.',
        {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '15px',
          color: PALETTE.text,
          align: 'left',
          lineSpacing: 4,
        },
      )
      .setOrigin(0.5);

    const btn = this.add.graphics();
    btn.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.primaryPurple).color, 1);
    btn.fillRoundedRect(DESIGN_WIDTH / 2 - 90, DESIGN_HEIGHT / 2 + 95, 180, 46, 23);
    btn.setInteractive(
      new Phaser.Geom.Rectangle(DESIGN_WIDTH / 2 - 90, DESIGN_HEIGHT / 2 + 95, 180, 46),
      Phaser.Geom.Rectangle.Contains,
    );

    const btnLabel = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 + 118, 'Got it', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: PALETTE.white,
      })
      .setOrigin(0.5);

    const dismiss = (): void => {
      this.storage.setTutorialSeen(true);
      this.audio.playUi();
      container.destroy();
      this.overlay = undefined;
      this.inputLocked = false;
    };

    btn.on('pointerup', dismiss);
    container.add([dim, panel, title, body, btn, btnLabel]);
    this.overlay = container;
  }

  private showGameOver(): void {
    if (this.overlay) {
      this.overlay.destroy();
    }
    this.inputLocked = true;
    const state = this.boardManager.getState();
    const container = this.add.container(0, 0).setDepth(200);

    const dim = this.add.rectangle(
      DESIGN_WIDTH / 2,
      DESIGN_HEIGHT / 2,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      0x2a2550,
      0.58,
    );

    const panel = this.add.graphics();
    panel.fillStyle(0x6545d6, 0.14);
    panel.fillRoundedRect(DESIGN_WIDTH / 2 - 148, DESIGN_HEIGHT / 2 - 108, 296, 232, 28);
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    panel.fillRoundedRect(DESIGN_WIDTH / 2 - 150, DESIGN_HEIGHT / 2 - 110, 300, 228, 28);

    const title = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 - 58, 'Game Over', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5);

    const score = this.add
      .text(
        DESIGN_WIDTH / 2,
        DESIGN_HEIGHT / 2 - 8,
        `Score ${state.score}\nBest ${state.bestScore}`,
        {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '18px',
          color: PALETTE.text,
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.primaryPurple).color, 1);
    btnGfx.fillRoundedRect(DESIGN_WIDTH / 2 - 90, DESIGN_HEIGHT / 2 + 44, 180, 48, 24);
    btnGfx.setInteractive(
      new Phaser.Geom.Rectangle(DESIGN_WIDTH / 2 - 90, DESIGN_HEIGHT / 2 + 44, 180, 48),
      Phaser.Geom.Rectangle.Contains,
    );

    const buttonLabel = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 + 68, 'Play Again', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: PALETTE.white,
      })
      .setOrigin(0.5);

    const restart = (): void => {
      this.audio.playUi();
      this.overlay?.destroy();
      this.overlay = undefined;
      this.inputLocked = false;
      this.boardManager.restart(this.storage.getBestScore());
      this.refreshTray(true);
      this.renderAll();
    };

    btnGfx.on('pointerup', restart);

    container.add([dim, panel, title, score, btnGfx, buttonLabel]);
    this.overlay = container;
  }
}
