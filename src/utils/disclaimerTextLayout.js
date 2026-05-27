import {
  fitsCopyInlineOnOneLine,
  getSuggestCopyWidth,
  getTextModeRowContentHeight,
  measureCopyInlineWidth,
  SUGGEST_ROW_COPY_CHROME_PX,
  SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX,
} from './suggestTextCopyLayout.js';

/** 1) всё в одну строку → 2) дисклеймер под copy → 3) сайт и метка под заголовок */
export const TEXT_MODE_LAYOUT_STEPS = [
  { placement: 'inline', copyLayout: 'inline' },
  { placement: 'below', copyLayout: 'inline' },
  { placement: 'below', copyLayout: 'stacked' },
];

export const DISCLAIMER_TEXT_MIN_FONT_SIZE_PX = 8;
export const DISCLAIMER_TEXT_MAX_FONT_SIZE_PX = 20;
const DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX = 32;
/** Запас к норме типа при расчёте площади (п.п.) */
export const DISCLAIMER_TEXT_TARGET_SURPLUS_PP = 2;
/** Допустимый запас площади над эффективной целью (≈ «чуть больше») */
export const DISCLAIMER_TEXT_MAX_AREA_OVERSHOOT = 1.08;
export const DISCLAIMER_TEXT_LINE_HEIGHT_RATIO = 1.4;
export const DISCLAIMER_TEXT_LETTER_SPACING_EM = 0.06;
export const DISCLAIMER_TEXT_PADDING_X_PX = 4;
export const DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT = 300;
export const DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR = 400;
export const DISCLAIMER_TEXT_FONT_WEIGHT_MEDIUM = 500;
/** С кегля ≥ этого — Regular; ниже — Medium */
export const DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR_THRESHOLD_PX = 13;
/** С кегля > этого — Light */
export const DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT_THRESHOLD_PX = 15;

export function getDisclaimerTextFontWeight(fontSizePx) {
  if (!Number.isFinite(fontSizePx)) {
    return DISCLAIMER_TEXT_FONT_WEIGHT_MEDIUM;
  }

  if (fontSizePx > DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT_THRESHOLD_PX) {
    return DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT;
  }

  if (fontSizePx >= DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR_THRESHOLD_PX) {
    return DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR;
  }

  return DISCLAIMER_TEXT_FONT_WEIGHT_MEDIUM;
}
/** Зазор между copy и дисклеймером под строкой */
export const TEXT_MODE_DISCLAIMER_BELOW_GAP_PX = 4;

const DISCLAIMER_TEXT_FONT_FAMILY =
  "'YS Text', 'Helvetica Neue', Arial, sans-serif";

let measureCanvas;

function getMeasureContext() {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }

  return measureCanvas.getContext('2d');
}

function normalizeDisclaimerText(text) {
  return String(text ?? '')
    .trim()
    .toUpperCase();
}

export function getTextModeEffectiveTargetPercent(targetPercent) {
  return targetPercent + DISCLAIMER_TEXT_TARGET_SURPLUS_PP;
}

export function getTextModeTargetArea(cellWidth, rowHeight, targetPercent) {
  return (
    (getTextModeEffectiveTargetPercent(targetPercent) / 100) *
    cellWidth *
    rowHeight
  );
}

export function lineHeightForDisclaimerFontSize(fontSizePx) {
  return Math.max(
    1,
    Math.ceil(fontSizePx * DISCLAIMER_TEXT_LINE_HEIGHT_RATIO),
  );
}

function buildDisclaimerFont(fontSizePx) {
  return `${getDisclaimerTextFontWeight(fontSizePx)} ${fontSizePx}px ${DISCLAIMER_TEXT_FONT_FAMILY}`;
}

function measureTextWithTracking(text, fontSizePx, ctx) {
  ctx.font = buildDisclaimerFont(fontSizePx);
  const base = ctx.measureText(text).width;
  const tracking =
    Math.max(0, text.length - 1) * fontSizePx * DISCLAIMER_TEXT_LETTER_SPACING_EM;
  return base + tracking;
}

function measureWordWidth(word, fontSizePx, ctx) {
  return measureTextWithTracking(word, fontSizePx, ctx);
}

export function wrapDisclaimerTextLines(text, innerWidth, fontSizePx) {
  const normalized = normalizeDisclaimerText(text);
  if (!normalized) {
    return [];
  }

  if (!Number.isFinite(innerWidth) || innerWidth <= 0) {
    return [normalized];
  }

  const ctx = getMeasureContext();
  if (!ctx) {
    return [normalized];
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const lines = [];
  let lineWords = [];
  let lineWidth = 0;

  const flush = () => {
    if (lineWords.length > 0) {
      lines.push(lineWords.join(' '));
      lineWords = [];
      lineWidth = 0;
    }
  };

  for (const word of words) {
    const wordWidth = measureWordWidth(word, fontSizePx, ctx);
    const spaceWidth = lineWords.length > 0 ? measureWordWidth(' ', fontSizePx, ctx) : 0;
    const nextWidth = lineWidth + spaceWidth + wordWidth;

    if (nextWidth > innerWidth && lineWords.length > 0) {
      flush();
      lineWords.push(word);
      lineWidth = wordWidth;
    } else if (wordWidth > innerWidth && lineWords.length === 0) {
      lines.push(word);
      lineWidth = 0;
    } else {
      lineWords.push(word);
      lineWidth = nextWidth;
    }
  }

  flush();
  return lines;
}

export function layoutDisclaimerTextAtWidth(text, boxWidth, fontSizePx) {
  const width = Math.max(1, Math.ceil(boxWidth));
  const innerWidth = Math.max(1, width - DISCLAIMER_TEXT_PADDING_X_PX);
  const lines = wrapDisclaimerTextLines(text, innerWidth, fontSizePx);
  const lineHeight = lineHeightForDisclaimerFontSize(fontSizePx);
  const ctx = getMeasureContext();

  let contentWidth = 0;
  if (ctx && lines.length > 0) {
    for (const line of lines) {
      contentWidth = Math.max(contentWidth, measureTextWithTracking(line, fontSizePx, ctx));
    }
  }

  const height = Math.max(lineHeight, lines.length * lineHeight);

  return {
    width,
    height,
    lines,
    lineHeight,
    fontSizePx,
    area: width * height,
  };
}

function measureSingleLineWidth(text, fontSizePx) {
  const normalized = normalizeDisclaimerText(text);
  const ctx = getMeasureContext();
  if (!normalized || !ctx) {
    return 0;
  }

  return (
    Math.ceil(measureTextWithTracking(normalized, fontSizePx, ctx)) +
    DISCLAIMER_TEXT_PADDING_X_PX
  );
}

/** Блок = габариты текста (без пустых полей по ширине) */
function packSingleLineNatural(text, fontSizePx, maxWidth, maxHeight) {
  const normalized = normalizeDisclaimerText(text);
  const limitW = Math.max(1, Math.ceil(maxWidth));
  const limitH =
    maxHeight != null && maxHeight > 0
      ? Math.ceil(maxHeight)
      : Number.POSITIVE_INFINITY;
  const lineHeight = lineHeightForDisclaimerFontSize(fontSizePx);
  const textWidth = measureSingleLineWidth(normalized, fontSizePx);

  if (textWidth > limitW || lineHeight > limitH) {
    return null;
  }

  return {
    fontSizePx,
    width: textWidth,
    height: lineHeight,
    lines: [normalized],
    lineHeight,
    area: textWidth * lineHeight,
    singleLine: true,
  };
}

function packMultilineAtFullWidth(text, fontSizePx, maxWidth, maxHeight) {
  const normalized = normalizeDisclaimerText(text);
  const limitW = Math.max(1, Math.ceil(maxWidth));
  const limitH =
    maxHeight != null && maxHeight > 0
      ? Math.ceil(maxHeight)
      : Number.POSITIVE_INFINITY;

  const layout = layoutDisclaimerTextAtWidth(normalized, limitW, fontSizePx);

  if (layout.height > limitH) {
    return null;
  }

  return {
    fontSizePx,
    width: layout.width,
    height: layout.height,
    lines: layout.lines,
    lineHeight: layout.lineHeight,
    area: layout.area,
    singleLine: layout.lines.length <= 1,
  };
}

/**
 * Крупнейший кегль: текст заполняет блок (габариты ≈ тексту), площадь ≥ targetArea.
 */
export function findOptimalFontSizeForArea({
  text,
  targetArea,
  maxWidth,
  maxHeight = null,
  forceSingleLine = false,
}) {
  const normalized = normalizeDisclaimerText(text);
  if (!normalized || !Number.isFinite(targetArea) || targetArea <= 0) {
    return null;
  }

  const areaCap = targetArea * DISCLAIMER_TEXT_MAX_AREA_OVERSHOOT;
  let bestInBand = null;
  let bestOverTarget = null;

  for (
    let fontSizePx = DISCLAIMER_TEXT_MIN_FONT_SIZE_PX;
    fontSizePx <= DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx += 1
  ) {
    const singleLine = packSingleLineNatural(
      normalized,
      fontSizePx,
      maxWidth,
      maxHeight,
    );

    if (!singleLine) {
      continue;
    }

    if (singleLine.area < targetArea) {
      continue;
    }

    if (singleLine.area <= areaCap) {
      bestInBand = singleLine;
      continue;
    }

    if (!bestOverTarget || singleLine.area < bestOverTarget.area) {
      bestOverTarget = singleLine;
    }
  }

  if (bestInBand) {
    return bestInBand;
  }

  if (bestOverTarget) {
    return bestOverTarget;
  }

  if (forceSingleLine) {
    const expanded = packSingleLineExpandedToTarget(
      normalized,
      targetArea,
      maxWidth,
      maxHeight,
    );
    return expanded;
  }

  for (
    let fontSizePx = DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx >= DISCLAIMER_TEXT_MIN_FONT_SIZE_PX;
    fontSizePx -= 1
  ) {
    const multiline = packMultilineAtFullWidth(
      normalized,
      fontSizePx,
      maxWidth,
      maxHeight,
    );

    if (!multiline) {
      continue;
    }

    if (multiline.area < targetArea) {
      continue;
    }

    if (multiline.area <= areaCap) {
      return multiline;
    }

    if (!bestOverTarget || multiline.area < bestOverTarget.area) {
      bestOverTarget = multiline;
    }
  }

  return bestOverTarget;
}

/** Расширяет ширину только если кегль до 32 px не дотягивает по площади */
function packSingleLineExpandedToTarget(text, targetArea, maxWidth, maxHeight) {
  for (
    let fontSizePx = DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx >= DISCLAIMER_TEXT_MIN_FONT_SIZE_PX;
    fontSizePx -= 1
  ) {
    const natural = packSingleLineNatural(text, fontSizePx, maxWidth, maxHeight);
    if (!natural) {
      continue;
    }

    const width = Math.min(
      Math.max(1, Math.ceil(maxWidth)),
      Math.max(natural.width, Math.ceil(targetArea / natural.lineHeight)),
    );
    const height = natural.lineHeight;
    const area = width * height;

    if (area < targetArea) {
      continue;
    }

    return {
      ...natural,
      width,
      height,
      area,
      singleLine: true,
    };
  }

  return null;
}

/** @deprecated */
export function findSmallestFontSizeForArea(params) {
  return findOptimalFontSizeForArea(params);
}

/** @deprecated */
export function findLargestFontSizeForArea(params) {
  return findOptimalFontSizeForArea(params);
}

function buildTextModeResult({
  placement,
  cellWidth,
  cellHeight,
  targetArea,
  disclaimer,
  copyLayout,
  copyWidth,
  heightFloored = false,
  heightCapped = false,
}) {
  const cw = Math.max(1, cellWidth);
  const ch = Math.max(1, cellHeight);
  const cellArea = cw * ch;
  const disclaimerArea = disclaimer.width * disclaimer.height;

  return {
    placement,
    width: disclaimer.width,
    height: disclaimer.height,
    fontSizePx: disclaimer.fontSizePx,
    lineHeightPx: disclaimer.lineHeight,
    disclaimerLines: disclaimer.lines,
    cellWidth: cw,
    cellHeight: ch,
    baseCellHeight: ch,
    cellArea,
    disclaimerArea,
    targetArea,
    actualPercent: cellArea > 0 ? (disclaimerArea / cellArea) * 100 : 0,
    targetMet: disclaimerArea >= targetArea,
    expandsCell: false,
    heightCapped,
    heightFloored,
    copyLayout,
    copyWidth,
  };
}

function tryAllInOneRow({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  maxDisclaimerHeight,
}) {
  const copyContentWidth = measureCopyInlineWidth(title, domain);
  const innerWidth = cellWidth - SUGGEST_ROW_COPY_CHROME_PX;
  const disclaimerMaxWidth =
    innerWidth - copyContentWidth - SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX;

  if (disclaimerMaxWidth < 1) {
    return null;
  }

  const rowHeight = getTextModeRowContentHeight('inline', title, copyContentWidth);
  const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);

  const fit = findOptimalFontSizeForArea({
    text,
    targetArea,
    maxWidth: disclaimerMaxWidth,
    maxHeight: maxDisclaimerHeight,
    forceSingleLine: true,
  });

  if (!fit || !fit.singleLine) {
    return null;
  }

  const copyWidth = getSuggestCopyWidth(cellWidth, fit.width);

  if (!fitsCopyInlineOnOneLine(title, domain, copyWidth)) {
    return null;
  }

  return buildTextModeResult({
    placement: 'inline',
    copyLayout: 'inline',
    cellWidth,
    cellHeight: rowHeight,
    targetArea,
    disclaimer: fit,
    copyWidth,
  });
}

function tryDisclaimerBelowCopyInline({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  maxBelowDisclaimerHeight,
}) {
  const copyWidth = getSuggestCopyWidth(cellWidth, 0);

  if (!fitsCopyInlineOnOneLine(title, domain, copyWidth)) {
    return null;
  }

  let rowHeight = getTextModeRowContentHeight('inline', title, copyWidth);

  for (let pass = 0; pass < 12; pass += 1) {
    const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);
    const fit = findOptimalFontSizeForArea({
      text,
      targetArea,
      maxWidth: copyWidth,
      maxHeight: maxBelowDisclaimerHeight,
      forceSingleLine: false,
    });

    if (!fit) {
      return null;
    }

    const copyBlockHeight = getTextModeRowContentHeight('inline', title, copyWidth);
    const nextRowHeight =
      copyBlockHeight + TEXT_MODE_DISCLAIMER_BELOW_GAP_PX + fit.height;

    if (Math.abs(nextRowHeight - rowHeight) < 1) {
      return buildTextModeResult({
        placement: 'below',
        copyLayout: 'inline',
        cellWidth,
        cellHeight: nextRowHeight,
        targetArea,
        disclaimer: fit,
        copyWidth,
      });
    }

    rowHeight = nextRowHeight;
  }

  return null;
}

function tryDisclaimerBelowCopyStacked({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  maxBelowDisclaimerHeight,
}) {
  const copyWidth = getSuggestCopyWidth(cellWidth, 0);
  let rowHeight = getTextModeRowContentHeight('stacked', title, copyWidth);

  for (let pass = 0; pass < 12; pass += 1) {
    const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);
    const fit = findOptimalFontSizeForArea({
      text,
      targetArea,
      maxWidth: copyWidth,
      maxHeight: maxBelowDisclaimerHeight,
      forceSingleLine: false,
    });

    if (!fit) {
      return null;
    }

    const copyBlockHeight = getTextModeRowContentHeight('stacked', title, copyWidth);
    const nextRowHeight =
      copyBlockHeight + TEXT_MODE_DISCLAIMER_BELOW_GAP_PX + fit.height;

    if (Math.abs(nextRowHeight - rowHeight) < 1) {
      return buildTextModeResult({
        placement: 'below',
        copyLayout: 'stacked',
        cellWidth,
        cellHeight: nextRowHeight,
        targetArea,
        disclaimer: fit,
        copyWidth,
      });
    }

    rowHeight = nextRowHeight;
  }

  return null;
}

/**
 * Текстовый режим: одна строка или переносы (дисклеймер → сайт/метка).
 */
export function solveTextModeRowLayout({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  maxInlineDisclaimerHeight = 32,
  maxBelowDisclaimerHeight = null,
}) {
  const oneRow = tryAllInOneRow({
    cellWidth,
    text,
    title,
    domain,
    targetPercent,
    maxDisclaimerHeight: maxInlineDisclaimerHeight,
  });
  if (oneRow) {
    return oneRow;
  }

  const belowInline = tryDisclaimerBelowCopyInline({
    cellWidth,
    text,
    title,
    domain,
    targetPercent,
    maxBelowDisclaimerHeight,
  });
  if (belowInline) {
    return belowInline;
  }

  const belowStacked = tryDisclaimerBelowCopyStacked({
    cellWidth,
    text,
    title,
    domain,
    targetPercent,
    maxBelowDisclaimerHeight,
  });
  if (belowStacked) {
    return belowStacked;
  }

  const copyWidth = getSuggestCopyWidth(cellWidth, 0);
  const rowHeight = getTextModeRowContentHeight('stacked', title, copyWidth);
  const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);

  return buildTextModeResult({
    placement: 'below',
    copyLayout: 'stacked',
    cellWidth,
    cellHeight: rowHeight,
    targetArea,
    disclaimer: {
      fontSizePx: DISCLAIMER_TEXT_MIN_FONT_SIZE_PX,
      width: copyWidth,
      height: lineHeightForDisclaimerFontSize(DISCLAIMER_TEXT_MIN_FONT_SIZE_PX),
      lines: [normalizeDisclaimerText(text)],
      lineHeight: lineHeightForDisclaimerFontSize(DISCLAIMER_TEXT_MIN_FONT_SIZE_PX),
      area: 0,
    },
    copyWidth,
    targetMet: false,
  });
}

/** @deprecated используйте solveTextModeRowLayout */
export function solveTextDisclaimerFromCellArea(params) {
  return solveTextModeRowLayout({
    cellWidth: params.cellWidth,
    text: params.text,
    title: '',
    domain: '',
    targetPercent: params.targetPercent,
    maxInlineDisclaimerHeight: params.maxHeight ?? 32,
  });
}
