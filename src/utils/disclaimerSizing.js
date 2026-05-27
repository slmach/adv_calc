/** Константы вёрстки mobile suggest_exp */
export const CELL_PADDING_Y = 24;
export const INNER_GAP = 2;
export const DISCLAIMER_ROW_PT = 2;
export const DISCLAIMER_ROW_PL = 52;
export const CELL_PADDING_X = 32;

export function getDisclaimerMaxWidth(cellWidth) {
  return Math.max(1, cellWidth - CELL_PADDING_X - DISCLAIMER_ROW_PL);
}

function getTargetArea(cellWidth, base, height, targetPercent) {
  const cellHeight = base + height;
  return (targetPercent / 100) * cellWidth * cellHeight;
}

/**
 * Подбирает размер дисклеймера: площадь не меньше целевой доли от ячейки,
 * с заданной пропорцией (насколько позволяет ширина) и минимальной высотой.
 */
export function solveDisclaimerSize({
  cellWidth,
  rowHeight,
  proportionW,
  proportionH,
  targetPercent,
  minHeight = 1,
}) {
  const ratio = proportionW / proportionH;
  const base = CELL_PADDING_Y + rowHeight + INNER_GAP + DISCLAIMER_ROW_PT;
  const maxW = getDisclaimerMaxWidth(cellWidth);
  const minH = Math.max(1, minHeight);
  const k = (targetPercent / 100) * cellWidth;

  const discriminant = k * k + 4 * ratio * k * base;
  let height = (k + Math.sqrt(discriminant)) / (2 * ratio);
  let width = ratio * height;

  height = Math.max(minH, Math.ceil(height));
  width = Math.ceil(ratio * height);

  if (width > maxW) {
    width = maxW;
    height = Math.max(minH, Math.ceil(width / ratio));
  }

  for (let i = 0; i < 100; i++) {
    const targetArea = getTargetArea(cellWidth, base, height, targetPercent);
    const disclaimerArea = width * height;

    if (disclaimerArea >= targetArea) {
      break;
    }

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

export function getAreaPercent(partArea, totalArea) {
  if (!totalArea || totalArea <= 0) return null;
  return (partArea / totalArea) * 100;
}
