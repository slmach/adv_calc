import {
  countTitleLinesAtWidth,
  SUGGEST_ROW_TITLE_LINE_HEIGHT_PX,
} from './titleWrapMeasure.js';

const TITLE_FONT =
  "400 15px 'YS Text', 'Helvetica Neue', Arial, sans-serif";
const META_DOT_FONT =
  "400 14px 'YS Text Web', 'YS Text', 'Helvetica Neue', Arial, sans-serif";
const META_AD_FONT =
  "400 12px 'YS Text', 'Helvetica Neue', Arial, sans-serif";

const COPY_INLINE_GAP_PX = 8;

/** Вертикальные отступы строки suggest_row (SuggestRowPreview.css) */
export const SUGGEST_ROW_PADDING_Y_PX = 10;

/** padding 16+14, favicon 20, gaps, кнопка (i) 20 */
export const SUGGEST_ROW_COPY_CHROME_PX = 74;

/** Зазор между copy и дисклеймером в одной строке */
export const SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX = 12;

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

function measureMetaWidth(ctx, domain, adLabel = 'Реклама') {
  ctx.font = META_AD_FONT;
  const adWidth = ctx.measureText(adLabel).width;
  ctx.font = META_DOT_FONT;
  const dotWidth = ctx.measureText('·').width;
  ctx.font = TITLE_FONT;
  const domainWidth = ctx.measureText(domain).width;
  return domainWidth + 3 + dotWidth + 3 + adWidth;
}

/** Ширина мета-блока: «домен · Реклама» в одну строку */
export function measureMetaBlockWidth(domain) {
  const ctx = getMeasureContext();
  if (!ctx) {
    return 0;
  }

  return Math.ceil(measureMetaWidth(ctx, domain));
}

/** Реальная ширина copy: полный заголовок + сайт + «Реклама» в одну строку */
export function measureCopyInlineWidth(title, domain) {
  const ctx = getMeasureContext();
  if (!ctx) {
    return 0;
  }

  ctx.font = TITLE_FONT;
  const titleWidth = ctx.measureText(title).width;
  const metaWidth = measureMetaWidth(ctx, domain);

  return Math.ceil(titleWidth + COPY_INLINE_GAP_PX + metaWidth);
}

/** Ширина блока copy рядом с дисклеймером */
export function getSuggestCopyWidth(cellWidth, disclaimerWidth = 0) {
  return Math.max(
    0,
    cellWidth -
      SUGGEST_ROW_COPY_CHROME_PX -
      Math.max(0, disclaimerWidth) -
      SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX,
  );
}

/** Заголовок + сайт + метка влезают в copyWidth (полный текст, без ellipsis) */
export function fitsCopyInlineOnOneLine(title, domain, copyWidth) {
  if (!Number.isFinite(copyWidth) || copyWidth <= 0) {
    return false;
  }

  return measureCopyInlineWidth(title, domain) <= copyWidth;
}

/**
 * inline — заголовок и сайт в одну строку;
 * stacked — сайт и метка под заголовком.
 */
export function resolveTextModeCopyLayout(title, domain, copyWidth) {
  if (fitsCopyInlineOnOneLine(title, domain, copyWidth)) {
    return 'inline';
  }

  return 'stacked';
}

/** Высота блока copy */
export function getTextModeCopyHeight(layout, title, copyWidth) {
  if (layout === 'inline') {
    return SUGGEST_ROW_TITLE_LINE_HEIGHT_PX;
  }

  const titleLines = countTitleLinesAtWidth(title, copyWidth);
  return (
    titleLines * SUGGEST_ROW_TITLE_LINE_HEIGHT_PX + SUGGEST_ROW_TITLE_LINE_HEIGHT_PX
  );
}

/** Высота строки без дисклеймера под copy */
export function getTextModeRowContentHeight(layout, title, copyWidth) {
  return (
    SUGGEST_ROW_PADDING_Y_PX * 2 + getTextModeCopyHeight(layout, title, copyWidth)
  );
}
