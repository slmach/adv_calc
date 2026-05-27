import { useState } from 'react';
import {
  CELL_SIZE_PRESETS,
  findCellSizePreset,
} from '../utils/cellSizePresets.js';
import { DISCLAIMER_CATEGORIES } from '../utils/disclaimerCategories.js';
import {
  DISCLAIMER_SCALING_DEFAULT,
  DISCLAIMER_SCALING_OPTIONS,
} from '../utils/disclaimerScaling.js';
import DisclaimerCategoryRow from './DisclaimerCategoryRow.jsx';
import DisclaimerScalingDocs from './DisclaimerScalingDocs.jsx';
import './DisclaimerCalculator.css';

const CELL_WIDTH_MIN = 550;
const CELL_WIDTH_MAX = 2000;

const DEFAULT_CELL = CELL_SIZE_PRESETS[0];

const DEFAULTS = {
  cellWidth: DEFAULT_CELL.width,
  cellHeight: DEFAULT_CELL.height,
  showDisclaimerHighlight: true,
  scalingMode: DISCLAIMER_SCALING_DEFAULT,
};

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export default function DisclaimerCalculator() {
  const [cellWidth, setCellWidth] = useState(DEFAULTS.cellWidth);
  const [cellHeight, setCellHeight] = useState(DEFAULTS.cellHeight);
  const [showDisclaimerHighlight, setShowDisclaimerHighlight] = useState(
    DEFAULTS.showDisclaimerHighlight,
  );
  const [scalingMode, setScalingMode] = useState(DEFAULTS.scalingMode);

  const activePresetId = findCellSizePreset(cellWidth, cellHeight);

  return (
    <div className="disclaimer-calc">
      <header className="disclaimer-calc__header">
        <p className="disclaimer-calc__lead">
          Задайте ширину ячейки и пресет — ниже пять превью по типам дисклеймера
          с расчётом размера под долю площади.
        </p>
      </header>

      <section className="disclaimer-calc__controls" aria-label="Параметры ячейки">
        <div className="disclaimer-calc__controls-row disclaimer-calc__controls-row--width">
          <div className="disclaimer-calc__width-block">
            <label className="field__label" htmlFor="cell-width-slider">
              Ширина ячейки
            </label>
            <output className="disclaimer-calc__width-value" htmlFor="cell-width-slider">
              {cellWidth} px
            </output>
          </div>

          <div className="disclaimer-calc__slider-wrap">
            <input
              id="cell-width-slider"
              type="range"
              min={CELL_WIDTH_MIN}
              max={CELL_WIDTH_MAX}
              step={1}
              value={cellWidth}
              onChange={(e) =>
                setCellWidth(
                  clampNumber(Number(e.target.value), CELL_WIDTH_MIN, CELL_WIDTH_MAX),
                )
              }
              className="disclaimer-calc__slider"
              aria-valuemin={CELL_WIDTH_MIN}
              aria-valuemax={CELL_WIDTH_MAX}
            />
          </div>

          <div
            className="disclaimer-calc__cell-presets area-percent-options"
            role="radiogroup"
            aria-label="Пресеты размера ячейки"
          >
            {CELL_SIZE_PRESETS.map((preset) => (
              <label key={preset.id} className="area-percent-options__item">
                <input
                  type="radio"
                  name="cellSizePreset"
                  value={preset.id}
                  checked={activePresetId === preset.id}
                  onChange={() => {
                    setCellWidth(preset.width);
                    setCellHeight(preset.height);
                  }}
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="disclaimer-calc__controls-row disclaimer-calc__controls-row--options">
          <label className="field field--checkbox disclaimer-calc__highlight-toggle">
            <input
              type="checkbox"
              checked={showDisclaimerHighlight}
              onChange={(e) => setShowDisclaimerHighlight(e.target.checked)}
            />
            <span>Подсветка</span>
          </label>

          <label className="disclaimer-calc__scaling-mode">
            <select
              id="scaling-mode-select"
              className="disclaimer-calc__scaling-select"
              value={scalingMode}
              onChange={(e) => setScalingMode(e.target.value)}
              aria-label="Масштабирование дисклеймера"
            >
              {DISCLAIMER_SCALING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="disclaimer-calc__rows" aria-label="Превью по типам">
        {DISCLAIMER_CATEGORIES.map((category) => (
          <DisclaimerCategoryRow
            key={category.id}
            category={category}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            showDisclaimerHighlight={showDisclaimerHighlight}
            scalingMode={scalingMode}
          />
        ))}
      </section>

      <DisclaimerScalingDocs scalingMode={scalingMode} />
    </div>
  );
}
