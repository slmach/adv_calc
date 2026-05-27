import {
  getAdaptiveDisclaimerDimensions,
  getAdaptiveSizingRules,
} from './disclaimerAdaptiveAssets.js';
import { solveDisclaimerFromCellArea } from './disclaimerAreaCalc.js';
import { DISCLAIMER_SCALING_ADAPTIVE } from './disclaimerScaling.js';
import {
  getSuggestRowPreviewTitle,
  SUGGEST_ROW_HORIZONTAL_CHROME_PX,
} from './suggestRowPreviewConstants.js';
import { isTitleWrappedAtWidth } from './titleWrapMeasure.js';

function getCopyWidth(cellWidth, disclaimerWidth) {
  return Math.max(
    0,
    cellWidth - SUGGEST_ROW_HORIZONTAL_CHROME_PX - disclaimerWidth,
  );
}

function getDisclaimerLayoutForVariant({
  category,
  cellWidth,
  cellHeight,
  targetPercent,
  variant,
}) {
  const dimensions = getAdaptiveDisclaimerDimensions(category.id, variant);

  if (!dimensions) {
    return null;
  }

  const { minHeight, minHeightKeepRatio } = getAdaptiveSizingRules(
    category.id,
    variant,
    category,
  );

  const result = solveDisclaimerFromCellArea({
    cellWidth,
    cellHeight,
    proportionW: dimensions.width,
    proportionH: dimensions.height,
    targetPercent,
    fixedCell: true,
    scalingMode: DISCLAIMER_SCALING_ADAPTIVE,
    minHeight,
    minHeightKeepRatio,
  });

  return {
    variant,
    dimensions,
    width: result.width,
  };
}

/**
 * Выбор _l / _s без DOM-петли: сначала пробуем _l, при переносе заголовка — _s.
 * Проверка переноса — по базовой высоте ячейки (пресет), без обратной связи от layout.
 */
export function resolveAdaptiveVariant({
  category,
  cellWidth,
  cellHeight,
  targetPercent,
}) {
  const previewTitle = getSuggestRowPreviewTitle(category.id);

  const wide = getDisclaimerLayoutForVariant({
    category,
    cellWidth,
    cellHeight,
    targetPercent,
    variant: 'l',
  });

  if (!wide) {
    return {
      variant: 'l',
      titleWrapped: false,
      proportionW: category.proportionW,
      proportionH: category.proportionH,
    };
  }

  const copyWidthWithWide = getCopyWidth(cellWidth, wide.width);
  const wrappedWithWide =
    copyWidthWithWide <= 0 ||
    isTitleWrappedAtWidth(previewTitle, copyWidthWithWide);

  if (!wrappedWithWide) {
    return {
      variant: 'l',
      titleWrapped: false,
      proportionW: wide.dimensions.width,
      proportionH: wide.dimensions.height,
    };
  }

  const compact = getDisclaimerLayoutForVariant({
    category,
    cellWidth,
    cellHeight,
    targetPercent,
    variant: 's',
  });

  if (!compact) {
    return {
      variant: 'l',
      titleWrapped: true,
      proportionW: wide.dimensions.width,
      proportionH: wide.dimensions.height,
    };
  }

  return {
    variant: 's',
    titleWrapped: isTitleWrappedAtWidth(
      previewTitle,
      getCopyWidth(cellWidth, compact.width),
    ),
    proportionW: compact.dimensions.width,
    proportionH: compact.dimensions.height,
  };
}
