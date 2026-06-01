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
import {
  getDisclaimerPreviewText,
  getDisclaimerText2PreviewText,
  getDisclaimerText3PreviewText,
  getDisclaimerText2PreferredLines,
} from '../utils/disclaimerPreviewText.js';
import { resolveAdaptiveVariant } from '../utils/resolveAdaptiveDisclaimer.js';
import {
  DISCLAIMER_FIXED_TARGET_PERCENT,
  DISCLAIMER_SCALING_MODE_LABELS,
  isAdaptiveScalingMode,
  isAnyTextScalingMode,
  isFixedScalingMode,
  isText2ScalingMode,
  isText3ScalingMode,
  isTextScalingMode,
  usesCategoryTargetPercent,
} from '../utils/disclaimerScaling.js';
import {
  getDisclaimerTextFontWeight,
  getTextModeEffectiveTargetPercent,
  getText2MaxDisclaimerLines,
  getText2MinDisclaimerLines,
  solveTextMode2RowLayout,
  solveTextMode3RowLayout,
  solveTextModeRowLayout,
} from '../utils/disclaimerTextLayout.js';
import {
  getSuggestRowPreviewDomain,
  getSuggestRowPreviewTitle,
} from '../utils/suggestRowPreviewConstants.js';
import SuggestPanelPreview from './SuggestPanelPreview.jsx';
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
  themeId,
}) {
  const fixedScaling = isFixedScalingMode(scalingMode);
  const adaptiveScaling = isAdaptiveScalingMode(scalingMode);
  const textScaling = isTextScalingMode(scalingMode);
  const text2Scaling = isText2ScalingMode(scalingMode);
  const text3Scaling = isText3ScalingMode(scalingMode);
  const anyTextScaling = isAnyTextScalingMode(scalingMode);
  const [layoutCellHeight, setLayoutCellHeight] = useState(cellHeight);

  useEffect(() => {
    if (isAnyTextScalingMode(scalingMode)) {
      return;
    }

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

  const textModeTargetPercent = anyTextScaling
    ? getTextModeEffectiveTargetPercent(targetPercent)
    : targetPercent;

  const effectiveTargetPercent = anyTextScaling
    ? textModeTargetPercent
    : targetPercent;

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

  const previewTitle = getSuggestRowPreviewTitle(category.id);
  const previewDomain = getSuggestRowPreviewDomain(category.id);
  const previewDisclaimerText = text3Scaling
    ? getDisclaimerText3PreviewText(category.id)
    : text2Scaling
      ? getDisclaimerText2PreviewText(category.id)
      : getDisclaimerPreviewText(category.id);

  const result = useMemo(() => {
    if (text3Scaling) {
      return solveTextMode3RowLayout({
        cellWidth,
        text: previewDisclaimerText,
        title: previewTitle,
        domain: previewDomain,
        targetPercent,
      });
    }

    if (text2Scaling) {
      return solveTextMode2RowLayout({
        cellWidth,
        text: previewDisclaimerText,
        title: previewTitle,
        domain: previewDomain,
        targetPercent,
        minLines: getText2MinDisclaimerLines(category.id),
        maxLines: getText2MaxDisclaimerLines(category.id),
        preferredLines: getDisclaimerText2PreferredLines(category.id),
      });
    }

    if (textScaling) {
      return solveTextModeRowLayout({
        cellWidth,
        text: previewDisclaimerText,
        title: previewTitle,
        domain: previewDomain,
        targetPercent,
        maxInlineDisclaimerHeight: DISCLAIMER_MAX_HEIGHT_PX,
      });
    }

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
    textScaling,
    text2Scaling,
    text3Scaling,
    previewTitle,
    previewDomain,
    previewDisclaimerText,
    category.id,
  ]);

  const disclaimerText = anyTextScaling ? previewDisclaimerText : null;

  const markup = useMemo(() => {
    if (anyTextScaling) {
      return null;
    }

    if (adaptiveScaling) {
      return getAdaptiveDisclaimerPreviewMarkup(category.id, adaptiveVariant, {
        stretch: true,
      });
    }

    return getDisclaimerPreviewMarkup(category.id, { stretch: true });
  }, [adaptiveScaling, category.id, adaptiveVariant, anyTextScaling]);

  const previewRowHeight = anyTextScaling ? result.cellHeight : layoutCellHeight;

  return (
    <article className="disclaimer-calc__row">
      <div className="disclaimer-calc__row-preview-scroll">
        <SuggestPanelPreview
          width={cellWidth}
          themeId={themeId}
          categoryId={category.id}
        >
          <SuggestRowPreview
            width={cellWidth}
            height={previewRowHeight}
            title={getSuggestRowPreviewTitle(category.id)}
            domain={getSuggestRowPreviewDomain(category.id)}
            disclaimerWidth={result.width}
            disclaimerHeight={result.height}
            disclaimerFontSize={anyTextScaling ? result.fontSizePx : undefined}
            disclaimerLineHeight={anyTextScaling ? result.lineHeightPx : undefined}
            disclaimerPlacement={anyTextScaling ? result.placement : undefined}
            disclaimerSingleLine={
              anyTextScaling
                ? (result.disclaimerLines?.length ?? 1) <= 1
                : undefined
            }
            disclaimerRenderLines={
              anyTextScaling && result.disclaimerLines?.length > 1
                ? result.disclaimerLines
                : undefined
            }
            textCopyLayout={anyTextScaling ? result.copyLayout : undefined}
            copyWidth={anyTextScaling ? result.copyWidth : undefined}
            disclaimerMarkup={markup}
            disclaimerText={disclaimerText}
            showDisclaimerHighlight={showDisclaimerHighlight}
            centerDisclaimerInCell={fixedScaling}
            getDisclaimerFontWeight={getDisclaimerTextFontWeight}
            onLayoutHeight={anyTextScaling ? undefined : handleLayoutHeight}
          />
        </SuggestPanelPreview>
      </div>

      <details className="disclaimer-calc__row-details">
        <summary className="disclaimer-calc__row-summary">
          <span className="disclaimer-calc__row-summary-size">
            {result.width} × {result.height} px
            {anyTextScaling && result.fontSizePx != null
              ? ` · ${result.fontSizePx}px`
              : ''}
          </span>
          <span className="disclaimer-calc__row-summary-percent">
            {formatPercent(effectiveTargetPercent)}
            {' / '}
            <span className={!result.targetMet ? 'disclaimer-calc__warn' : undefined}>
              {formatPercent(result.actualPercent)}
            </span>
          </span>
          <span className="disclaimer-calc__row-summary-label">{category.label}</span>
        </summary>

        <div className="disclaimer-calc__row-panel">
          <p className="disclaimer-calc__row-panel-size">
            <span className="disclaimer-calc__size-value">{result.width}</span>
            <span className="disclaimer-calc__size-sep">×</span>
            <span className="disclaimer-calc__size-value">{result.height}</span>
            <span className="disclaimer-calc__size-unit">px</span>
            {anyTextScaling && result.fontSizePx != null && (
              <span className="disclaimer-calc__hint-inline">
                {' '}
                · кегль {result.fontSizePx} px
              </span>
            )}
          </p>

          <dl className="disclaimer-calc__metrics">
            <div>
              <dt>Ячейка</dt>
              <dd>
                {cellWidth} × {result.cellHeight} px ({formatArea(result.cellArea)})
                {anyTextScaling ? (
                  <span className="disclaimer-calc__hint-inline">
                    {' '}
                    (пресет {cellHeight} px; дисклеймер{' '}
                    {result.placement === 'inline' ? 'в строке' : 'под строкой'})
                  </span>
                ) : (
                  result.cellHeight > cellHeight && (
                    <span className="disclaimer-calc__hint-inline">
                      {' '}
                      (базовая высота {cellHeight} px)
                    </span>
                  )
                )}
              </dd>
            </div>
            <div>
              <dt>Режим масштабирования</dt>
              <dd>{DISCLAIMER_SCALING_MODE_LABELS[scalingMode]}</dd>
            </div>
            {anyTextScaling && (
              <div>
                <dt>Макет дисклеймера</dt>
                <dd>
                  {result.placement === 'inline'
                    ? 'Справа от copy'
                    : 'Под copy'}
                  {' · '}
                  copy:{' '}
                  {result.copyLayout === 'inline'
                    ? 'заголовок и сайт в одну строку'
                    : 'сайт под заголовком'}
                  {result.disclaimerLines?.length > 1 &&
                    ` · дисклеймер ${result.disclaimerLines.length} стр.`}
                </dd>
              </div>
            )}
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
              <dt>
                Целевая площадь (
                {formatPercent(anyTextScaling ? textModeTargetPercent : targetPercent)}
                {anyTextScaling && (
                  <span className="disclaimer-calc__hint-inline">
                    ; норма типа {formatPercent(targetPercent)} + 4 п.п.
                  </span>
                )}
                )
              </dt>
              <dd>{formatArea(Math.round(result.targetArea))}</dd>
            </div>
            <div>
              <dt>Фактическая доля от ячейки</dt>
              <dd>
                {formatPercent(result.actualPercent)}
                {!result.targetMet && (
                  <span className="disclaimer-calc__warn">
                    {' '}
                    — цель{' '}
                    {formatPercent(anyTextScaling ? textModeTargetPercent : targetPercent)}{' '}
                    не достигнута
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
