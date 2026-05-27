import {
  getSuggestOrganicRowsForCategory,
  getSuggestPanelQuery,
} from '../utils/suggestPanelPreviewContent.js';
import { getSuggestTheme } from '../utils/suggestThemes.js';
import SuggestOrganicRow from './SuggestOrganicRow.jsx';
import './SuggestPanelPreview.css';

function YandexMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#FC3F1D" />
    </svg>
  );
}

export default function SuggestPanelPreview({
  width,
  themeId,
  categoryId,
  children,
}) {
  const theme = getSuggestTheme(themeId);
  const omniboxQuery = getSuggestPanelQuery(categoryId, theme.query);
  const organicRows = getSuggestOrganicRowsForCategory(categoryId);

  return (
    <div
      className={`suggest-panel suggest-panel--${theme.id}`}
      style={{ width: `${width}px` }}
      data-name="suggest"
    >
      <div className="suggest-panel__omnibox" data-name="omnibox_oct">
        <div className="suggest-panel__omnibox-mark" aria-hidden="true">
          <YandexMark />
        </div>
        <div className="suggest-panel__omnibox-query">
          <span className="suggest-panel__omnibox-text">{omniboxQuery}</span>
          <span className="suggest-panel__omnibox-cursor" aria-hidden="true" />
        </div>
        <button
          type="button"
          className="suggest-panel__omnibox-clear"
          aria-label="Очистить запрос"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4 4 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="suggest-panel__divider-wrap" data-name="Divider">
        <div className="suggest-panel__divider" />
      </div>

      <div className="suggest-panel__ad-slot">{children}</div>

      <div className="suggest-panel__organic-list">
        {organicRows.map((row) => (
          <SuggestOrganicRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
