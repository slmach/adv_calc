import { SUGGEST_ROW_PREVIEW_TITLE } from './suggestRowPreviewConstants.js';

/** line-height заголовка в suggest_row (SuggestRowPreview.css) */
export const SUGGEST_ROW_TITLE_LINE_HEIGHT_PX = 20;

const TITLE_FONT =
  "400 15px 'YS Text', 'Helvetica Neue', Arial, sans-serif";

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

/** Число строк заголовка при заданной ширине блока copy (px) */
export function countTitleLinesAtWidth(
  text = SUGGEST_ROW_PREVIEW_TITLE,
  maxWidth,
) {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return 1;
  }

  const ctx = getMeasureContext();
  if (!ctx) {
    return 1;
  }

  ctx.font = TITLE_FONT;

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 1;
  }

  let lines = 1;
  let lineWidth = 0;

  for (const word of words) {
    const wordWidth = ctx.measureText(word).width;
    const spaceWidth = lineWidth > 0 ? ctx.measureText(' ').width : 0;
    const nextWidth = lineWidth + spaceWidth + wordWidth;

    if (nextWidth > maxWidth && lineWidth > 0) {
      lines += 1;
      lineWidth = wordWidth;
    } else {
      lineWidth = nextWidth;
    }
  }

  return lines;
}

/** Минимальная ширина блока (px), при которой заголовок укладывается в ≤ maxLines строк */
export function measureTitleWidthForMaxLines(
  text = SUGGEST_ROW_PREVIEW_TITLE,
  maxLines = 2,
) {
  const ctx = getMeasureContext();
  if (!ctx) {
    return 0;
  }

  ctx.font = TITLE_FONT;

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 0;
  }

  let hi = Math.ceil(ctx.measureText(text).width);
  let lo = 0;
  for (const word of words) {
    lo = Math.max(lo, Math.ceil(ctx.measureText(word).width));
  }

  if (countTitleLinesAtWidth(text, hi) > maxLines) {
    return hi;
  }

  let best = hi;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid <= 0) {
      break;
    }
    if (countTitleLinesAtWidth(text, mid) <= maxLines) {
      best = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  return best;
}

export function isTitleWrappedAtWidth(text, maxWidth) {
  // Нет места под заголовок (узкий _l + широкий дисклеймер) — нужен _s
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return true;
  }

  const ctx = getMeasureContext();
  if (ctx) {
    ctx.font = TITLE_FONT;
    if (ctx.measureText(text).width > maxWidth) {
      return true;
    }
  }

  return countTitleLinesAtWidth(text, maxWidth) > 1;
}

/** DOM-измерение (для отладки / превью) */
export function isSuggestTitleWrapped(titleElement) {
  if (!titleElement) {
    return false;
  }

  return titleElement.scrollHeight > SUGGEST_ROW_TITLE_LINE_HEIGHT_PX + 1;
}
