import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX,
  DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX,
  DISCLAIMER_MAX_HEIGHT_PX,
  solveDisclaimerFromCellArea,
} from '../utils/disclaimerAreaCalc.js';
import {
  getAdaptiveDisclaimerPreviewMarkup,
  getAdaptiveSizingRules,
  getAdaptiveVariantLabel,
} from '../utils/disclaimerAdaptiveAssets.js';
import { getDisclaimerPreviewMarkup } from '../utils/disclaimerAssets.js';
import { resolveAdaptiveVariant } from '../utils/resolveAdaptiveDisclaimer.js';
import {
  DISCLAIMER_FIXED_TARGET_PERCENT,
  DISCLAIMER_SCALING_MODE_LABELS,
  isAdaptiveScalingMode,
  isFixedScalingMode,
  usesCategoryTargetPercent,
} from '../utils/disclaimerScaling.js';
import {
  getSuggestRowPreviewDomain,
  getSuggestRowPreviewTitle,
} from '../utils/suggestRowPreviewConstants.js';
import SuggestRowPreview from './SuggestRowPreview.jsx';

function formatArea(value) {
  return `${value.toLocaleString('ru-RU')} px²`;
}

function formatPercent(value) {
  return `${value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export default function DisclaimerCategoryRow({
  category,
  cellWidth,
  cellHeight,
  showDisclaimerHighlight,
  scalingMode,
}) {
  const fixedScaling = isFixedScalingMode(scalingMode);
  const adaptiveScaling = isAdaptiveScalingMode(scalingMode);
  const [layoutCellHeight, setLayoutCellHeight] = useState(cellHeight);

  useEffect(() => {
    setLayoutCellHeight(cellHeight);
  }, [cellWidth, cellHeight, scalingMode]);

  const handleLayoutHeight = useCallback(
    (measuredHeight) => {
      const nextHeight = Math.max(
        cellHeight,
        Math.ceil(measuredHeight),
      );

      setLayoutCellHeight((prev) =>
        Math.abs(prev - nextHeight) < 1 ? prev : nextHeight,
      );
    },
    [cellHeight],
  );

  const targetPercent = usesCategoryTargetPercent(scalingMode)
    ? category.targetPercent
    : DISCLAIMER_FIXED_TARGET_PERCENT;

  const adaptiveVariantResolved = useMemo(() => {
    if (!adaptiveScaling) {
      return null;
    }

    return resolveAdaptiveVariant({
      category,
      cellWidth,
      cellHeight,
      targetPercent,
    });
  }, [adaptiveScaling, category, cellWidth, cellHeight, targetPercent]);

  const proportionW = adaptiveVariantResolved?.proportionW ?? category.proportionW;
  const proportionH = adaptiveVariantResolved?.proportionH ?? category.proportionH;
  const adaptiveVariant = adaptiveVariantResolved?.variant ?? 'l';
  const titleWrapped = adaptiveVariantResolved?.titleWrapped ?? false;

  const adaptiveSizing = adaptiveScaling
    ? getAdaptiveSizingRules(category.id, adaptiveVariant, category)
    : null;

  const effectiveMinHeight = fixedScaling
    ? null
    : (adaptiveSizing?.minHeight ?? category.minHeight);
  const effectiveMinHeightKeepRatio = fixedScaling
    ? false
    : (adaptiveSizing?.minHeightKeepRatio ?? category.minHeightKeepRatio);

  const result = useMemo(() => {
    return solveDisclaimerFromCellArea({
      cellWidth,
      cellHeight: layoutCellHeight,
      proportionW,
      proportionH,
      targetPercent,
      fixedCell: true,
      scalingMode,
      minHeight: effectiveMinHeight,
      minHeightKeepRatio: effectiveMinHeightKeepRatio,
    });
  }, [
    cellWidth,
    layoutCellHeight,
    proportionW,
    proportionH,
    effectiveMinHeight,
    effectiveMinHeightKeepRatio,
    targetPercent,
    scalingMode,
    fixedScaling,
  ]);

  const markup = useMemo(() => {
    if (adaptiveScaling) {
      return getAdaptiveDisclaimerPreviewMarkup(category.id, adaptiveVariant, {
        stretch: true,
      });
    }

    return getDisclaimerPreviewMarkup(category.id, { stretch: true });
  }, [adaptiveScaling, category.id, adaptiveVariant]);

  return (
    <article className="disclaimer-calc__row">
      <div className="disclaimer-calc__row-preview-scroll">
        <SuggestRowPreview
          width={cellWidth}
          height={layoutCellHeight}
          title={getSuggestRowPreviewTitle(category.id)}
          domain={getSuggestRowPreviewDomain(category.id)}
          disclaimerWidth={result.width}
          disclaimerHeight={result.height}
          disclaimerMarkup={markup}
          showDisclaimerHighlight={showDisclaimerHighlight}
          centerDisclaimerInCell={fixedScaling}
          onLayoutHeight={handleLayoutHeight}
        />
      </div>

      <details className="disclaimer-calc__row-details">
        <summary className="disclaimer-calc__row-summary">
          <span className="disclaimer-calc__row-summary-size">
            {result.width} × {result.height} px
          </span>
          <span className="disclaimer-calc__row-summary-label">{category.label}</span>
        </summary>

        <div className="disclaimer-calc__row-panel">
          <p className="disclaimer-calc__row-panel-size">
            <span className="disclaimer-calc__size-value">{result.width}</span>
            <span className="disclaimer-calc__size-sep">×</span>
            <span className="disclaimer-calc__size-value">{result.height}</span>
            <span className="disclaimer-calc__size-unit">px</span>
          </p>

          <dl className="disclaimer-calc__metrics">
            <div>
              <dt>Ячейка</dt>
              <dd>
                {cellWidth} × {result.cellHeight} px ({formatArea(result.cellArea)})
                {result.cellHeight > cellHeight && (
                  <span className="disclaimer-calc__hint-inline">
                    {' '}
                    (базовая высота {cellHeight} px)
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt>Режим масштабирования</dt>
              <dd>{DISCLAIMER_SCALING_MODE_LABELS[scalingMode]}</dd>
            </div>
            {adaptiveScaling && (
              <div>
                <dt>Макет дисклеймера</dt>
                <dd>
                  {getAdaptiveVariantLabel(adaptiveVariant)}
                  {titleWrapped
                    ? ' — заголовок перенесён'
                    : ' — заголовок в одну строку'}
                  {' '}
                  ({proportionW}×{proportionH} px)
                </dd>
              </div>
            )}
            <div>
              <dt>Соотношение дисклеймера</dt>
              <dd>
                {proportionW}:{proportionH}, норма{' '}
                {formatPercent(targetPercent)}
                {!usesCategoryTargetPercent(scalingMode) &&
                  category.targetPercent !== targetPercent && (
                  <span className="disclaimer-calc__hint-inline">
                    {' '}
                    (для типа {formatPercent(category.targetPercent)})
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt>Площадь дисклеймера</dt>
              <dd>{formatArea(result.disclaimerArea)}</dd>
            </div>
            <div>
              <dt>Целевая площадь ({formatPercent(targetPercent)})</dt>
              <dd>{formatArea(Math.round(result.targetArea))}</dd>
            </div>
            <div>
              <dt>Фактическая доля от ячейки</dt>
              <dd>
                {formatPercent(result.actualPercent)}
                {!result.targetMet && (
                  <span className="disclaimer-calc__warn">
                    {' '}
                    — цель {formatPercent(targetPercent)} не достигнута
                  </span>
                )}
              </dd>
            </div>
            {result.heightFloored && effectiveMinHeight && (
              <div>
                <dt>Минимальная высота</dt>
                <dd>
                  {effectiveMinHeightKeepRatio
                    ? `Не ниже ${effectiveMinHeight} px с пропорциями макета (${result.width} × ${result.height} px)`
                    : `Высота ${result.height} px, ширина ${result.width} px под целевую площадь`}
                </dd>
              </div>
            )}
            {result.heightCapped && (
              <div>
                <dt>
                  {fixedScaling ? 'Размер дисклеймера' : `Высота ${DISCLAIMER_MAX_HEIGHT_PX} px`}
                </dt>
                <dd>
                  {fixedScaling
                    ? `${result.width} × ${result.height} px (высота ячейки ${result.cellHeight} px − ${DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX} px, мин. ширина ${DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX} px)`
                    : `Ширина ${result.width} px — увеличена под целевую площадь`}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </details>
    </article>
  );
}
