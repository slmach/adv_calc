import { useLayoutEffect, useRef } from 'react';
import iconInfo from '../../assets/icon-info.svg';
import defaultDisclaimerRow from '../../assets/disclaimer-row-default.svg';
import {
  getSuggestRowPreviewDomain,
  getSuggestRowPreviewTitle,
} from '../utils/suggestRowPreviewConstants.js';
import './SuggestRowPreview.css';

export default function SuggestRowPreview({
  width = 1190,
  height = 60,
  title,
  domain,
  disclaimerWidth,
  disclaimerHeight,
  disclaimerSrc,
  disclaimerMarkup,
  showDisclaimerHighlight = true,
  centerDisclaimerInCell = false,
  onLayoutHeight,
}) {
  const rootRef = useRef(null);
  const disclaimerImage = disclaimerSrc || defaultDisclaimerRow;
  const previewTitle = title ?? getSuggestRowPreviewTitle('medicine');
  const previewDomain = domain ?? getSuggestRowPreviewDomain('medicine');

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
    disclaimerMarkup,
    showDisclaimerHighlight,
    centerDisclaimerInCell,
  ]);

  return (
    <article
      ref={rootRef}
      className={`suggest-row-preview${centerDisclaimerInCell ? ' suggest-row-preview--center-disclaimer' : ''}`}
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
          <div className="suggest-row-preview__title-row">
            <div className="suggest-row-preview__copy">
              <p className="suggest-row-preview__title">{previewTitle}</p>
              <div className="suggest-row-preview__meta">
                <span className="suggest-row-preview__domain">{previewDomain}</span>
                <span className="suggest-row-preview__dot" aria-hidden="true">
                  ·
                </span>
                <span className="suggest-row-preview__ad">Реклама</span>
              </div>
            </div>

            {disclaimerWidth > 0 && disclaimerHeight > 0 && (
              <div
                className={`suggest-row-preview__disclaimer${showDisclaimerHighlight ? ' suggest-row-preview__disclaimer--highlight' : ''}`}
                style={{
                  width: `${disclaimerWidth}px`,
                  height: `${disclaimerHeight}px`,
                  ...(disclaimerMarkup
                    ? undefined
                    : {
                        backgroundImage: `url(${disclaimerImage})`,
                      }),
                }}
                {...(disclaimerMarkup
                  ? {
                      dangerouslySetInnerHTML: { __html: disclaimerMarkup },
                    }
                  : {})}
              />
            )}
          </div>
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
