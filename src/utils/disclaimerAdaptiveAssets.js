import bankcrL from '../../assets/disclamers_alt/bankcr_l.svg?raw';
import bankcrS from '../../assets/disclamers_alt/bankcr_s.svg?raw';
import dietL from '../../assets/disclamers_alt/diet_l.svg?raw';
import dietS from '../../assets/disclamers_alt/diet_s.svg?raw';
import energyL from '../../assets/disclamers_alt/energy_l.svg?raw';
import energyS from '../../assets/disclamers_alt/energy_s.svg?raw';
import financeL from '../../assets/disclamers_alt/finance_l.svg?raw';
import financeS from '../../assets/disclamers_alt/finance_s.svg?raw';
import medL from '../../assets/disclamers_alt/med_l.svg?raw';
import medS from '../../assets/disclamers_alt/med_s.svg?raw';
import { parseSvgDimensions, prepareStretchableSvg } from './parseSvgDimensions.js';

/** @typedef {'s' | 'l'} DisclaimerAdaptiveVariant */

const FILE_PREFIX_BY_CATEGORY = {
  medicine: 'med',
  finance: 'finance',
  diet: 'diet',
  bankruptcy: 'bankcr',
  energy: 'energy',
};

const RAW_BY_PREFIX = {
  med: { s: medS, l: medL },
  finance: { s: financeS, l: financeL },
  diet: { s: dietS, l: dietL },
  bankcr: { s: bankcrS, l: bankcrL },
  energy: { s: energyS, l: energyL },
};

const dimensionsCache = new Map();
const markupCache = new Map();

function getFilePrefix(categoryId) {
  return FILE_PREFIX_BY_CATEGORY[categoryId] ?? null;
}

function getRawSvg(categoryId, variant) {
  const prefix = getFilePrefix(categoryId);
  if (!prefix) {
    return null;
  }

  return RAW_BY_PREFIX[prefix]?.[variant] ?? null;
}

/** Пропорции макета из SVG (_s — узкая строка / перенос заголовка, _l — широкая) */
export function getAdaptiveDisclaimerDimensions(categoryId, variant) {
  const cacheKey = `${categoryId}:${variant}`;

  if (!dimensionsCache.has(cacheKey)) {
    const raw = getRawSvg(categoryId, variant);
    if (!raw) {
      dimensionsCache.set(cacheKey, null);
    } else {
      dimensionsCache.set(cacheKey, parseSvgDimensions(raw));
    }
  }

  return dimensionsCache.get(cacheKey);
}

/** Inline SVG для адаптивного режима */
export function getAdaptiveDisclaimerPreviewMarkup(
  categoryId,
  variant,
  { stretch = true } = {},
) {
  const raw = getRawSvg(categoryId, variant);
  if (!raw) {
    return null;
  }

  const cacheKey = `${categoryId}:${variant}:${stretch ? 'stretch' : 'fit'}`;

  if (!markupCache.has(cacheKey)) {
    markupCache.set(cacheKey, prepareStretchableSvg(raw, { stretch }));
  }

  return markupCache.get(cacheKey);
}

export function getAdaptiveVariantLabel(variant) {
  return variant === 's' ? 'компактный (_s)' : 'широкий (_l)';
}

export const BANKRUPTCY_ADAPTIVE_L_MIN_HEIGHT_PX = 16;

/** Минимальная высота и режим пропорций для расчёта в адаптивном режиме */
export function getAdaptiveSizingRules(categoryId, variant, category) {
  if (categoryId === 'bankruptcy' && variant === 'l') {
    return {
      minHeight: BANKRUPTCY_ADAPTIVE_L_MIN_HEIGHT_PX,
      minHeightKeepRatio: true,
    };
  }

  return {
    minHeight: category.minHeight ?? null,
    minHeightKeepRatio: Boolean(category.minHeightKeepRatio),
  };
}
