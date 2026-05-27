import './SuggestOrganicRow.css';

function SearchIcon() {
  return (
    <svg
      className="suggest-organic-row__icon-svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13 13L17 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SuggestOrganicRow({ row }) {
  const isSite = row.variant === 'site';

  return (
    <div className="suggest-organic-row" data-name="suggest_rows">
      <div className="suggest-organic-row__inner" data-name="suggest_row">
        <div className="suggest-organic-row__left">
          <div className="suggest-organic-row__icon-wrap" aria-hidden="true">
            {isSite ? (
              <div className="suggest-organic-row__favicon" />
            ) : (
              <SearchIcon />
            )}
          </div>
          <div className="suggest-organic-row__text">
            <span className="suggest-organic-row__title">{row.title}</span>
            {row.subtitle && (
              <>
                <span className="suggest-organic-row__sep">—</span>
                <span className="suggest-organic-row__subtitle">{row.subtitle}</span>
              </>
            )}
            {row.domain && (
              <>
                <span className="suggest-organic-row__sep suggest-organic-row__sep--link">
                  —
                </span>
                <span className="suggest-organic-row__domain">{row.domain}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
