/**
 * Извлекает размеры из SVG (viewBox или width/height) для соотношения сторон.
 */
export function parseSvgDimensions(svgText) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    return null;
  }

  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map((value) => Number.parseFloat(value));

    if (
      parts.length === 4 &&
      Number.isFinite(parts[2]) &&
      Number.isFinite(parts[3]) &&
      parts[2] > 0 &&
      parts[3] > 0
    ) {
      return {
        width: Math.max(1, Math.round(parts[2])),
        height: Math.max(1, Math.round(parts[3])),
      };
    }
  }

  const width = Number.parseFloat(String(svg.getAttribute('width') ?? '').replace(/px$/, ''));
  const height = Number.parseFloat(String(svg.getAttribute('height') ?? '').replace(/px$/, ''));

  if (width > 0 && height > 0) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }

  return null;
}

/** Единый цвет текста дисклеймера во всех макетах */
export const DISCLAIMER_TEXT_FILL = '#000000';
export const DISCLAIMER_TEXT_FILL_OPACITY = '0.18';

const DISCLAIMER_SHAPE_SELECTOR =
  'path, text, tspan, rect, circle, ellipse, polygon, polyline';

function normalizeDisclaimerSvgColors(svg) {
  svg.querySelectorAll(DISCLAIMER_SHAPE_SELECTOR).forEach((node) => {
    const fill = node.getAttribute('fill');
    if (!fill || fill === 'none') {
      return;
    }

    node.setAttribute('fill', DISCLAIMER_TEXT_FILL);
    node.setAttribute('fill-opacity', DISCLAIMER_TEXT_FILL_OPACITY);
  });
}

/** Подготавливает SVG для зоны дисклеймера */
export function prepareStretchableSvg(svgText, { stretch = true } = {}) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    return svgText;
  }

  normalizeDisclaimerSvgColors(svg);

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute(
    'preserveAspectRatio',
    stretch ? 'none' : 'xMidYMid meet',
  );
  svg.removeAttribute('style');
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = '100%';

  return svg.outerHTML;
}
