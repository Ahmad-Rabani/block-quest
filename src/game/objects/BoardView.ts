import Phaser from 'phaser';
import { BOARD_SIZE, COLOR_HEX, EMPTY_CELL, PALETTE } from '../../domain/constants';
import type { BoardGrid, Coord, PieceShape } from '../../domain/types';

export interface BoardLayout {
  originX: number;
  originY: number;
  cellSize: number;
  gap: number;
}

export class BoardView {
  private readonly scene: Phaser.Scene;
  private readonly layout: BoardLayout;
  private readonly cellGraphics: Phaser.GameObjects.Graphics;
  private readonly hintGraphics: Phaser.GameObjects.Graphics;
  private readonly previewGraphics: Phaser.GameObjects.Graphics;
  private readonly boardBg: Phaser.GameObjects.Graphics;
  private readonly boardShadow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, layout: BoardLayout) {
    this.scene = scene;
    this.layout = layout;
    this.boardShadow = scene.add.graphics().setDepth(0);
    this.boardBg = scene.add.graphics().setDepth(1);
    this.cellGraphics = scene.add.graphics().setDepth(2);
    this.hintGraphics = scene.add.graphics().setDepth(3);
    this.previewGraphics = scene.add.graphics().setDepth(4);
    this.drawBackground();
  }

  getLayout(): BoardLayout {
    return this.layout;
  }

  getBoardBottom(): number {
    const { originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    return originY + BOARD_SIZE * stride - gap;
  }

  /** Convert pointer world position to board cell, or null if outside. */
  worldToCell(worldX: number, worldY: number): Coord | null {
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const localX = worldX - originX;
    const localY = worldY - originY;
    if (localX < 0 || localY < 0) {
      return null;
    }
    const x = Math.floor(localX / stride);
    const y = Math.floor(localY / stride);
    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) {
      return null;
    }
    return { x, y };
  }

  cellToWorld(x: number, y: number): { x: number; y: number } {
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    return {
      x: originX + x * stride + cellSize / 2,
      y: originY + y * stride + cellSize / 2,
    };
  }

  render(board: BoardGrid): void {
    this.cellGraphics.clear();
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const radius = Math.max(5, cellSize * 0.2);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const value = board[y]![x]!;
        const px = originX + x * stride;
        const py = originY + y * stride;

        if (value === EMPTY_CELL) {
          this.cellGraphics.fillStyle(
            Phaser.Display.Color.HexStringToColor(PALETTE.cellEmpty).color,
            1,
          );
          this.cellGraphics.fillRoundedRect(px, py, cellSize, cellSize, radius);
        } else {
          const hex = COLOR_HEX[value] ?? PALETTE.primaryPurple;
          const color = Phaser.Display.Color.HexStringToColor(hex).color;
          // Soft contact shadow
          this.cellGraphics.fillStyle(0x2a2550, 0.14);
          this.cellGraphics.fillRoundedRect(px + 1, py + 2, cellSize, cellSize, radius);
          this.cellGraphics.fillStyle(color, 1);
          this.cellGraphics.fillRoundedRect(px, py, cellSize, cellSize, radius);
          this.cellGraphics.fillStyle(0xffffff, 0.2);
          this.cellGraphics.fillRoundedRect(
            px + 2,
            py + 2,
            cellSize - 4,
            Math.max(4, cellSize * 0.28),
            radius * 0.55,
          );
        }
      }
    }
  }

  showPreview(piece: PieceShape, origin: Coord | null, valid: boolean): void {
    this.previewGraphics.clear();
    if (!origin) {
      return;
    }
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const radius = Math.max(5, cellSize * 0.2);
    const color = Phaser.Display.Color.HexStringToColor(
      valid ? PALETTE.primaryPurple : '#FF5A5A',
    ).color;

    this.previewGraphics.fillStyle(color, valid ? 0.38 : 0.32);
    for (const c of piece.cells) {
      const x = origin.x + c.x;
      const y = origin.y + c.y;
      if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) {
        continue;
      }
      const px = originX + x * stride;
      const py = originY + y * stride;
      this.previewGraphics.fillRoundedRect(px, py, cellSize, cellSize, radius);
    }
  }

  clearPreview(): void {
    this.previewGraphics.clear();
  }

  /** Soft pulse on empty cells that nearly complete a line. */
  showNearCompleteHints(cells: readonly Coord[]): void {
    this.hintGraphics.clear();
    if (cells.length === 0) {
      return;
    }
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const radius = Math.max(5, cellSize * 0.2);
    const color = Phaser.Display.Color.HexStringToColor(PALETTE.orange).color;

    this.hintGraphics.fillStyle(color, 0.22);
    for (const c of cells) {
      if (c.x < 0 || c.y < 0 || c.x >= BOARD_SIZE || c.y >= BOARD_SIZE) {
        continue;
      }
      const px = originX + c.x * stride;
      const py = originY + c.y * stride;
      this.hintGraphics.fillRoundedRect(px, py, cellSize, cellSize, radius);
    }
  }

  clearHints(): void {
    this.hintGraphics.clear();
  }

  /** Brief pop on newly placed cells. */
  animatePlacement(cells: readonly Coord[], colorId: number): void {
    if (cells.length === 0) {
      return;
    }
    const hex = COLOR_HEX[colorId] ?? PALETTE.primaryPurple;
    const color = Phaser.Display.Color.HexStringToColor(hex).color;
    const { cellSize } = this.layout;
    const radius = Math.max(5, cellSize * 0.2);

    for (const c of cells) {
      const world = this.cellToWorld(c.x, c.y);
      const g = this.scene.add.graphics().setDepth(5);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, radius);
      g.setPosition(world.x, world.y);
      g.setScale(0.55);
      g.setAlpha(0.95);
      this.scene.tweens.add({
        targets: g,
        scale: 1.08,
        duration: 120,
        ease: 'Back.Out',
        yoyo: true,
        hold: 20,
        onComplete: () => g.destroy(),
      });
    }
  }

  /** Bright flash then shrink/fade cleared cells. */
  animateClear(cells: readonly Coord[], onDone?: () => void): void {
    if (cells.length === 0) {
      onDone?.();
      return;
    }

    const { cellSize } = this.layout;
    const radius = Math.max(5, cellSize * 0.2);
    const overlays: Phaser.GameObjects.Graphics[] = [];

    for (const c of cells) {
      const world = this.cellToWorld(c.x, c.y);
      const g = this.scene.add.graphics().setDepth(6);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, radius);
      g.setPosition(world.x, world.y);
      overlays.push(g);
    }

    this.scene.tweens.add({
      targets: overlays,
      scale: 1.15,
      duration: 90,
      ease: 'Quad.Out',
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: overlays,
          scale: 0.15,
          alpha: 0,
          duration: 220,
          ease: 'Cubic.In',
          onComplete: () => {
            for (const g of overlays) {
              g.destroy();
            }
            onDone?.();
          },
        });
      },
    });
  }

  /** @deprecated Prefer animateClear — kept for call-site compatibility during transition. */
  flashCleared(cells: readonly Coord[]): void {
    this.animateClear(cells);
  }

  private drawBackground(): void {
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const pad = 14;
    const size = BOARD_SIZE * stride - gap;

    this.boardShadow.fillStyle(0x6545d6, 0.12);
    this.boardShadow.fillRoundedRect(
      originX - pad + 4,
      originY - pad + 8,
      size + pad * 2,
      size + pad * 2,
      22,
    );

    this.boardBg.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    this.boardBg.fillRoundedRect(
      originX - pad,
      originY - pad,
      size + pad * 2,
      size + pad * 2,
      22,
    );
  }
}
