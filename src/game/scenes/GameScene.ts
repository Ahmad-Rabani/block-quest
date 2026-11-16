import Phaser from 'phaser';
import { BOARD_SIZE, PALETTE } from '../../domain/constants';
import { canPlace, findCompletedLines, pieceCellsAt } from '../../domain/puzzleRules';
import type { Coord } from '../../domain/types';
import { BoardManager } from '../systems/BoardManager';
import { BoardView } from '../objects/BoardView';
import { PieceView } from '../objects/PieceView';
import { StorageService } from '../../services/StorageService';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
  private storage = new StorageService();
  private boardManager!: BoardManager;
  private boardView!: BoardView;
  private pieceViews: PieceView[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private activePiece: PieceView | null = null;
  private pointerDownAt: { x: number; y: number; time: number } | null = null;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.background);
    const best = this.storage.getBestScore();
    this.boardManager = new BoardManager(best);

    this.createHeader();
    this.createBoard();
    this.refreshTray();
    this.bindInput();
    this.renderAll();
  }

  private createHeader(): void {
    this.add
      .text(DESIGN_WIDTH / 2, 48, 'BLOCK QUEST', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(32, 88, 'Score 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        color: PALETTE.text,
      })
      .setOrigin(0, 0.5);

    this.bestText = this.add
      .text(DESIGN_WIDTH - 32, 88, `Best ${this.boardManager.getState().bestScore}`, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        color: PALETTE.text,
      })
      .setOrigin(1, 0.5);
  }

  private createBoard(): void {
    const gap = 4;
    const horizontalPad = 28;
    const available = DESIGN_WIDTH - horizontalPad * 2;
    const cellSize = Math.floor((available - gap * (BOARD_SIZE - 1)) / BOARD_SIZE);
    const boardPixel = BOARD_SIZE * (cellSize + gap) - gap;
    const originX = (DESIGN_WIDTH - boardPixel) / 2;
    const originY = 130;

    this.boardView = new BoardView(this, { originX, originY, cellSize, gap });
  }

  private refreshTray(): void {
    for (const view of this.pieceViews) {
      view.destroy();
    }
    this.pieceViews = [];

    const tray = this.boardManager.getTray();
    const trayY = DESIGN_HEIGHT - 150;
    const slotWidth = DESIGN_WIDTH / 3;
    const cellSize = Math.max(18, Math.floor(this.boardView.getLayout().cellSize * 0.72));
    const gap = 3;

    tray.forEach((slot, index) => {
      if (!slot.available) {
        return;
      }
      const centerX = slotWidth * index + slotWidth / 2;
      const view = new PieceView(this, {
        trayIndex: index,
        shape: slot.shape,
        cellSize,
        gap,
        centerX,
        centerY: trayY,
      });
      this.pieceViews.push(view);
    });
  }

  private bindInput(): void {
    this.input.on(
      'dragstart',
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
      ) => {
        if (!(gameObject instanceof PieceView)) {
          return;
        }
        this.activePiece = gameObject;
        gameObject.markDragging(true);
        this.pointerDownAt = null;
      },
    );

    this.input.on(
      'drag',
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number,
      ) => {
        if (!(gameObject instanceof PieceView)) {
          return;
        }
        gameObject.setPosition(dragX, dragY);
        this.updatePreview(gameObject);
      },
    );

    this.input.on(
      'dragend',
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
      ) => {
        if (!(gameObject instanceof PieceView)) {
          return;
        }
        this.tryDrop(gameObject);
      },
    );

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDownAt = { x: pointer.x, y: pointer.y, time: this.time.now };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerDownAt || this.activePiece) {
        this.pointerDownAt = null;
        return;
      }
      const dx = pointer.x - this.pointerDownAt.x;
      const dy = pointer.y - this.pointerDownAt.y;
      const dt = this.time.now - this.pointerDownAt.time;
      this.pointerDownAt = null;
      if (Math.hypot(dx, dy) > 12 || dt > 350) {
        return;
      }
      this.handleTapToPlace(pointer);
    });
  }

  private handleTapToPlace(pointer: Phaser.Input.Pointer): void {
    const hit = this.pieceViews.find((p) => {
      const bounds = p.getBounds();
      return bounds.contains(pointer.x, pointer.y);
    });
    if (!hit) {
      return;
    }
    // Place at first valid origin when tapping a piece (quick assist).
    const board = this.boardManager.getBoard();
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (canPlace(board, { piece: hit.shape, originX: x, originY: y })) {
          this.commitPlacement(hit, { x, y });
          return;
        }
      }
    }
    this.tweens.add({
      targets: hit,
      x: hit.x + 6,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
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
    // Anchor = top-left cell of shape bounding box relative to piece center.
    const cells = piece.shape.cells;
    const minX = Math.min(...cells.map((c) => c.x));
    const minY = Math.min(...cells.map((c) => c.y));
    const maxX = Math.max(...cells.map((c) => c.x));
    const maxY = Math.max(...cells.map((c) => c.y));
    const stride = this.boardView.getLayout().cellSize + this.boardView.getLayout().gap;
    const width = (maxX - minX + 1) * stride - this.boardView.getLayout().gap;
    const height = (maxY - minY + 1) * stride - this.boardView.getLayout().gap;
    const topLeftX = piece.x - width / 2;
    const topLeftY = piece.y - height / 2;
    const cell = this.boardView.worldToCell(
      topLeftX + this.boardView.getLayout().cellSize / 2,
      topLeftY + this.boardView.getLayout().cellSize / 2,
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
    // Capture lines that will clear after stamp for flash feedback.
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
      0.55,
    );
    const panel = this.add.rectangle(
      DESIGN_WIDTH / 2,
      DESIGN_HEIGHT / 2,
      300,
      220,
      Phaser.Display.Color.HexStringToColor(PALETTE.white).color,
      1,
    );
    panel.setStrokeStyle(0);

    const title = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 - 60, 'Game Over', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5);

    const score = this.add
      .text(
        DESIGN_WIDTH / 2,
        DESIGN_HEIGHT / 2 - 16,
        `Score ${state.score}\nBest ${state.bestScore}`,
        {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '18px',
          color: PALETTE.text,
          align: 'center',
        },
      )
      .setOrigin(0.5);

    const button = this.add
      .rectangle(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 + 64, 160, 44, Phaser.Display.Color.HexStringToColor(PALETTE.primaryPurple).color)
      .setInteractive({ useHandCursor: true });

    const buttonLabel = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 + 64, 'Play Again', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: PALETTE.white,
      })
      .setOrigin(0.5);

    button.on('pointerup', () => {
      this.overlay?.destroy();
      this.overlay = undefined;
      this.boardManager.restart(this.storage.getBestScore());
      this.refreshTray();
      this.renderAll();
    });

    container.add([dim, panel, title, score, button, buttonLabel]);
    this.overlay = container;
  }
}
