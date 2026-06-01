import {
  fitsCopyInlineOnOneLine,
  getSuggestCopyWidth,
  getTextModeCopyHeight,
  getTextModeRowContentHeight,
  measureCopyInlineWidth,
  measureMetaBlockWidth,
  resolveTextModeCopyLayout,
  SUGGEST_ROW_COPY_CHROME_PX,
  SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX,
  SUGGEST_ROW_PADDING_Y_PX,
} from './suggestTextCopyLayout.js';
import { measureTitleWidthForMaxLines } from './titleWrapMeasure.js';

/** Текстовое 2: заголовок сокращаем в последнюю очередь, не больше 2 строк */
export const DISCLAIMER_TEXT_2_MAX_TITLE_LINES = 2;

/** 1) всё в одну строку → 2) дисклеймер под copy → 3) сайт и метка под заголовок */
export const TEXT_MODE_LAYOUT_STEPS = [
  { placement: 'inline', copyLayout: 'inline' },
  { placement: 'below', copyLayout: 'inline' },
  { placement: 'below', copyLayout: 'stacked' },
];

export const DISCLAIMER_TEXT_MIN_FONT_SIZE_PX = 8;
/** Текстовое 2: дисклеймер может уменьшаться до 6 px */
export const DISCLAIMER_TEXT_2_MIN_FONT_SIZE_PX = 6;
/** Текстовое 2: максимум строк дисклеймера (по умолчанию) */
export const DISCLAIMER_TEXT_2_MAX_LINES = 4;
/** Текстовое 2: медицина — не больше 2 строк */
export const DISCLAIMER_TEXT_2_MAX_LINES_MEDICINE = 2;

export function getText2MaxDisclaimerLines(categoryId) {
  if (categoryId === 'medicine') {
    return DISCLAIMER_TEXT_2_MAX_LINES_MEDICINE;
  }
  return DISCLAIMER_TEXT_2_MAX_LINES;
}

/** Текстовое 2: минимум строк дисклеймера по типу */
export function getText2MinDisclaimerLines(categoryId) {
  if (categoryId === 'finance' || categoryId === 'bankruptcy') {
    return 2;
  }
  return 1;
}

function getTextModeInlineRowContentHeight(
  copyHeight,
  disclaimerHeight,
  includeDisclaimerInRowHeight,
) {
  return includeDisclaimerInRowHeight
    ? Math.max(copyHeight, disclaimerHeight)
    : copyHeight;
}

function getTextModeInlineRowHeight(
  copyHeight,
  disclaimerHeight,
  includeDisclaimerInRowHeight,
) {
  return (
    SUGGEST_ROW_PADDING_Y_PX * 2 +
    getTextModeInlineRowContentHeight(
      copyHeight,
      disclaimerHeight,
      includeDisclaimerInRowHeight,
    )
  );
}
export const DISCLAIMER_TEXT_MAX_FONT_SIZE_PX = 20;
const DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX = 32;
/** Запас к норме типа при расчёте площади (п.п.) */
export const DISCLAIMER_TEXT_TARGET_SURPLUS_PP = 4;
/** Допустимый запас площади над эффективной целью (≈ «чуть больше») */
export const DISCLAIMER_TEXT_MAX_AREA_OVERSHOOT = 1.08;
export const DISCLAIMER_TEXT_LINE_HEIGHT_RATIO = 1.2;
export const DISCLAIMER_TEXT_LETTER_SPACING_EM = 0.06;
export const DISCLAIMER_TEXT_PADDING_X_PX = 0;
export const DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT = 300;
export const DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR = 400;
export const DISCLAIMER_TEXT_FONT_WEIGHT_MEDIUM = 500;
/** С кегля ≥ этого — Regular; ниже — Medium */
export const DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR_THRESHOLD_PX = 13;
/** С кегля > этого — Light */
export const DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT_THRESHOLD_PX = 15;
/** Текстовое 3: 8–10 px — Regular, > 10 px — Light */
export const DISCLAIMER_TEXT_3_FONT_WEIGHT_LIGHT_THRESHOLD_PX = 10;

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

export function getDisclaimerText3FontWeight(fontSizePx) {
  if (!Number.isFinite(fontSizePx)) {
    return DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR;
  }

  if (fontSizePx > DISCLAIMER_TEXT_3_FONT_WEIGHT_LIGHT_THRESHOLD_PX) {
    return DISCLAIMER_TEXT_FONT_WEIGHT_LIGHT;
  }

  return DISCLAIMER_TEXT_FONT_WEIGHT_REGULAR;
}

let resolveDisclaimerFontWeight = getDisclaimerTextFontWeight;

export function withDisclaimerFontWeightResolver(resolver, fn) {
  const previous = resolveDisclaimerFontWeight;
  resolveDisclaimerFontWeight = resolver;
  try {
    return fn();
  } finally {
    resolveDisclaimerFontWeight = previous;
  }
}

function buildDisclaimerFont(fontSizePx) {
  return `${resolveDisclaimerFontWeight(fontSizePx)} ${fontSizePx}px ${DISCLAIMER_TEXT_FONT_FAMILY}`;
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

/**
 * Делит слова на ~равные по числу символов строки (баланс по словам).
 * Возвращает массив длиной не более lineCount (меньше — если текста мало).
 */
export function balancedWrapByWords(words, lineCount) {
  if (lineCount <= 1 || words.length <= 1) {
    return [words.join(' ')];
  }

  const ideal = words.join(' ').length / lineCount;
  const lines = [];
  let current = [];

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];

    if (current.length > 0 && lines.length < lineCount - 1) {
      const curLen = current.join(' ').length;
      const withLen = curLen + 1 + word.length;
      const wordsRemaining = words.length - i; // включая текущее слово
      const linesRemaining = lineCount - lines.length;
      // оставить хотя бы по слову на каждую будущую строку
      const canClose = wordsRemaining >= linesRemaining;

      // закрыть строку до добавления слова, если так ближе к идеалу
      if (canClose && Math.abs(curLen - ideal) <= Math.abs(withLen - ideal)) {
        lines.push(current.join(' '));
        current = [];
      }
    }

    current.push(word);
  }

  if (current.length > 0) {
    lines.push(current.join(' '));
  }

  return lines;
}

function packMultilineWithLines(lines, fontSizePx, maxWidth, lineCount) {
  const ctx = getMeasureContext();
  if (!ctx || lines.length !== lineCount) {
    return null;
  }

  const limitW = Math.max(1, Math.ceil(maxWidth));
  let blockWidth = 0;
  for (const line of lines) {
    const lineWidth =
      Math.ceil(measureTextWithTracking(line, fontSizePx, ctx)) +
      DISCLAIMER_TEXT_PADDING_X_PX;
    if (lineWidth > limitW) {
      return null;
    }
    blockWidth = Math.max(blockWidth, lineWidth);
  }

  const lineHeight = lineHeightForDisclaimerFontSize(fontSizePx);
  const height = lineHeight * lineCount;

  return {
    fontSizePx,
    width: blockWidth,
    height,
    lines,
    lineHeight,
    area: blockWidth * height,
    singleLine: false,
  };
}

/** Блок дисклеймера ровно в lineCount сбалансированных строк (целыми словами) */
export function packBalancedMultiline(
  text,
  fontSizePx,
  maxWidth,
  lineCount,
  preferredLines = null,
) {
  const normalized = normalizeDisclaimerText(text);
  const ctx = getMeasureContext();
  if (!normalized || !ctx) {
    return null;
  }

  if (
    preferredLines?.length === lineCount &&
    preferredLines.join(' ') === normalized
  ) {
    const preferred = preferredLines.map((line) => normalizeDisclaimerText(line));
    const packed = packMultilineWithLines(
      preferred,
      fontSizePx,
      maxWidth,
      lineCount,
    );
    if (packed) {
      return packed;
    }
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  const lines = balancedWrapByWords(words, lineCount);

  if (lines.length !== lineCount) {
    return null;
  }

  return packMultilineWithLines(lines, fontSizePx, maxWidth, lineCount);
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
  const footprintWidth = Math.max(
    1,
    Math.ceil(contentWidth) + DISCLAIMER_TEXT_PADDING_X_PX,
  );

  return {
    width: footprintWidth,
    height,
    lines,
    lineHeight,
    fontSizePx,
    area: footprintWidth * height,
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
  minFontSizePx = DISCLAIMER_TEXT_MIN_FONT_SIZE_PX,
}) {
  const normalized = normalizeDisclaimerText(text);
  if (!normalized || !Number.isFinite(targetArea) || targetArea <= 0) {
    return null;
  }

  const areaCap = targetArea * DISCLAIMER_TEXT_MAX_AREA_OVERSHOOT;
  let bestInBand = null;
  let bestOverTarget = null;

  for (
    let fontSizePx = minFontSizePx;
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

  const expanded = packSingleLineExpandedToTarget(
    normalized,
    targetArea,
    maxWidth,
    maxHeight,
    minFontSizePx,
  );
  if (expanded) {
    return expanded;
  }

  if (forceSingleLine) {
    return null;
  }

  for (
    let fontSizePx = DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx >= minFontSizePx;
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
function packSingleLineExpandedToTarget(
  text,
  targetArea,
  maxWidth,
  maxHeight,
  minFontSizePx = DISCLAIMER_TEXT_MIN_FONT_SIZE_PX,
) {
  for (
    let fontSizePx = DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx >= minFontSizePx;
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

/**
 * Текстовое 2: дисклеймер ВСЕГДА справа от copy.
 * Перебор геометрии: больший кегль / минимум строк предпочтительнее.
 */
function findText2DisclaimerFit({
  cellWidth,
  text,
  title,
  targetPercent,
  copyLayout,
  lineCount,
  maxDisclaimerWidth,
  minCopyWidth,
  minFontSizePx,
  preferredLines = null,
  bestEffort = false,
  includeDisclaimerInRowHeight = false,
}) {
  const normalized = normalizeDisclaimerText(text);
  if (!normalized) {
    return null;
  }

  let bestInBand = null;
  let bestOverTarget = null;
  // лучший по площади вариант, не добравший до цели (для best-effort)
  let bestBelowTarget = null;

  for (
    let fontSizePx = minFontSizePx;
    fontSizePx <= DISCLAIMER_TEXT_EXTENDED_MAX_FONT_SIZE_PX;
    fontSizePx += 1
  ) {
    const disclaimer =
      lineCount <= 1
        ? packSingleLineNatural(normalized, fontSizePx, maxDisclaimerWidth, null)
        : packBalancedMultiline(
            text,
            fontSizePx,
            maxDisclaimerWidth,
            lineCount,
            preferredLines,
          );

    if (!disclaimer) {
      continue;
    }

    const copyWidth = getSuggestCopyWidth(cellWidth, disclaimer.width);
    if (copyWidth < minCopyWidth) {
      continue;
    }

    const copyHeight = getTextModeCopyHeight(copyLayout, title, copyWidth);
    const rowHeight = getTextModeInlineRowHeight(
      copyHeight,
      disclaimer.height,
      includeDisclaimerInRowHeight,
    );
    const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);
    const areaCap = targetArea * DISCLAIMER_TEXT_MAX_AREA_OVERSHOOT;

    const result = buildTextModeResult({
      placement: 'inline',
      copyLayout,
      cellWidth,
      cellHeight: rowHeight,
      targetArea,
      disclaimer,
      copyWidth,
    });

    if (disclaimer.area < targetArea) {
      if (
        bestEffort &&
        (!bestBelowTarget || disclaimer.area > bestBelowTarget.disclaimerArea)
      ) {
        bestBelowTarget = result;
      }
      continue;
    }

    if (disclaimer.area <= areaCap) {
      bestInBand = result;
      continue;
    }

    if (!bestOverTarget || disclaimer.area < bestOverTarget.disclaimerArea) {
      bestOverTarget = result;
    }
  }

  if (bestInBand ?? bestOverTarget) {
    return bestInBand ?? bestOverTarget;
  }

  return bestEffort ? bestBelowTarget : null;
}

/** Аварийный вариант: дисклеймер минимальным кеглём, площадь не гарантирована */
function buildText2HardFallback({
  cellWidth,
  text,
  title,
  targetPercent,
  innerWidth,
  gap,
  minCopyWidth,
  minFontSizePx,
  minLines = 1,
  maxLines,
  preferredLines = null,
  includeDisclaimerInRowHeight = false,
}) {
  const normalized = normalizeDisclaimerText(text);
  const maxDisclaimerWidth = Math.max(1, innerWidth - gap - minCopyWidth);
  const minDisclaimerLines = Math.max(1, Math.min(minLines, maxLines));

  let disclaimer = null;
  for (let n = maxLines; n >= minDisclaimerLines && !disclaimer; n -= 1) {
    disclaimer =
      n <= 1
        ? null
        : packBalancedMultiline(
            text,
            minFontSizePx,
            maxDisclaimerWidth,
            n,
            preferredLines,
          );
  }

  if (!disclaimer && minDisclaimerLines <= 1) {
    const lineHeight = lineHeightForDisclaimerFontSize(minFontSizePx);
    disclaimer = {
      fontSizePx: minFontSizePx,
      width: maxDisclaimerWidth,
      height: lineHeight,
      lines: [normalized],
      lineHeight,
      area: 0,
    };
  }

  if (!disclaimer) {
    const lineHeight = lineHeightForDisclaimerFontSize(minFontSizePx);
    const lines =
      minDisclaimerLines >= 2
        ? balancedWrapByWords(normalized.split(/\s+/).filter(Boolean), minDisclaimerLines)
        : [normalized];
    disclaimer = {
      fontSizePx: minFontSizePx,
      width: maxDisclaimerWidth,
      height: lineHeight * lines.length,
      lines,
      lineHeight,
      area: 0,
      singleLine: false,
    };
  }

  const copyWidth = getSuggestCopyWidth(cellWidth, disclaimer.width);
  const copyHeight = getTextModeCopyHeight(
    'stacked',
    title,
    Math.max(copyWidth, minCopyWidth),
  );
  const rowHeight = getTextModeInlineRowHeight(
    copyHeight,
    disclaimer.height,
    includeDisclaimerInRowHeight,
  );
  const targetArea = getTextModeTargetArea(cellWidth, rowHeight, targetPercent);

  return buildTextModeResult({
    placement: 'inline',
    copyLayout: 'stacked',
    cellWidth,
    cellHeight: rowHeight,
    targetArea,
    disclaimer,
    copyWidth,
  });
}

export function solveTextMode2RowLayout({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  minFontSizePx = DISCLAIMER_TEXT_2_MIN_FONT_SIZE_PX,
  minLines = 1,
  maxLines = DISCLAIMER_TEXT_2_MAX_LINES,
  maxTitleLines = DISCLAIMER_TEXT_2_MAX_TITLE_LINES,
  preferredLines = null,
  includeDisclaimerInRowHeight = false,
}) {
  const minDisclaimerLines = Math.max(1, Math.min(minLines, maxLines));
  const innerWidth = cellWidth - SUGGEST_ROW_COPY_CHROME_PX;
  const gap = SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX;
  const inlineCopyWidth = measureCopyInlineWidth(title, domain);
  const metaWidth = measureMetaBlockWidth(domain);

  // мин. ширина copy под заголовок в ≤ N строк (приоритет ширине тайтла)
  const titleWidthForLines = (lines) =>
    Math.max(metaWidth, measureTitleWidthForMaxLines(title, lines));

  // Приоритет: тайтл+сайт в строку (дисклеймер min..N) → stacked тайтл 1 строка
  // → stacked тайтл 2 строки только при дисклеймере ≥ 2 строк.
  const candidates = [];
  if (minDisclaimerLines <= 1) {
    candidates.push({
      copyLayout: 'inline',
      lineCount: 1,
      minCopyWidth: inlineCopyWidth,
    });
  } else {
    // финансы / банкротство: дисклеймер ≥ 2 строк, но copy может оставаться inline
    for (let n = minDisclaimerLines; n <= maxLines; n += 1) {
      candidates.push({
        copyLayout: 'inline',
        lineCount: n,
        minCopyWidth: inlineCopyWidth,
      });
    }
  }
  const titleOneLineWidth = titleWidthForLines(1);
  for (let n = minDisclaimerLines; n <= maxLines; n += 1) {
    candidates.push({
      copyLayout: 'stacked',
      lineCount: n,
      minCopyWidth: titleOneLineWidth,
    });
  }
  if (maxTitleLines >= 2) {
    const titleTwoLineWidth = titleWidthForLines(2);
    const titleTwoMinLines = Math.max(2, minDisclaimerLines);
    for (let n = titleTwoMinLines; n <= maxLines; n += 1) {
      candidates.push({
        copyLayout: 'stacked',
        lineCount: n,
        minCopyWidth: titleTwoLineWidth,
      });
    }
  }

  const evalCandidate = (candidate, bestEffort) => {
    const { minCopyWidth } = candidate;
    const maxDisclaimerWidth = innerWidth - gap - minCopyWidth;
    if (maxDisclaimerWidth < 1) {
      return null;
    }
    return findText2DisclaimerFit({
      cellWidth,
      text,
      title,
      targetPercent,
      copyLayout: candidate.copyLayout,
      lineCount: candidate.lineCount,
      maxDisclaimerWidth,
      minCopyWidth,
      minFontSizePx,
      preferredLines,
      bestEffort,
      includeDisclaimerInRowHeight,
    });
  };

  // Проход 1: строго по площади — первый кандидат по приоритету, добравший до цели.
  for (const candidate of candidates) {
    const best = evalCandidate(candidate, false);
    if (best) {
      return best;
    }
  }

  // Проход 2 (площадь недостижима строго): берём максимально близкий по площади.
  let bestEffort = null;
  for (const candidate of candidates) {
    const result = evalCandidate(candidate, true);
    if (
      result &&
      (!bestEffort || result.disclaimerArea > bestEffort.disclaimerArea)
    ) {
      bestEffort = result;
    }
  }
  if (bestEffort) {
    return bestEffort;
  }

  return buildText2HardFallback({
    cellWidth,
    text,
    title,
    targetPercent,
    innerWidth,
    gap,
    minCopyWidth: titleWidthForLines(maxTitleLines),
    minFontSizePx,
    minLines: minDisclaimerLines,
    maxLines,
    preferredLines,
    includeDisclaimerInRowHeight,
  });
}

/**
 * Текстовое 3: дисклеймер всегда под заголовком и сайтом.
 * Кегль как в «Текстовое» (от 8 px), подбор под целевую площадь, 1+ строк по необходимости.
 */
export function solveTextMode3RowLayout(params) {
  return withDisclaimerFontWeightResolver(getDisclaimerText3FontWeight, () =>
    solveTextMode3RowLayoutInner(params),
  );
}

function solveTextMode3RowLayoutInner({
  cellWidth,
  text,
  title,
  domain,
  targetPercent,
  maxBelowDisclaimerHeight = null,
  minFontSizePx = DISCLAIMER_TEXT_MIN_FONT_SIZE_PX,
}) {
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
  const copyLayout = resolveTextModeCopyLayout(title, domain, copyWidth);
  const copyBlockHeight = getTextModeRowContentHeight(copyLayout, title, copyWidth);
  const targetArea = getTextModeTargetArea(cellWidth, copyBlockHeight, targetPercent);
  const normalized = normalizeDisclaimerText(text);
  const lineHeight = lineHeightForDisclaimerFontSize(minFontSizePx);
  const fallbackLines = normalized
    ? wrapDisclaimerTextLines(normalized, copyWidth, minFontSizePx)
    : [];
  const disclaimerHeight = Math.max(
    lineHeight,
    lineHeight * Math.max(1, fallbackLines.length),
  );
  const rowHeight =
    copyBlockHeight + TEXT_MODE_DISCLAIMER_BELOW_GAP_PX + disclaimerHeight;

  return buildTextModeResult({
    placement: 'below',
    copyLayout,
    cellWidth,
    cellHeight: rowHeight,
    targetArea,
    disclaimer: {
      fontSizePx: minFontSizePx,
      width: copyWidth,
      height: disclaimerHeight,
      lines: fallbackLines.length > 0 ? fallbackLines : [normalized],
      lineHeight,
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
