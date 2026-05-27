import { forwardRef } from 'react';
import iconInfo from '../../assets/icon-info.svg';
import disclaimerTablet from '../../assets/disclaimer-tablet.svg';
import './SuggestCellTablet.css';

export const TABLET_DEFAULT_TITLE = 'Заголовок рекламы, которую рекламируем';
export const TABLET_DEFAULT_DISCLAIMER =
  'ЕСТЬ ПРОТИВОПОКАЗАНИЯ, ПОСОВЕТУЙТЕСЬ С ВРАЧОМ';

const SuggestCellTablet = forwardRef(function SuggestCellTablet(
  {
    width = 946,
    title = TABLET_DEFAULT_TITLE,
    domain = 'medicine-site.ru',
    adLabel = 'Реклама',
    showDisclaimer = true,
    disclaimerText = TABLET_DEFAULT_DISCLAIMER,
    disclaimerRef,
    disclaimerSize,
  },
  ref,
) {
  const useVectorDisclaimer =
    showDisclaimer &&
    disclaimerText.trim() === TABLET_DEFAULT_DISCLAIMER;

  return (
    <article
      ref={ref}
      className="suggest-cell-tablet"
      style={{ width: `${width}px` }}
      data-name="mobile suggest_exp"
    >
      <div className="suggest-cell-tablet__row">
        <div className="suggest-cell-tablet__thumb" aria-hidden="true" />

        <div className="suggest-cell-tablet__text">
          <p className="suggest-cell-tablet__title">{title}</p>
          <div className="suggest-cell-tablet__meta">
            <span className="suggest-cell-tablet__domain">{domain}</span>
            <span className="suggest-cell-tablet__dot" aria-hidden="true">
              ·
            </span>
            <span className="suggest-cell-tablet__ad-label">{adLabel}</span>
          </div>
        </div>

        <div className="suggest-cell-tablet__tail">
          {showDisclaimer && (
            <div
              ref={disclaimerRef}
              className="suggest-cell-tablet__disclaimer"
              style={
                disclaimerSize
                  ? {
                      width: `${disclaimerSize.width}px`,
                      height: `${disclaimerSize.height}px`,
                    }
                  : undefined
              }
            >
              {useVectorDisclaimer ? (
                <img
                  className="suggest-cell-tablet__disclaimer-img"
                  src={disclaimerTablet}
                  alt={TABLET_DEFAULT_DISCLAIMER}
                  draggable={false}
                />
              ) : (
                <span className="suggest-cell-tablet__disclaimer-text">
                  {disclaimerText}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            className="suggest-cell-tablet__info"
            aria-label="Подробнее о рекламе"
          >
            <img src={iconInfo} alt="" width={18} height={18} />
          </button>
        </div>
      </div>
    </article>
  );
});

export default SuggestCellTablet;
