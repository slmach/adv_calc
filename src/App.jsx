import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import DisclaimerCalculator from './components/DisclaimerCalculator.jsx';
import SuggestCell from './components/SuggestCell.jsx';
import SuggestCellTablet, {
  TABLET_DEFAULT_DISCLAIMER,
  TABLET_DEFAULT_TITLE,
} from './components/SuggestCellTablet.jsx';
import {
  getAreaPercent,
  solveDisclaimerSize,
} from './utils/disclaimerSizing.js';
import {
  solveTabletDisclaimerSize,
  TABLET_CELL_WIDTH,
} from './utils/tabletDisclaimerSizing.js';
import './App.css';

function measureBox(el) {
  if (!el) return null;
  const { width, height } = el.getBoundingClientRect();
  const w = Math.round(width);
  const h = Math.round(height);
  return { width: w, height: h, area: w * h };
}

const DEFAULTS = {
  width: 360,
  title: '12345678901234567890123456789012345678901234567890',
  domain: 'dietarysuppl-site.ru',
  adLabel: 'Реклама',
  showDisclaimer: true,
  disclaimerText: 'НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВОМ',
  disclaimerProportionW: 276,
  disclaimerProportionH: 16,
  disclaimerMinHeight: 16,
  targetAreaPercent: 10,
};

const AREA_PERCENT_OPTIONS = [5, 7, 10];

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

const VIEWS = {
  calculator: 'calculator',
  preview: 'preview',
};

export default function App() {
  const [view, setView] = useState(VIEWS.calculator);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [showDisclaimer, setShowDisclaimer] = useState(DEFAULTS.showDisclaimer);
  const [disclaimerText, setDisclaimerText] = useState(DEFAULTS.disclaimerText);
  const [disclaimerProportionW, setDisclaimerProportionW] = useState(
    DEFAULTS.disclaimerProportionW,
  );
  const [disclaimerProportionH, setDisclaimerProportionH] = useState(
    DEFAULTS.disclaimerProportionH,
  );
  const [disclaimerMinHeight, setDisclaimerMinHeight] = useState(
    DEFAULTS.disclaimerMinHeight,
  );
  const [targetAreaPercent, setTargetAreaPercent] = useState(
    DEFAULTS.targetAreaPercent,
  );

  const cellRef = useRef(null);
  const mainRowRef = useRef(null);
  const disclaimerRef = useRef(null);
  const [disclaimerSize, setDisclaimerSize] = useState(null);
  const [cellMetrics, setCellMetrics] = useState(null);
  const [disclaimerMetrics, setDisclaimerMetrics] = useState(null);

  const tabletCellRef = useRef(null);
  const tabletDisclaimerRef = useRef(null);
  const [tabletDisclaimerSize, setTabletDisclaimerSize] = useState(null);
  const [tabletCellMetrics, setTabletCellMetrics] = useState(null);
  const [tabletDisclaimerMetrics, setTabletDisclaimerMetrics] = useState(null);

  const recalcDisclaimerSize = () => {
    if (!showDisclaimer || !mainRowRef.current) {
      setDisclaimerSize(null);
      return;
    }

    const rowHeight = Math.round(
      mainRowRef.current.getBoundingClientRect().height,
    );
    const proportionW = Math.max(1, disclaimerProportionW);
    const proportionH = Math.max(1, disclaimerProportionH);

    const next = solveDisclaimerSize({
      cellWidth: width,
      rowHeight,
      proportionW,
      proportionH,
      targetPercent: targetAreaPercent,
      minHeight: Math.max(1, disclaimerMinHeight),
    });

    setDisclaimerSize((prev) =>
      prev?.width === next.width && prev?.height === next.height ? prev : next,
    );
  };

  const recalcTabletDisclaimerSize = () => {
    if (!showDisclaimer) {
      setTabletDisclaimerSize(null);
      return;
    }

    const proportionW = Math.max(1, disclaimerProportionW);
    const proportionH = Math.max(1, disclaimerProportionH);

    const next = solveTabletDisclaimerSize({
      cellWidth: TABLET_CELL_WIDTH,
      proportionW,
      proportionH,
      targetPercent: targetAreaPercent,
      minHeight: Math.max(1, disclaimerMinHeight),
    });

    setTabletDisclaimerSize((prev) =>
      prev?.width === next.width && prev?.height === next.height ? prev : next,
    );
  };

  useLayoutEffect(() => {
    recalcDisclaimerSize();
    recalcTabletDisclaimerSize();
  }, [
    width,
    showDisclaimer,
    disclaimerProportionW,
    disclaimerProportionH,
    disclaimerMinHeight,
    targetAreaPercent,
  ]);

  useEffect(() => {
    const update = () => {
      setCellMetrics(measureBox(cellRef.current));
      setDisclaimerMetrics(
        showDisclaimer ? measureBox(disclaimerRef.current) : null,
      );
      setTabletCellMetrics(measureBox(tabletCellRef.current));
      setTabletDisclaimerMetrics(
        showDisclaimer ? measureBox(tabletDisclaimerRef.current) : null,
      );
      recalcDisclaimerSize();
      recalcTabletDisclaimerSize();
    };

    update();

    const observer = new ResizeObserver(update);
    if (cellRef.current) observer.observe(cellRef.current);
    if (mainRowRef.current) observer.observe(mainRowRef.current);
    if (disclaimerRef.current) observer.observe(disclaimerRef.current);
    if (tabletCellRef.current) observer.observe(tabletCellRef.current);
    if (tabletDisclaimerRef.current) observer.observe(tabletDisclaimerRef.current);

    return () => observer.disconnect();
  }, [
    width,
    showDisclaimer,
    disclaimerText,
    disclaimerProportionW,
    disclaimerProportionH,
    disclaimerMinHeight,
    targetAreaPercent,
  ]);

  const realAreaPercent =
    cellMetrics && disclaimerMetrics
      ? getAreaPercent(disclaimerMetrics.area, cellMetrics.area)
      : null;

  const tabletRealAreaPercent =
    tabletCellMetrics && tabletDisclaimerMetrics
      ? getAreaPercent(tabletDisclaimerMetrics.area, tabletCellMetrics.area)
      : null;

  const tabletDisclaimerDisplay =
    disclaimerText.trim() === DEFAULTS.disclaimerText
      ? TABLET_DEFAULT_DISCLAIMER
      : disclaimerText;

  const reset = () => {
    setWidth(DEFAULTS.width);
    setShowDisclaimer(DEFAULTS.showDisclaimer);
    setDisclaimerText(DEFAULTS.disclaimerText);
    setDisclaimerProportionW(DEFAULTS.disclaimerProportionW);
    setDisclaimerProportionH(DEFAULTS.disclaimerProportionH);
    setDisclaimerMinHeight(DEFAULTS.disclaimerMinHeight);
    setTargetAreaPercent(DEFAULTS.targetAreaPercent);
  };

  const isCalculator = view === VIEWS.calculator;

  return (
    <div className="app-shell">
      <nav className="app__tabs" aria-label="Разделы">
        <button
          type="button"
          className={`app__tab${isCalculator ? ' app__tab--active' : ''}`}
          aria-current={isCalculator ? 'page' : undefined}
          onClick={() => setView(VIEWS.calculator)}
        >
          Калькулятор
        </button>
        <button
          type="button"
          className={`app__tab${!isCalculator ? ' app__tab--active' : ''}`}
          aria-current={!isCalculator ? 'page' : undefined}
          onClick={() => setView(VIEWS.preview)}
        >
          Превью макета
        </button>
      </nav>

      {isCalculator ? (
        <DisclaimerCalculator />
      ) : (
        <div className="app">
      <aside className="app__col app__col--data">
        <h2 className="app__col-title">Данные</h2>

        <label className="field">
          <span className="field__label">
            Ширина ячейки
            <strong className="field__value">{width}px</strong>
          </span>
          <input
            type="range"
            min={360}
            max={500}
            step={1}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <input
            type="number"
            className="field__number"
            min={360}
            max={500}
            value={width}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              setWidth(Math.min(500, Math.max(360, next)));
            }}
          />
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={showDisclaimer}
            onChange={(e) => setShowDisclaimer(e.target.checked)}
          />
          <span>Показать дисклеймер</span>
        </label>

        {showDisclaimer && (
          <>
            <fieldset className="field fieldset">
              <legend className="field__label">Пропорция дисклеймера</legend>
              <div className="field__row">
                <label className="field__inline">
                  <span>Ширина</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={disclaimerProportionW}
                    onChange={(e) =>
                      setDisclaimerProportionW(
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </label>
                <span className="field__ratio-sep">:</span>
                <label className="field__inline">
                  <span>Высота</span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={disclaimerProportionH}
                    onChange={(e) =>
                      setDisclaimerProportionH(
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </label>
              </div>
              <label className="field__inline field__inline--full">
                <span>Мин. высота, px</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={disclaimerMinHeight}
                  onChange={(e) =>
                    setDisclaimerMinHeight(
                      Math.max(1, Number(e.target.value) || 1),
                    )
                  }
                />
              </label>
              <span className="field__hint">
                Соотношение сторон, как в макете — 276:16
              </span>
            </fieldset>

            <fieldset className="field fieldset">
              <legend className="field__label">Площадь дисклеймера от ячейки</legend>
              <div className="area-percent-options" role="radiogroup">
                {AREA_PERCENT_OPTIONS.map((value) => (
                  <label key={value} className="area-percent-options__item">
                    <input
                      type="radio"
                      name="targetAreaPercent"
                      value={value}
                      checked={targetAreaPercent === value}
                      onChange={() => setTargetAreaPercent(value)}
                    />
                    <span>{value}%</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span className="field__label">Текст дисклеймера</span>
              <input
                type="text"
                value={disclaimerText}
                onChange={(e) => setDisclaimerText(e.target.value)}
              />
              <span className="field__hint">
                При тексте «НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВОМ» используется вектор из макета;
                для другого текста — типографика, близкая к макету.
              </span>
            </label>
          </>
        )}

        <button type="button" className="btn-reset" onClick={reset}>
          Сбросить к макету
        </button>
      </aside>

      <main className="app__col app__col--preview">
        <h2 className="app__col-title">Превью</h2>

        <section className="preview-block">
          <h3 className="preview-block__title">Планшет</h3>
          <div className="preview__stage preview__stage--tablet">
            <SuggestCellTablet
              ref={tabletCellRef}
              disclaimerRef={tabletDisclaimerRef}
              disclaimerSize={showDisclaimer ? tabletDisclaimerSize : null}
              width={TABLET_CELL_WIDTH}
              title={TABLET_DEFAULT_TITLE}
              domain="medicine-site.ru"
              adLabel={DEFAULTS.adLabel}
              showDisclaimer={showDisclaimer}
              disclaimerText={tabletDisclaimerDisplay}
            />
          </div>

          <dl className="preview-metrics">
            <div className="preview-metrics__group">
              <dt>Ячейка</dt>
              <dd>
                {tabletCellMetrics ? (
                  <>
                    <span>
                      {tabletCellMetrics.width} × {tabletCellMetrics.height} px
                    </span>
                    <span className="preview-metrics__area">
                      площадь {tabletCellMetrics.area.toLocaleString('ru-RU')}{' '}
                      px²
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>

            <div className="preview-metrics__group">
              <dt>Дисклеймер</dt>
              <dd>
                {showDisclaimer && tabletDisclaimerMetrics ? (
                  <>
                    <span>
                      {tabletDisclaimerMetrics.width} ×{' '}
                      {tabletDisclaimerMetrics.height} px
                    </span>
                    <span className="preview-metrics__area">
                      площадь{' '}
                      {tabletDisclaimerMetrics.area.toLocaleString('ru-RU')} px²
                    </span>
                    <span className="preview-metrics__percent">
                      {formatPercent(tabletRealAreaPercent)} от площади ячейки
                      <span className="preview-metrics__target">
                        {' '}
                        (цель {formatPercent(targetAreaPercent)})
                      </span>
                    </span>
                  </>
                ) : (
                  'не отображается'
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="preview-block">
          <h3 className="preview-block__title">Мобильный</h3>
          <div className="preview__stage">
            <SuggestCell
              ref={cellRef}
              mainRowRef={mainRowRef}
              disclaimerRef={disclaimerRef}
              disclaimerSize={showDisclaimer ? disclaimerSize : null}
              width={width}
              title={DEFAULTS.title}
              domain={DEFAULTS.domain}
              adLabel={DEFAULTS.adLabel}
              showDisclaimer={showDisclaimer}
              disclaimerText={disclaimerText}
            />
          </div>

          <dl className="preview-metrics">
            <div className="preview-metrics__group">
              <dt>Ячейка</dt>
              <dd>
                {cellMetrics ? (
                  <>
                    <span>
                      {cellMetrics.width} × {cellMetrics.height} px
                    </span>
                    <span className="preview-metrics__area">
                      площадь {cellMetrics.area.toLocaleString('ru-RU')} px²
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>

            <div className="preview-metrics__group">
              <dt>Дисклеймер</dt>
              <dd>
                {showDisclaimer && disclaimerMetrics ? (
                  <>
                    <span>
                      {disclaimerMetrics.width} × {disclaimerMetrics.height} px
                    </span>
                    <span className="preview-metrics__area">
                      площадь{' '}
                      {disclaimerMetrics.area.toLocaleString('ru-RU')} px²
                    </span>
                    <span className="preview-metrics__percent">
                      {formatPercent(realAreaPercent)} от площади ячейки
                      <span className="preview-metrics__target">
                        {' '}
                        (цель {formatPercent(targetAreaPercent)})
                      </span>
                    </span>
                  </>
                ) : (
                  'не отображается'
                )}
              </dd>
            </div>
          </dl>
        </section>
      </main>
        </div>
      )}
    </div>
  );
}
