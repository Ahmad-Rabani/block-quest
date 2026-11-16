import { BOARD_SIZE } from '../../domain/constants';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/gameConfig';

/** Shared portrait layout — keeps board, tray, and chips on one grid. */
export const LAYOUT = {
  screenMargin: 20,
  boardGap: 5,
  titleY: 36,
  chipY: 82,
  chipH: 36,
  boardTop: 116,
  trayGapFromBoard: 22,
  trayBottomMargin: 18,
  trayInnerPad: 12,
  traySlotGap: 10,
} as const;

export interface TrayLayout {
  panelTop: number;
  panelHeight: number;
  panelLeft: number;
  panelWidth: number;
  slotCenters: Array<{ x: number; y: number }>;
  slotWidth: number;
  slotHeight: number;
  slotY: number;
  hitWidth: number;
  hitHeight: number;
  cellSize: number;
  gap: number;
}

export function computeBoardMetrics(): {
  cellSize: number;
  gap: number;
  originX: number;
  originY: number;
  boardPixel: number;
  boardBottom: number;
} {
  const gap = LAYOUT.boardGap;
  const available = DESIGN_WIDTH - LAYOUT.screenMargin * 2;
  const cellSize = Math.floor((available - gap * (BOARD_SIZE - 1)) / BOARD_SIZE);
  const boardPixel = BOARD_SIZE * (cellSize + gap) - gap;
  const originX = (DESIGN_WIDTH - boardPixel) / 2;
  const originY = LAYOUT.boardTop;
  const boardBottom = originY + boardPixel;
  return { cellSize, gap, originX, originY, boardPixel, boardBottom };
}

export function computeTrayLayout(boardBottom: number, boardCellSize: number): TrayLayout {
  const panelTop = boardBottom + LAYOUT.trayGapFromBoard;
  const panelHeight = DESIGN_HEIGHT - panelTop - LAYOUT.trayBottomMargin;
  const panelLeft = LAYOUT.screenMargin;
  const panelWidth = DESIGN_WIDTH - LAYOUT.screenMargin * 2;

  const usable = panelWidth - LAYOUT.trayInnerPad * 2;
  const slotWidth = (usable - LAYOUT.traySlotGap * 2) / 3;
  const slotHeight = Math.max(96, panelHeight - LAYOUT.trayInnerPad * 2);
  const slotY = panelTop + (panelHeight - slotHeight) / 2;
  const centerY = slotY + slotHeight / 2;

  const slotCenters = [0, 1, 2].map((i) => ({
    x: panelLeft + LAYOUT.trayInnerPad + i * (slotWidth + LAYOUT.traySlotGap) + slotWidth / 2,
    y: centerY,
  }));

  return {
    panelTop,
    panelHeight,
    panelLeft,
    panelWidth,
    slotCenters,
    slotWidth,
    slotHeight,
    slotY,
    hitWidth: slotWidth,
    hitHeight: slotHeight,
    cellSize: Math.max(22, Math.floor(boardCellSize * 0.86)),
    gap: 3,
  };
}
