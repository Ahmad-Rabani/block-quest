import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';
import { canPlace, findCompletedLines, pieceCellsAt } from '../../domain/puzzleRules';
import type { Coord } from '../../domain/types';
import { BoardManager } from '../systems/BoardManager';
import { localDayKey } from '../systems/PieceGenerator';
import { BoardView } from '../objects/BoardView';
import { PieceView } from '../objects/PieceView';
import { AudioService } from '../../services/AudioService';
import { HapticsService } from '../../services/HapticsService';
import { NativeLifecycleService } from '../../services/NativeLifecycleService';
import { StorageService } from '../../services/StorageService';
import { DESIGN_WIDTH } from '../config/gameConfig';
import { computeBoardMetrics, computeTrayLayout, LAYOUT } from '../ui/layout';
import { fitTrayCellSize } from '../ui/trayFit';
import { showClearBanner } from '../ui/ClearBanner';
import { createCenteredModal } from '../ui/ModalFactory';

const DRAG_LIFT_Y = 92;
const DRAG_THRESHOLD = 8;

export class GameScene extends Phaser.Scene {
  private storage = new StorageService();
  private audio!: AudioService;
  private haptics!: HapticsService;
  private nativeLifecycle!: NativeLifecycleService;
  private boardManager!: BoardManager;
  private boardView!: BoardView;
  private pieceViews: PieceView[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private undoText!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private overlayKind: 'none' | 'tutorial' | 'gameover' | 'settings' = 'none';
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
    this.haptics = new HapticsService(this.storage.isHapticsEnabled());
    this.nativeLifecycle = new NativeLifecycleService(this.audio);
    void this.nativeLifecycle.start();
    this.nativeLifecycle.setBackButtonHandler(() => this.handleAndroidBack());

    this.drawBackdrop();

    const best = this.storage.getBestScore();
    this.boardManager = new BoardManager(best);
    this.boardManager.restartClassic(best);

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

  shutdown(): void {
    this.nativeLifecycle?.stop();
  }

  /** @returns true if the back press was consumed by the game UI. */
  private handleAndroidBack(): boolean {
    if (
      (this.overlayKind === 'tutorial' || this.overlayKind === 'settings') &&
      this.overlay
    ) {
      if (this.overlayKind === 'tutorial') {
        this.storage.setTutorialSeen(true);
      }
      this.audio.playUi();
      this.overlay.destroy();
      this.overlay = undefined;
      this.overlayKind = 'none';
      this.inputLocked = false;
      return true;
    }
    // Game-over and empty overlays: let native layer minimize the app.
    return false;
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(0x6545d6, 0.06);
    g.fillCircle(DESIGN_WIDTH * 0.15, 120, 140);
    g.fillStyle(0x42a5f5, 0.07);
    g.fillCircle(DESIGN_WIDTH * 0.9, 280, 160);
    g.fillStyle(0xff9b54, 0.05);
    g.fillCircle(DESIGN_WIDTH * 0.3, 760, 120);
  }

  private createHeader(): void {
    this.add
      .text(DESIGN_WIDTH / 2, LAYOUT.titleY, 'BLOCK QUEST', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(5);

    const chipY = LAYOUT.chipY;
    const chipH = LAYOUT.chipH;
    const left = LAYOUT.screenMargin;
    const right = DESIGN_WIDTH - LAYOUT.screenMargin;
    const chipW = 112;

    const scoreChip = this.add.graphics().setDepth(5);
    scoreChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    scoreChip.fillRoundedRect(left, chipY - chipH / 2, chipW, chipH, 18);
    scoreChip.fillStyle(0x6545d6, 0.08);
    scoreChip.fillRoundedRect(left, chipY - chipH / 2, chipW, chipH, 18);

    const bestChip = this.add.graphics().setDepth(5);
    bestChip.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bestChip.fillRoundedRect(right - chipW, chipY - chipH / 2, chipW, chipH, 18);
    bestChip.fillStyle(0xff9b54, 0.1);
    bestChip.fillRoundedRect(right - chipW, chipY - chipH / 2, chipW, chipH, 18);

    this.scoreText = this.add
      .text(left + chipW / 2, chipY, 'Score 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestText = this.add
      .text(right - chipW / 2, chipY, 'Best 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: PALETTE.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.createModeControls();
    this.createUndoButton();
    this.createSettingsButton();
  }

  private createModeControls(): void {
    const y = LAYOUT.chipY;
    const classic = this.add
      .text(DESIGN_WIDTH / 2 - 36, y, 'Classic', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });

    const daily = this.add
      .text(DESIGN_WIDTH / 2 + 36, y, 'Daily', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#7A7499',
      })
      .setOrigin(0.5)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });

    const setActive = (mode: 'classic' | 'daily'): void => {
      classic.setColor(mode === 'classic' ? PALETTE.primaryPurple : '#7A7499');
      daily.setColor(mode === 'daily' ? PALETTE.primaryPurple : '#7A7499');
    };

    classic.on('pointerup', () => {
      if (this.inputLocked || this.overlay) {
        return;
      }
      this.audio.playUi();
      this.boardManager.restartClassic(this.storage.getBestScore());
      setActive('classic');
      this.refreshTray(true);
      this.renderAll();
      this.updateUndoLabel();
    });

    daily.on('pointerup', () => {
      if (this.inputLocked || this.overlay) {
        return;
      }
      this.audio.playUi();
      const day = localDayKey();
      this.boardManager.restartDaily(this.storage.getDailyBest(day), day);
      setActive('daily');
      this.refreshTray(true);
      this.renderAll();
      this.updateUndoLabel();
    });
  }

  private createUndoButton(): void {
    const x = LAYOUT.screenMargin + 28;
    const y = LAYOUT.titleY;
    const bg = this.add.graphics().setDepth(8);
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bg.fillRoundedRect(x - 34, y - 14, 68, 28, 14);
    bg.fillStyle(0x6545d6, 0.08);
    bg.fillRoundedRect(x - 34, y - 14, 68, 28, 14);
    bg.setInteractive(new Phaser.Geom.Rectangle(x - 34, y - 14, 68, 28), Phaser.Geom.Rectangle.Contains);

    this.undoText = this.add
      .text(x, y, 'Undo 3', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(9);

    bg.on('pointerup', () => this.handleUndo());
  }

  private createSettingsButton(): void {
    const bx = DESIGN_WIDTH - LAYOUT.screenMargin - 18;
    const by = LAYOUT.titleY;
    const bg = this.add.graphics().setDepth(8);
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    bg.fillRoundedRect(bx - 28, by - 14, 56, 28, 14);
    bg.fillStyle(0x6545d6, 0.08);
    bg.fillRoundedRect(bx - 28, by - 14, 56, 28, 14);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(bx - 28, by - 14, 56, 28),
      Phaser.Geom.Rectangle.Contains,
    );

    this.add
      .text(bx, by, 'Menu', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: PALETTE.primaryPurple,
      })
      .setOrigin(0.5)
      .setDepth(9);

    bg.on('pointerup', () => {
      if (this.inputLocked || this.overlay || this.isDragging) {
        return;
      }
      this.showSettings();
    });
  }

  private createBoard(): void {
    const m = computeBoardMetrics();
    this.boardView = new BoardView(this, {
      originX: m.originX,
      originY: m.originY,
      cellSize: m.cellSize,
      gap: m.gap,
    });
  }

  private drawTrayPanel(): void {
    const board = computeBoardMetrics();
    const tray = computeTrayLayout(board.boardBottom, board.cellSize);

    this.trayPanel?.destroy();
    this.trayPanel = this.add.graphics().setDepth(4);

    this.trayPanel.fillStyle(0x6545d6, 0.1);
    this.trayPanel.fillRoundedRect(
      tray.panelLeft + 3,
      tray.panelTop + 5,
      tray.panelWidth,
      tray.panelHeight,
      24,
    );
    this.trayPanel.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    this.trayPanel.fillRoundedRect(
      tray.panelLeft,
      tray.panelTop,
      tray.panelWidth,
      tray.panelHeight,
      24,
    );

    for (let i = 0; i < 3; i++) {
      const sx =
        tray.panelLeft + LAYOUT.trayInnerPad + i * (tray.slotWidth + LAYOUT.traySlotGap);
      this.trayPanel.fillStyle(0x6545d6, 0.06);
      this.trayPanel.fillRoundedRect(sx, tray.slotY, tray.slotWidth, tray.slotHeight, 16);
    }
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

    const board = computeBoardMetrics();
    const layout = computeTrayLayout(board.boardBottom, board.cellSize);
    const tray = this.boardManager.getTray();

    tray.forEach((slot, index) => {
      if (!slot.available) {
        return;
      }
      const center = layout.slotCenters[index]!;
      const cellSize = fitTrayCellSize(
        slot.shape,
        layout.slotWidth,
        layout.slotHeight,
        layout.cellSize,
        layout.gap,
      );
      const view = new PieceView(this, {
        trayIndex: index,
        shape: slot.shape,
        cellSize,
        gap: layout.gap,
        centerX: center.x,
        centerY: center.y,
        hitWidth: layout.hitWidth,
        hitHeight: layout.hitHeight,
      });
      view.setHomeScale(1);
      if (animate) {
        view.setScale(0.72);
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
    void this.haptics.tickLight();
    piece.returnHome(true);
  }

  private handleUndo(): void {
    if (this.inputLocked || this.overlay || this.isDragging) {
      return;
    }
    if (!this.boardManager.canUndo()) {
      this.audio.playInvalid();
      void this.haptics.tickLight();
      return;
    }
    this.audio.playUi();
    void this.haptics.tickLight();
    this.boardManager.undo();
    this.refreshTray(false);
    this.renderAll();
    this.updateUndoLabel();
  }

  private persistScore(score: number, bestScore: number): void {
    if (this.boardManager.getMode() === 'daily') {
      const day = this.boardManager.getDayKey() ?? localDayKey();
      this.storage.setDailyBest(day, score);
    } else {
      this.storage.setBestScore(bestScore);
    }
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
      void this.haptics.tickLight();
      piece.returnHome(true);
      return;
    }

    this.persistScore(
      outcome.score ?? this.boardManager.getState().score,
      outcome.bestScore ?? this.boardManager.getState().bestScore,
    );
    this.boardView.clearPreview();
    piece.setVisible(false);
    this.updateUndoLabel();

    this.boardView.render(stamped);
    this.audio.playPlace();
    void this.haptics.tickLight();
    this.boardView.animatePlacement(previewCells, piece.shape.colorId);

    const finish = (): void => {
      this.boardView.render(this.boardManager.getBoard());
      this.refreshTray(true);
      this.renderAll();
      this.pulseScore();

      if (outcome.breakdown && outcome.breakdown.total > 0 && lines.linesCleared > 0) {
        this.showScoreFloat(outcome.breakdown.total, lines.clearedCells);
        showClearBanner(
          this,
          lines.linesCleared,
          outcome.combo ?? this.boardManager.getState().combo,
        );
      }

      if (outcome.isGameOver) {
        this.audio.playGameOver();
        void this.haptics.tickMedium();
        this.showGameOver();
      }
    };

    if (lines.clearedCells.length > 0) {
      this.time.delayedCall(140, () => {
        this.audio.playClear(lines.linesCleared);
        void this.haptics.tickMedium();
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

  private updateUndoLabel(): void {
    this.undoText.setText(`Undo ${this.boardManager.getUndosRemaining()}`);
    this.undoText.setAlpha(this.boardManager.canUndo() || this.boardManager.getUndosRemaining() > 0 ? 1 : 0.45);
  }

  private renderAll(): void {
    const state = this.boardManager.getState();
    this.boardView.render(state.board);
    this.scoreText.setText(`Score ${state.score}`);

    if (this.boardManager.getMode() === 'daily') {
      const day = this.boardManager.getDayKey() ?? localDayKey();
      const dailyBest = Math.max(state.bestScore, this.storage.getDailyBest(day));
      this.bestText.setText(`Best ${dailyBest}`);
    } else {
      this.bestText.setText(`Best ${state.bestScore}`);
    }
    this.updateUndoLabel();
  }

  private closeOverlay(): void {
    this.overlay?.destroy();
    this.overlay = undefined;
    this.overlayKind = 'none';
    this.inputLocked = false;
  }

  private showSettings(): void {
    this.inputLocked = true;
    this.overlayKind = 'settings';
    this.overlay?.destroy();

    const soundLabel = this.audio.isMuted() ? 'Sound: Off' : 'Sound: On';
    const hapticsLabel = this.haptics.isEnabled() ? 'Haptics: On' : 'Haptics: Off';

    this.overlay = createCenteredModal(this, {
      title: 'Settings',
      body: `${soundLabel}\n${hapticsLabel}\n\nBlock Quest v0.1.0\nOffline puzzle — no account needed.`,
      depth: 220,
      buttons: [
        {
          label: soundLabel,
          onClick: () => {
            const next = !this.audio.isMuted();
            this.audio.setMuted(next);
            this.storage.setMuted(next);
            if (!next) {
              this.audio.playUi();
            }
            void this.haptics.tickLight();
            this.showSettings();
          },
        },
        {
          label: hapticsLabel,
          onClick: () => {
            const next = !this.haptics.isEnabled();
            this.haptics.setEnabled(next);
            this.storage.setHapticsEnabled(next);
            this.audio.playUi();
            if (next) {
              void this.haptics.tickMedium();
            }
            this.showSettings();
          },
        },
        {
          label: 'How to Play',
          onClick: () => {
            this.audio.playUi();
            this.closeOverlay();
            this.showTutorial();
          },
        },
        {
          label: 'Close',
          onClick: () => {
            this.audio.playUi();
            this.closeOverlay();
          },
        },
      ],
    });
  }

  private showTutorial(): void {
    this.inputLocked = true;
    this.overlayKind = 'tutorial';
    this.overlay = createCenteredModal(this, {
      title: 'How to Play',
      body:
        'Drag pieces from the tray onto the board.\n\nClear full rows or columns to score.\n\nUse Undo (3 per run) if you need a second chance.\n\nTry Daily for a shared puzzle each day.\n\nOpen Menu for sound and haptics.',
      depth: 220,
      buttons: [
        {
          label: 'Got it',
          onClick: () => {
            this.storage.setTutorialSeen(true);
            this.audio.playUi();
            this.closeOverlay();
          },
        },
      ],
    });
  }

  private showGameOver(): void {
    this.overlay?.destroy();
    this.inputLocked = true;
    this.overlayKind = 'gameover';
    const state = this.boardManager.getState();
    const mode = this.boardManager.getMode();
    const title = mode === 'daily' ? 'Daily Complete' : 'Game Over';

    this.overlay = createCenteredModal(this, {
      title,
      subtitle: `Score ${state.score}\nBest ${state.bestScore}`,
      body:
        mode === 'daily'
          ? 'Come back tomorrow for a new challenge.'
          : 'None of your remaining pieces can fit.',
      depth: 200,
      buttons: [
        {
          label: 'Play Again',
          onClick: () => {
            this.audio.playUi();
            this.overlay?.destroy();
            this.overlay = undefined;
            this.overlayKind = 'none';
            this.inputLocked = false;
            if (mode === 'daily') {
              const day = this.boardManager.getDayKey() ?? localDayKey();
              this.boardManager.restartDaily(this.storage.getDailyBest(day), day);
            } else {
              this.boardManager.restartClassic(this.storage.getBestScore());
            }
            this.refreshTray(true);
            this.renderAll();
          },
        },
      ],
    });
  }
}
