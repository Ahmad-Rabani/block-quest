import Phaser from 'phaser';
import { PALETTE } from '../../domain/constants';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';

export interface ModalButton {
  label: string;
  onClick: () => void;
}

export interface ModalOptions {
  title: string;
  body: string;
  buttons: ModalButton[];
  /** Optional secondary line under title (e.g. score summary). */
  subtitle?: string;
  width?: number;
  depth?: number;
}

/**
 * Centered modal with consistent vertical stacking.
 * Text uses origin 0.5 and center align so content stays optically centered.
 */
export function createCenteredModal(
  scene: Phaser.Scene,
  options: ModalOptions,
): Phaser.GameObjects.Container {
  const width = options.width ?? 310;
  const depth = options.depth ?? 200;
  const cx = DESIGN_WIDTH / 2;
  const cy = DESIGN_HEIGHT / 2;

  const container = scene.add.container(0, 0).setDepth(depth);

  const dim = scene.add.rectangle(cx, cy, DESIGN_WIDTH, DESIGN_HEIGHT, 0x2a2550, 0.58);

  const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontSize: '28px',
    fontStyle: 'bold',
    color: PALETTE.primaryPurple,
    align: 'center',
  };
  const bodyStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontSize: '15px',
    color: PALETTE.text,
    align: 'center',
    lineSpacing: 6,
    wordWrap: { width: width - 48 },
  };

  const title = scene.add.text(0, 0, options.title, titleStyle).setOrigin(0.5);
  const subtitle = options.subtitle
    ? scene.add
        .text(0, 0, options.subtitle, {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '17px',
          color: PALETTE.text,
          align: 'center',
          lineSpacing: 6,
        })
        .setOrigin(0.5)
    : null;
  const body = scene.add.text(0, 0, options.body, bodyStyle).setOrigin(0.5);

  const buttonHeight = 46;
  const buttonGap = 10;
  const buttonBlock =
    options.buttons.length * buttonHeight + Math.max(0, options.buttons.length - 1) * buttonGap;

  const padTop = 28;
  const padBottom = 28;
  const gapAfterTitle = 14;
  const gapAfterSubtitle = 12;
  const gapBeforeButtons = 22;

  const contentHeight =
    padTop +
    title.height +
    gapAfterTitle +
    (subtitle ? subtitle.height + gapAfterSubtitle : 0) +
    body.height +
    gapBeforeButtons +
    buttonBlock +
    padBottom;

  const panelTop = cy - contentHeight / 2;
  const panelLeft = cx - width / 2;

  const panel = scene.add.graphics();
  panel.fillStyle(0x6545d6, 0.12);
  panel.fillRoundedRect(panelLeft + 3, panelTop + 5, width, contentHeight, 28);
  panel.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.white).color, 1);
  panel.fillRoundedRect(panelLeft, panelTop, width, contentHeight, 28);

  let y = panelTop + padTop + title.height / 2;
  title.setPosition(cx, y);
  y += title.height / 2 + gapAfterTitle;

  if (subtitle) {
    y += subtitle.height / 2;
    subtitle.setPosition(cx, y);
    y += subtitle.height / 2 + gapAfterSubtitle;
  }

  y += body.height / 2;
  body.setPosition(cx, y);
  y += body.height / 2 + gapBeforeButtons;

  const children: Phaser.GameObjects.GameObject[] = [dim, panel, title];
  if (subtitle) {
    children.push(subtitle);
  }
  children.push(body);

  for (let i = 0; i < options.buttons.length; i++) {
    const btn = options.buttons[i]!;
    const top = y + i * (buttonHeight + buttonGap);
    const btnW = Math.min(200, width - 64);
    const gfx = scene.add.graphics();
    gfx.fillStyle(Phaser.Display.Color.HexStringToColor(PALETTE.primaryPurple).color, 1);
    gfx.fillRoundedRect(cx - btnW / 2, top, btnW, buttonHeight, buttonHeight / 2);
    gfx.setInteractive(
      new Phaser.Geom.Rectangle(cx - btnW / 2, top, btnW, buttonHeight),
      Phaser.Geom.Rectangle.Contains,
    );
    gfx.on('pointerup', btn.onClick);

    const label = scene.add
      .text(cx, top + buttonHeight / 2, btn.label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: PALETTE.white,
      })
      .setOrigin(0.5);

    children.push(gfx, label);
  }

  container.add(children);
  return container;
}
