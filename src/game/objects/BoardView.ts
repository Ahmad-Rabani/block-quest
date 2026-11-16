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
  private readonly previewGraphics: Phaser.GameObjects.Graphics;
  private readonly boardBg: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, layout: BoardLayout) {
    this.scene = scene;
    this.layout = layout;
    this.boardBg = scene.add.graphics();
    this.cellGraphics = scene.add.graphics();
    this.previewGraphics = scene.add.graphics();
    this.drawBackground();
  }

  getLayout(): BoardLayout {
    return this.layout;
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
    const radius = Math.max(4, cellSize * 0.18);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const value = board[y]![x]!;
        const px = originX + x * stride;
        const py = originY + y * stride;
        if (value === EMPTY_CELL) {
          this.cellGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.cellEmpty).color, 1);
        } else {
          const hex = COLOR_HEX[value] ?? PALETTE.primaryPurple;
          this.cellGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(hex).color, 1);
        }
        this.cellGraphics.fillRoundedRect(px, py, cellSize, cellSize, radius);
      }
    }
  }

  showPreview(
    piece: PieceShape,
    origin: Coord | null,
    valid: boolean,
  ): void {
    this.previewGraphics.clear();
    if (!origin) {
      return;
    }
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const radius = Math.max(4, cellSize * 0.18);
    const color = Phaser.Display.Color.HexStringToColor(
      valid ? PALETTE.primaryPurple : '#FF5A5A',
    ).color;
    const alpha = valid ? 0.4 : 0.35;

    this.previewGraphics.fillStyle(color, alpha);
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

  flashCleared(cells: readonly Coord[]): void {
    if (cells.length === 0) {
      return;
    }
    const flash = this.scene.add.graphics();
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const radius = Math.max(4, cellSize * 0.18);
    flash.fillStyle(0xffffff, 0.85);
    for (const c of cells) {
      const px = originX + c.x * stride;
      const py = originY + c.y * stride;
      flash.fillRoundedRect(px, py, cellSize, cellSize, radius);
    }
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 220,
      onComplete: () => flash.destroy(),
    });
  }

  private drawBackground(): void {
    const { originX, originY, cellSize, gap } = this.layout;
    const stride = cellSize + gap;
    const pad = gap * 2;
    const size = BOARD_SIZE * stride - gap;
    this.boardBg.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
    this.boardBg.fillRoundedRect(
      originX - pad,
      originY - pad,
      size + pad * 2,
      size + pad * 2,
      18,
    );
  }
}
