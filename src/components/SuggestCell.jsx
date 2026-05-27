import { forwardRef } from 'react';
import iconInfo from '../../assets/icon-info.svg';
import disclaimerVector from '../../assets/disclaimer.svg';
import './SuggestCell.css';

const DEFAULT_DISCLAIMER = 'НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВОМ';

const SuggestCell = forwardRef(function SuggestCell(
  {
    width = 360,
    title = '12345678901234567890123456789012345678901234567890',
    domain = 'dietarysuppl-site.ru',
    adLabel = 'Реклама',
    showDisclaimer = true,
    disclaimerText = DEFAULT_DISCLAIMER,
    disclaimerRef,
    mainRowRef,
    disclaimerSize,
  },
  ref,
) {
  const useVectorDisclaimer =
    showDisclaimer && disclaimerText.trim() === DEFAULT_DISCLAIMER;

  return (
    <article
      ref={ref}
      className="suggest-cell"
      style={{ width: `${width}px` }}
      data-name="mobile suggest_exp"
    >
      <div className="suggest-cell__inner">
        <div ref={mainRowRef} className="suggest-cell__row">
          <div className="suggest-cell__thumb" aria-hidden="true" />

          <div className="suggest-cell__text">
            <p className="suggest-cell__title">{title}</p>

            <div className="suggest-cell__meta">
              <span className="suggest-cell__domain">{domain}</span>
              <span className="suggest-cell__dot" aria-hidden="true">
                ·
              </span>
              <span className="suggest-cell__ad-label">{adLabel}</span>
            </div>
          </div>

          <button
            type="button"
            className="suggest-cell__info"
            aria-label="Подробнее о рекламе"
          >
            <img src={iconInfo} alt="" width={18} height={18} />
          </button>
        </div>

        {showDisclaimer && (
          <div className="suggest-cell__disclaimer-row">
            <div
              ref={disclaimerRef}
              className="suggest-cell__disclaimer-bar"
              style={
                disclaimerSize
                  ? {
                      width: `${disclaimerSize.width}px`,
                      height: `${disclaimerSize.height}px`,
                      aspectRatio: 'auto',
                    }
                  : undefined
              }
            >
              {useVectorDisclaimer ? (
                <img
                  className="suggest-cell__disclaimer-vector"
                  src={disclaimerVector}
                  alt={DEFAULT_DISCLAIMER}
                  draggable={false}
                />
              ) : (
                <span className="suggest-cell__disclaimer-text">
                  {disclaimerText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

export default SuggestCell;
