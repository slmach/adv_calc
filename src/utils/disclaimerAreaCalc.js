import {
  DISCLAIMER_SCALING_FIXED,
  DISCLAIMER_SCALING_PROPORTIONAL,
} from './disclaimerScaling.js';

/** При высоте выше лимита фиксируем высоту и наращиваем ширину до целевой площади */
export const DISCLAIMER_MAX_HEIGHT_PX = 32;
export const DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX = 32;
export const DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX = 112;

function solveUnconstrained({
  cellWidth,
  cellHeight,
  ratio,
  targetPercent,
}) {
  const cellArea = cellWidth * cellHeight;
  const targetArea = (targetPercent / 100) * cellArea;

  let height = Math.sqrt(targetArea / ratio);
  let width = ratio * height;

  height = Math.max(1, Math.ceil(height));
  width = Math.max(1, Math.ceil(ratio * height));

  for (let i = 0; i < 1000; i++) {
    if (width * height >= targetArea) break;
    height += 1;
    width = Math.max(1, Math.ceil(ratio * height));
  }

  return { width, height, cellArea, targetArea };
}

/**
 * Если высота превышает лимит — фиксируем высоту, наращиваем ширину до целевой площади.
 */
function applyMaxHeight({
  width,
  height,
  targetArea,
  maxHeight,
  maxWidth = null,
}) {
  const limit = maxHeight != null && maxHeight > 0 ? Math.ceil(maxHeight) : null;
  if (!limit || height < limit) {
    return { width, height, heightCapped: false };
  }

  let h = Math.max(1, limit);
  let w = Math.max(1, Math.ceil(targetArea / h));

  for (let i = 0; i < 1000; i++) {
    if (w * h >= targetArea) break;
    w += 1;
  }

  if (maxWidth != null && w > maxWidth) {
    w = maxWidth;
  }

  return { width: w, height: h, heightCapped: true };
}

/**
 * Если высота ниже минимума — поднимаем высоту.
 * keepRatio: ширина из пропорции макета; иначе — наращиваем ширину до целевой площади.
 */
function applyMinHeight({
  width,
  height,
  targetArea,
  minHeight,
  maxWidth = null,
  ratio = 1,
  keepRatio = false,
}) {
  const floor = minHeight != null && minHeight > 0 ? Math.ceil(minHeight) : null;
  if (!floor || height >= floor) {
    return { width, height, heightFloored: false };
  }

  let h = floor;
  let w = keepRatio
    ? Math.max(1, Math.ceil(ratio * h))
    : Math.max(1, Math.ceil(targetArea / h));

  if (!keepRatio) {
    for (let i = 0; i < 1000; i++) {
      if (w * h >= targetArea) break;
      w += 1;
    }
  }

  if (maxWidth != null && w > maxWidth) {
    w = maxWidth;
    if (keepRatio) {
      h = Math.max(floor, Math.ceil(w / ratio));
    }
  }

  return { width: w, height: h, heightFloored: true };
}

function clampToCell(width, height, ratio, maxW, maxH) {
  let w = width;
  let h = height;

  if (w > maxW) {
    w = maxW;
    h = Math.max(1, Math.ceil(w / ratio));
  }
  if (h > maxH) {
    h = maxH;
    w = Math.max(1, Math.ceil(ratio * h));
    if (w > maxW) {
      w = maxW;
      h = Math.max(1, Math.ceil(w / ratio));
    }
  }

  return { width: w, height: h };
}

function buildResult({
  width,
  height,
  cellWidth,
  cellHeight,
  cellArea,
  targetArea,
  targetMet,
  expandsCell,
  baseCellHeight,
  heightCapped,
  heightFloored,
}) {
  const disclaimerArea = width * height;
  return {
    width,
    height,
    cellWidth,
    cellHeight,
    baseCellHeight,
    cellArea,
    disclaimerArea,
    targetArea,
    actualPercent: cellArea > 0 ? (disclaimerArea / cellArea) * 100 : 0,
    targetMet:
      targetMet !== undefined
        ? targetMet
        : disclaimerArea >= targetArea,
    expandsCell,
    heightCapped: Boolean(heightCapped),
    heightFloored: Boolean(heightFloored),
  };
}

function solveFixedCell({
  cellWidth,
  cellHeight,
  ratio,
  targetPercent,
  maxHeight,
  minHeight = null,
  minHeightKeepRatio = false,
}) {
  const cw = Math.max(1, cellWidth);
  const ch = Math.max(1, cellHeight);
  const unconstrained = solveUnconstrained({
    cellWidth: cw,
    cellHeight: ch,
    ratio,
    targetPercent,
  });

  const flooredByHeight = applyMinHeight({
    width: unconstrained.width,
    height: unconstrained.height,
    targetArea: unconstrained.targetArea,
    minHeight,
    maxWidth: cw,
    ratio,
    keepRatio: minHeightKeepRatio,
  });

  const cappedByHeight = applyMaxHeight({
    width: flooredByHeight.width,
    height: flooredByHeight.height,
    targetArea: unconstrained.targetArea,
    maxHeight,
    maxWidth: cw,
  });

  const clamped = cappedByHeight.heightCapped
    ? {
        width: Math.min(cappedByHeight.width, cw),
        height: Math.min(cappedByHeight.height, ch),
      }
    : clampToCell(
        cappedByHeight.width,
        cappedByHeight.height,
        ratio,
        cw,
        ch,
      );

  const disclaimerArea = clamped.width * clamped.height;

  return buildResult({
    width: clamped.width,
    height: clamped.height,
    cellWidth: cw,
    cellHeight: ch,
    cellArea: cw * ch,
    targetArea: unconstrained.targetArea,
    targetMet: disclaimerArea >= unconstrained.targetArea,
    expandsCell: false,
    heightCapped: cappedByHeight.heightCapped,
    heightFloored: flooredByHeight.heightFloored,
  });
}

/** Альтернатива: высота = высота ячейки − 32 px, ширина под 10% площади (мин. 112 px) */
function solveAlternativeFixedHeight({
  cellWidth,
  cellHeight,
  targetPercent,
}) {
  const cw = Math.max(1, cellWidth);
  const ch = Math.max(1, cellHeight);
  const cellArea = cw * ch;
  const targetArea = (targetPercent / 100) * cellArea;
  const height = Math.max(
    1,
    ch - DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX,
  );

  let width = Math.max(
    DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX,
    Math.ceil(targetArea / height),
  );

  for (let i = 0; i < 1000; i++) {
    if (width * height >= targetArea) break;
    width += 1;
  }

  width = Math.max(DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX, width);

  if (width > cw) {
    width = cw;
  }

  const disclaimerArea = width * height;

  return buildResult({
    width,
    height,
    cellWidth: cw,
    cellHeight: ch,
    cellArea,
    targetArea,
    targetMet: disclaimerArea >= targetArea,
    expandsCell: false,
    heightCapped: true,
  });
}

function solveExpandingCell({
  cellWidth,
  cellHeight,
  ratio,
  targetPercent,
  maxHeight,
}) {
  const cw = Math.max(1, cellWidth);
  const base = Math.max(1, cellHeight);
  const k = (targetPercent / 100) * cw;

  const discriminant = k * k + 4 * ratio * k * base;
  let height = (k + Math.sqrt(discriminant)) / (2 * ratio);
  let width = ratio * height;

  height = Math.max(1, Math.ceil(height));
  width = Math.max(1, Math.ceil(ratio * height));

  for (let i = 0; i < 1000; i++) {
    const targetArea = k * (base + height);
    if (width * height >= targetArea) break;
    height += 1;
    width = Math.max(1, Math.ceil(ratio * height));
  }

  let finalCellHeight = base + height;
  let targetArea = (targetPercent / 100) * cw * finalCellHeight;
  let heightCapped = false;

  const limit = maxHeight != null && maxHeight > 0 ? Math.ceil(maxHeight) : null;
  if (limit && height > limit) {
    height = Math.max(1, limit);
    finalCellHeight = base + height;
    targetArea = (targetPercent / 100) * cw * finalCellHeight;

    const capped = applyMaxHeight({
      width,
      height,
      targetArea,
      maxHeight: limit,
      maxWidth: cw,
    });

    width = capped.width;
    height = capped.height;
    heightCapped = true;
  }

  const disclaimerArea = width * height;

  return buildResult({
    width,
    height,
    cellWidth: cw,
    cellHeight: finalCellHeight,
    baseCellHeight: base,
    cellArea: cw * finalCellHeight,
    targetArea,
    targetMet: disclaimerArea >= targetArea,
    expandsCell: true,
    heightCapped,
  });
}

/**
 * @param {boolean} fixedCell — true: дисклеймер внутри ячейки; false: увеличивает высоту
 * @param {number | null} maxHeight — макс. высота; null отключает лимит
 * @param {'proportional' | 'fixed' | 'adaptive'} scalingMode — режим масштабирования
 */
export function solveDisclaimerFromCellArea({
  cellWidth,
  cellHeight,
  proportionW,
  proportionH,
  targetPercent,
  fixedCell = true,
  maxHeight,
  minHeight = null,
  minHeightKeepRatio = false,
  scalingMode = DISCLAIMER_SCALING_PROPORTIONAL,
}) {
  const ratio = Math.max(1, proportionW) / Math.max(1, proportionH);

  if (fixedCell && scalingMode === DISCLAIMER_SCALING_FIXED) {
    return solveAlternativeFixedHeight({
      cellWidth,
      cellHeight,
      targetPercent,
    });
  }

  const resolvedMaxHeight = maxHeight ?? DISCLAIMER_MAX_HEIGHT_PX;

  if (fixedCell) {
    return solveFixedCell({
      cellWidth,
      cellHeight,
      ratio,
      targetPercent,
      maxHeight: resolvedMaxHeight,
      minHeight,
      minHeightKeepRatio,
    });
  }

  return solveExpandingCell({
    cellWidth,
    cellHeight,
    ratio,
    targetPercent,
    maxHeight: resolvedMaxHeight,
  });
}
