import bankcrSvg from '../../assets/disclamers/bankcr.svg?raw';
import dietSvg from '../../assets/disclamers/diet.svg?raw';
import energySvg from '../../assets/disclamers/energy.svg?raw';
import financeSvg from '../../assets/disclamers/finance.svg?raw';
import medSvg from '../../assets/disclamers/med.svg?raw';
import { parseSvgDimensions, prepareStretchableSvg } from './parseSvgDimensions.js';

const CATEGORY_CONFIG = [
  { id: 'medicine', label: 'Медицина', targetPercent: 5, svg: medSvg },
  { id: 'finance', label: 'Финансы', targetPercent: 10, svg: financeSvg },
  { id: 'diet', label: 'Диета', targetPercent: 10, svg: dietSvg },
  {
    id: 'bankruptcy',
    label: 'Банкротство',
    targetPercent: 8,
    minHeight: 26,
    minHeightKeepRatio: true,
    svg: bankcrSvg,
  },
  { id: 'energy', label: 'Энергетики', targetPercent: 7, svg: energySvg },
];

function buildCategory({ id, label, targetPercent, minHeight, minHeightKeepRatio, svg }) {
  const dimensions = parseSvgDimensions(svg);

  if (!dimensions) {
    throw new Error(`Не удалось прочитать размеры SVG для типа «${label}»`);
  }

  return {
    id,
    label,
    targetPercent,
    minHeight: minHeight ?? null,
    minHeightKeepRatio: Boolean(minHeightKeepRatio),
    proportionW: dimensions.width,
    proportionH: dimensions.height,
  };
}

export const DISCLAIMER_CATEGORIES = CATEGORY_CONFIG.map(buildCategory);

export function getDisclaimerCategory(id) {
  return DISCLAIMER_CATEGORIES.find((item) => item.id === id);
}

const DISCLAIMER_SVG_RAW = Object.fromEntries(
  CATEGORY_CONFIG.map(({ id, svg }) => [id, svg]),
);

const markupCache = new Map();

/** Inline SVG для зоны дисклеймера */
export function getDisclaimerPreviewMarkup(categoryId, { stretch = true } = {}) {
  const raw = DISCLAIMER_SVG_RAW[categoryId];
  if (!raw) {
    return null;
  }

  const cacheKey = `${categoryId}:${stretch ? 'stretch' : 'fit'}`;

  if (!markupCache.has(cacheKey)) {
    markupCache.set(cacheKey, prepareStretchableSvg(raw, { stretch }));
  }

  return markupCache.get(cacheKey);
}
