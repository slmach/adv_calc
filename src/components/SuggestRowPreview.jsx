import { useLayoutEffect, useMemo, useRef } from 'react';
import iconInfo from '../../assets/icon-info.svg';
import defaultDisclaimerRow from '../../assets/disclaimer-row-default.svg';
import {
  getDisclaimerTextFontWeight,
  lineHeightForDisclaimerFontSize,
} from '../utils/disclaimerTextLayout.js';
import {
  getSuggestCopyWidth,
  resolveTextModeCopyLayout,
  SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX,
} from '../utils/suggestTextCopyLayout.js';
import {
  getSuggestRowPreviewDomain,
  getSuggestRowPreviewTitle,
} from '../utils/suggestRowPreviewConstants.js';
import './SuggestRowPreview.css';

function DisclaimerBlock({
  disclaimerWidth,
  disclaimerHeight,
  disclaimerFontSize,
  disclaimerLineHeight,
  disclaimerSingleLine,
  disclaimerText,
  disclaimerRenderLines,
  disclaimerMarkup,
  disclaimerImage,
  showDisclaimerHighlight,
}) {
  if (!(disclaimerWidth > 0 && disclaimerHeight > 0)) {
    return null;
  }

  const renderMultiline =
    Array.isArray(disclaimerRenderLines) && disclaimerRenderLines.length > 1;

  const textStyle = disclaimerText
    ? {
        fontWeight: getDisclaimerTextFontWeight(disclaimerFontSize),
        ...(disclaimerFontSize != null
          ? {
              fontSize: `${disclaimerFontSize}px`,
              lineHeight:
                disclaimerLineHeight != null
                  ? `${disclaimerLineHeight}px`
                  : undefined,
            }
          : {}),
      }
    : undefined;

  return (
    <div
      className={`suggest-row-preview__disclaimer${showDisclaimerHighlight ? ' suggest-row-preview__disclaimer--highlight' : ''}${disclaimerText ? ' suggest-row-preview__disclaimer--text' : ''}`}
      style={{
        width: `${disclaimerWidth}px`,
        height: `${disclaimerHeight}px`,
        ...(disclaimerMarkup || disclaimerText
          ? undefined
          : {
              backgroundImage: `url(${disclaimerImage})`,
            }),
      }}
      {...(disclaimerMarkup && !disclaimerText
        ? {
            dangerouslySetInnerHTML: { __html: disclaimerMarkup },
          }
        : {})}
    >
      {disclaimerText && (
        <span
          className={[
            'suggest-row-preview__disclaimer-text',
            disclaimerSingleLine &&
              !renderMultiline &&
              'suggest-row-preview__disclaimer-text--single-line',
            renderMultiline && 'suggest-row-preview__disclaimer-text--multiline',
          ]
            .filter(Boolean)
            .join(' ')}
          style={textStyle}
        >
          {renderMultiline
            ? disclaimerRenderLines.map((line, index) => (
                <span
                  key={`${index}-${line}`}
                  className="suggest-row-preview__disclaimer-line"
                >
                  {line}
                </span>
              ))
            : disclaimerText}
        </span>
      )}
    </div>
  );
}

export default function SuggestRowPreview({
  width = 1190,
  height = 60,
  title,
  domain,
  disclaimerWidth,
  disclaimerHeight,
  disclaimerFontSize,
  disclaimerLineHeight: disclaimerLineHeightProp,
  disclaimerPlacement,
  disclaimerSingleLine,
  textCopyLayout: textCopyLayoutProp,
  copyWidth: copyWidthProp,
  disclaimerSrc,
  disclaimerMarkup,
  disclaimerText,
  disclaimerRenderLines,
  showDisclaimerHighlight = true,
  centerDisclaimerInCell = false,
  onLayoutHeight,
}) {
  const rootRef = useRef(null);
  const disclaimerImage = disclaimerSrc || defaultDisclaimerRow;
  const previewTitle = title ?? getSuggestRowPreviewTitle('medicine');
  const previewDomain = domain ?? getSuggestRowPreviewDomain('medicine');
  const textMode = Boolean(disclaimerText);
  const disclaimerInline = disclaimerPlacement !== 'below';

  const resolvedCopyWidth = useMemo(() => {
    if (copyWidthProp != null) {
      return copyWidthProp;
    }

    return getSuggestCopyWidth(
      width,
      disclaimerInline ? disclaimerWidth : 0,
    );
  }, [copyWidthProp, width, disclaimerInline, disclaimerWidth]);

  const textCopyLayout = useMemo(() => {
    if (!textMode) {
      return null;
    }

    if (textCopyLayoutProp) {
      return textCopyLayoutProp;
    }

    return resolveTextModeCopyLayout(
      previewTitle,
      previewDomain,
      resolvedCopyWidth,
    );
  }, [
    textMode,
    textCopyLayoutProp,
    previewTitle,
    previewDomain,
    resolvedCopyWidth,
  ]);

  const disclaimerLineHeight =
    disclaimerLineHeightProp ??
    (disclaimerFontSize != null
      ? lineHeightForDisclaimerFontSize(disclaimerFontSize)
      : undefined);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node || !onLayoutHeight) {
      return undefined;
    }

    const report = () => {
      onLayoutHeight(node.getBoundingClientRect().height);
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);

    return () => observer.disconnect();
  }, [
    onLayoutHeight,
    width,
    height,
    previewTitle,
    previewDomain,
    disclaimerWidth,
    disclaimerHeight,
    disclaimerFontSize,
    disclaimerPlacement,
    disclaimerMarkup,
    disclaimerText,
    textCopyLayout,
    showDisclaimerHighlight,
    centerDisclaimerInCell,
  ]);

  const rootClassName = [
    'suggest-row-preview',
    centerDisclaimerInCell && 'suggest-row-preview--center-disclaimer',
    textMode && disclaimerInline && 'suggest-row-preview--text-disclaimer-inline',
    textMode && !disclaimerInline && 'suggest-row-preview--text-disclaimer-below',
    textCopyLayout === 'inline' && 'suggest-row-preview--text-copy-inline',
    textCopyLayout === 'stacked' && 'suggest-row-preview--text-copy-stacked',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={rootRef}
      className={rootClassName}
      style={{
        width: `${width}px`,
        minHeight: `${height}px`,
        ...(centerDisclaimerInCell
          ? { '--row-min-height': `${height}px` }
          : undefined),
      }}
      data-name="suggest_row"
    >
      <div className="suggest-row-preview__left">
        <div className="suggest-row-preview__favicon-wrap" aria-hidden="true">
          <div className="suggest-row-preview__favicon" />
        </div>

        <div className="suggest-row-preview__content">
          <div
            className="suggest-row-preview__title-row"
            style={
              textMode && disclaimerInline && disclaimerWidth > 0
                ? {
                    paddingRight: `${disclaimerWidth + SUGGEST_ROW_COPY_DISCLAIMER_GAP_PX}px`,
                  }
                : undefined
            }
          >
            <div
              className="suggest-row-preview__copy"
              style={
                textMode && resolvedCopyWidth > 0
                  ? { maxWidth: `${resolvedCopyWidth}px` }
                  : undefined
              }
            >
              <p className="suggest-row-preview__title">{previewTitle}</p>
              <div className="suggest-row-preview__meta">
                <span className="suggest-row-preview__domain">{previewDomain}</span>
                <span className="suggest-row-preview__dot" aria-hidden="true">
                  ·
                </span>
                <span className="suggest-row-preview__ad">Реклама</span>
              </div>
            </div>

            {disclaimerInline && (
              <DisclaimerBlock
                disclaimerWidth={disclaimerWidth}
                disclaimerHeight={disclaimerHeight}
                disclaimerFontSize={disclaimerFontSize}
                disclaimerLineHeight={disclaimerLineHeight}
                disclaimerSingleLine={disclaimerSingleLine}
                disclaimerText={disclaimerText}
                disclaimerRenderLines={disclaimerRenderLines}
                disclaimerMarkup={disclaimerMarkup}
                disclaimerImage={disclaimerImage}
                showDisclaimerHighlight={showDisclaimerHighlight}
              />
            )}
          </div>

          {!disclaimerInline && (
            <DisclaimerBlock
              disclaimerWidth={disclaimerWidth}
              disclaimerHeight={disclaimerHeight}
              disclaimerFontSize={disclaimerFontSize}
              disclaimerLineHeight={disclaimerLineHeight}
              disclaimerSingleLine={disclaimerSingleLine}
              disclaimerText={disclaimerText}
              disclaimerMarkup={disclaimerMarkup}
              disclaimerImage={disclaimerImage}
              showDisclaimerHighlight={showDisclaimerHighlight}
            />
          )}
        </div>
      </div>

      <div className="suggest-row-preview__right">
        <button
          type="button"
          className="suggest-row-preview__info"
          aria-label="Подробнее о рекламе"
        >
          <img src={iconInfo} alt="" width={18} height={18} />
        </button>
      </div>
    </article>
  );
}
