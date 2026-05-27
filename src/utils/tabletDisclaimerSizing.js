import { CELL_PADDING_X } from './disclaimerSizing.js';

/** Доля строки под дисклеймер в макете планшета (left 70.9%, right 3.94%) */
const TABLET_DISCLAIMER_WIDTH_RATIO = 1 - 0.709 - 0.0394;

export const TABLET_CELL_WIDTH = 946;
export const TABLET_CELL_HEIGHT = 64;

export function getTabletDisclaimerMaxWidth(cellWidth) {
  const rowInner = cellWidth - CELL_PADDING_X;
  return Math.max(1, Math.floor(rowInner * TABLET_DISCLAIMER_WIDTH_RATIO));
}

/**
 * Планшет: высота ячейки фиксирована, дисклеймер в строке справа.
 * Площадь дисклеймера не меньше целевой доли от площади ячейки.
 */
export function solveTabletDisclaimerSize({
  cellWidth = TABLET_CELL_WIDTH,
  cellHeight = TABLET_CELL_HEIGHT,
  proportionW,
  proportionH,
  targetPercent,
  minHeight = 1,
}) {
  const ratio = proportionW / proportionH;
  const minH = Math.max(1, minHeight);
  const maxW = getTabletDisclaimerMaxWidth(cellWidth);
  const cellArea = cellWidth * cellHeight;
  const targetArea = (targetPercent / 100) * cellArea;

  let height = Math.max(minH, Math.ceil(Math.sqrt(targetArea / ratio)));
  let width = Math.ceil(ratio * height);

  if (width > maxW) {
    width = maxW;
    height = Math.max(minH, Math.ceil(width / ratio));
  }

  for (let i = 0; i < 50; i++) {
    if (width * height >= targetArea) break;

    if (width < maxW) {
      height += 1;
      height = Math.max(minH, height);
      width = Math.min(maxW, Math.ceil(ratio * height));
      if (width === maxW) {
        height = Math.max(minH, Math.ceil(width / ratio));
      }
    } else {
      height += 1;
      height = Math.max(minH, height);
    }
  }

  return { width, height };
}
