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
  /** Generous hit box — usually full tray slot size. */
  hitWidth: number;
  hitHeight: number;
}

/**
 * Tray piece view. Hit area is the full tray slot, not just the drawn blocks,
 * so touch/mouse picking stays reliable. Visual size is fitted to the slot.
 */
export class PieceView extends Phaser.GameObjects.Container {
  readonly trayIndex: number;
  readonly shape: PieceShape;
  private readonly cellSize: number;
  private readonly gap: number;
  private readonly hitWidth: number;
  private readonly hitHeight: number;
  private homeX: number;
  private homeY: number;
  private homeScale = 1;
  private dragging = false;
  private readonly shapeGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: PieceViewConfig) {
    super(scene, config.centerX, config.centerY);
    this.trayIndex = config.trayIndex;
    this.shape = config.shape;
    this.cellSize = config.cellSize;
    this.gap = config.gap;
    this.hitWidth = config.hitWidth;
    this.hitHeight = config.hitHeight;
    this.homeX = config.centerX;
    this.homeY = config.centerY;

    this.shapeGraphics = scene.add.graphics();
    this.add(this.shapeGraphics);
    this.drawShape();

    this.setSize(this.hitWidth, this.hitHeight);
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.hitWidth / 2,
        -this.hitHeight / 2,
        this.hitWidth,
        this.hitHeight,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    scene.add.existing(this);
    this.setDepth(10);
  }

  isDragging(): boolean {
    return this.dragging;
  }

  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x - this.hitWidth / 2 &&
      x <= this.x + this.hitWidth / 2 &&
      y >= this.y - this.hitHeight / 2 &&
      y <= this.y + this.hitHeight / 2
    );
  }

  getVisualWidth(): number {
    return this.measureVisual().width;
  }

  getVisualHeight(): number {
    return this.measureVisual().height;
  }

  setHome(x: number, y: number): void {
    this.homeX = x;
    this.homeY = y;
  }

  setHomeScale(scale: number): void {
    this.homeScale = scale;
    this.setScale(scale);
  }

  getHomeScale(): number {
    return this.homeScale;
  }

  returnHome(animate: boolean = true): void {
    this.dragging = false;
    this.setAlpha(1);
    this.setDepth(10);
    if (animate) {
      this.scene.tweens.add({
        targets: this,
        x: this.homeX,
        y: this.homeY,
        scale: this.homeScale,
        duration: 180,
        ease: 'Back.Out',
      });
    } else {
      this.setPosition(this.homeX, this.homeY);
      this.setScale(this.homeScale);
    }
  }

  markDragging(active: boolean): void {
    this.dragging = active;
    if (active) {
      this.setDepth(120);
      this.setScale(this.homeScale * 1.14);
      this.setAlpha(0.95);
    } else {
      this.setDepth(10);
      this.setScale(this.homeScale);
      this.setAlpha(1);
    }
  }

  private measureVisual(): {
    width: number;
    height: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
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
    const stride = this.cellSize + this.gap;
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: (maxX - minX + 1) * stride - this.gap,
      height: (maxY - minY + 1) * stride - this.gap,
    };
  }

  private drawShape(): void {
    const colorHex = COLOR_HEX[this.shape.colorId] ?? PALETTE.primaryPurple;
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const highlight = Phaser.Display.Color.HexStringToColor('#FFFFFF').color;
    const stride = this.cellSize + this.gap;
    const radius = Math.max(4, this.cellSize * 0.22);
    const { minX, minY, width, height } = this.measureVisual();
    const offsetX = -width / 2;
    const offsetY = -height / 2;

    this.shapeGraphics.clear();

    this.shapeGraphics.fillStyle(0x2a2550, 0.12);
    for (const c of this.shape.cells) {
      const px = offsetX + (c.x - minX) * stride + 2;
      const py = offsetY + (c.y - minY) * stride + 3;
      this.shapeGraphics.fillRoundedRect(px, py, this.cellSize, this.cellSize, radius);
    }

    this.shapeGraphics.fillStyle(color, 1);
    for (const c of this.shape.cells) {
      const px = offsetX + (c.x - minX) * stride;
      const py = offsetY + (c.y - minY) * stride;
      this.shapeGraphics.fillRoundedRect(px, py, this.cellSize, this.cellSize, radius);
      this.shapeGraphics.fillStyle(highlight, 0.18);
      this.shapeGraphics.fillRoundedRect(
        px + 2,
        py + 2,
        this.cellSize - 4,
        Math.max(4, this.cellSize * 0.28),
        radius * 0.6,
      );
      this.shapeGraphics.fillStyle(color, 1);
    }
  }
}
