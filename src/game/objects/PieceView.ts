import Phaser from 'phaser';
import { COLOR_HEX, PALETTE } from '../../domain/constants';
import type { PieceShape } from '../../domain/types';

export interface PieceViewConfig {
  trayIndex: number;
  shape: PieceShape;
  cellSize: number;
  gap: number;
  centerX: number;
  centerY: number;
}

/**
 * Interactive tray piece: drag to board or tap-to-place via GameScene.
 */
export class PieceView extends Phaser.GameObjects.Container {
  readonly trayIndex: number;
  readonly shape: PieceShape;
  private readonly cellSize: number;
  private readonly gap: number;
  private homeX: number;
  private homeY: number;
  private dragging = false;

  constructor(scene: Phaser.Scene, config: PieceViewConfig) {
    super(scene, config.centerX, config.centerY);
    this.trayIndex = config.trayIndex;
    this.shape = config.shape;
    this.cellSize = config.cellSize;
    this.gap = config.gap;
    this.homeX = config.centerX;
    this.homeY = config.centerY;

    this.drawShape();
    this.setSize(this.getBoundsWidth(), this.getBoundsHeight());
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.getBoundsWidth() / 2,
        -this.getBoundsHeight() / 2,
        this.getBoundsWidth(),
        this.getBoundsHeight(),
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    scene.input.setDraggable(this);
    scene.add.existing(this);
  }

  isDragging(): boolean {
    return this.dragging;
  }

  setHome(x: number, y: number): void {
    this.homeX = x;
    this.homeY = y;
  }

  returnHome(animate: boolean = true): void {
    this.dragging = false;
    this.setScale(1);
    if (animate) {
      this.scene.tweens.add({
        targets: this,
        x: this.homeX,
        y: this.homeY,
        duration: 160,
        ease: 'Back.Out',
      });
    } else {
      this.setPosition(this.homeX, this.homeY);
    }
  }

  markDragging(active: boolean): void {
    this.dragging = active;
    this.setScale(active ? 1.08 : 1);
    if (active) {
      this.setDepth(100);
    } else {
      this.setDepth(10);
    }
  }

  private drawShape(): void {
    const colorHex = COLOR_HEX[this.shape.colorId] ?? PALETTE.primaryPurple;
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const stride = this.cellSize + this.gap;
    const radius = Math.max(3, this.cellSize * 0.2);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of this.shape.cells) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y);
    }

    const width = (maxX - minX + 1) * stride - this.gap;
    const height = (maxY - minY + 1) * stride - this.gap;
    const offsetX = -width / 2;
    const offsetY = -height / 2;

    const g = this.scene.add.graphics();
    g.fillStyle(color, 1);
    for (const c of this.shape.cells) {
      const px = offsetX + (c.x - minX) * stride;
      const py = offsetY + (c.y - minY) * stride;
      g.fillRoundedRect(px, py, this.cellSize, this.cellSize, radius);
    }
    this.add(g);
  }

  private getBoundsWidth(): number {
    const xs = this.shape.cells.map((c) => c.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const stride = this.cellSize + this.gap;
    return (maxX - minX + 1) * stride - this.gap + 8;
  }

  private getBoundsHeight(): number {
    const ys = this.shape.cells.map((c) => c.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const stride = this.cellSize + this.gap;
    return (maxY - minY + 1) * stride - this.gap + 8;
  }
}
