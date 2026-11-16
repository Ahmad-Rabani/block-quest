import Phaser from 'phaser';
import { BOARD_SIZE, PALETTE } from '../../domain/constants';
import { canPlace, findCompletedLines, pieceCellsAt } from '../../domain/puzzleRules';
import type { Coord } from '../../domain/types';
import { BoardManager } from '../systems/BoardManager';
import { BoardView } from '../objects/BoardView';
import { PieceView } from '../objects/PieceView';
import { StorageService } from '../../services/StorageService';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';

/** Lift piece above finger/cursor so the board preview stays visible. */
const DRAG_LIFT_Y = 92;
/** Movement threshold before a press becomes a drag. */
const DRAG_THRESHOLD = 8;

export class GameScene extends Phaser.Scene {
  private storage = new StorageService();
  private boardManager!: BoardManager;
  private boardView!: BoardView;
  private pieceViews: PieceView[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private trayPanel?: Phaser.GameObjects.Graphics;

  private activePiece: PieceView | null = null;
  private dragPointerId: number | null = null;
  private pressOrigin: { x: number; y: number } | null = null;
  private isDragging = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.background);
    this.drawBackdrop();

    const best = this.storage.getBestScore();
    this.boardManager = new BoardManager(best);

    this.createHeader();
    this.createBoard();
    this.drawTrayPanel();
    this.refreshTray();
    this.bindInput();
    this.renderAll();
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(-10);
    // Soft vignette / ambient blobs — premium atmosphere without clutter.
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
        fontSize: '30px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(5);

    const chipY = 82;
    const chipH = 36;
    const scoreChip = this.add.graphics().setDepth(5);
    scoreChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    scoreChip.fillRoundedRect(20, chipY - chipH / 2, 140, chipH, 18);
    scoreChip.fillStyle(0x6545d6, 0.08);
    scoreChip.fillRoundedRect(20, chipY - chipH / 2, 140, chipH, 18);

    const bestChip = this.add.graphics().setDepth(5);
    bestChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bestChip.fillRoundedRect(DESIGN_WIDTH - 160, chipY - chipH / 2, 140, chipH, 18);
    bestChip.fillStyle(0xff9b54, 0.1);
    bestChip.fillRoundedRect(DESIGN_WIDTH - 160, chipY - chipH / 2, 140, chipH, 18);

    this.scoreText = this.add
      .text(90, chipY, 'Score 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestText = this.add
      .text(DESIGN_WIDTH - 90, chipY, `Best ${this.boardManager.getState().bestScore}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);
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

    // Three soft slot pads for clear pick targets.
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

  private refreshTray(): void {
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
      this.pieceViews.push(view);
    });
  }

  private bindInput(): void {
    this.input.addPointer(2);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.overlay || this.activePiece) {
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
        // Short press without drag — gentle shake (no auto-place; drag is primary).
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
    // Prefer top-most / last drawn match within generous slot hit boxes.
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
      piece.returnHome(true);
      return;
    }

    this.storage.setBestScore(outcome.bestScore ?? this.boardManager.getState().bestScore);
    this.boardView.flashCleared(lines.clearedCells);
    this.boardView.clearPreview();
    this.refreshTray();
    this.renderAll();

    if (outcome.isGameOver) {
      this.showGameOver();
    }
  }

  private renderAll(): void {
    const state = this.boardManager.getState();
    this.boardView.render(state.board);
    this.scoreText.setText(`Score ${state.score}`);
    this.bestText.setText(`Best ${state.bestScore}`);
  }

  private showGameOver(): void {
    if (this.overlay) {
      this.overlay.destroy();
    }
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
      this.overlay?.destroy();
      this.overlay = undefined;
      this.boardManager.restart(this.storage.getBestScore());
      this.refreshTray();
      this.renderAll();
    };

    btnGfx.on('pointerup', restart);

    container.add([dim, panel, title, score, btnGfx, buttonLabel]);
    this.overlay = container;
  }
}
