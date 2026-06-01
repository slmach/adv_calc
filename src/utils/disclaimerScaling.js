export const DISCLAIMER_SCALING_PROPORTIONAL = 'proportional';
export const DISCLAIMER_SCALING_FIXED = 'fixed';
export const DISCLAIMER_SCALING_ADAPTIVE = 'adaptive';
export const DISCLAIMER_SCALING_TEXT = 'text';
export const DISCLAIMER_SCALING_TEXT_2 = 'text2';
export const DISCLAIMER_SCALING_TEXT_3 = 'text3';

export const DISCLAIMER_SCALING_DEFAULT = DISCLAIMER_SCALING_PROPORTIONAL;

/** @deprecated используйте DISCLAIMER_SCALING_PROPORTIONAL */
export const DISCLAIMER_SCALING_STANDARD = DISCLAIMER_SCALING_PROPORTIONAL;

/** @deprecated используйте DISCLAIMER_SCALING_FIXED */
export const DISCLAIMER_SCALING_ALTERNATIVE = DISCLAIMER_SCALING_FIXED;

export const DISCLAIMER_FIXED_TARGET_PERCENT = 10;

/** @deprecated используйте DISCLAIMER_FIXED_TARGET_PERCENT */
export const DISCLAIMER_ALTERNATIVE_TARGET_PERCENT = DISCLAIMER_FIXED_TARGET_PERCENT;

export const DISCLAIMER_SCALING_OPTIONS = [
  { value: DISCLAIMER_SCALING_PROPORTIONAL, label: 'Пропорциональное' },
  { value: DISCLAIMER_SCALING_FIXED, label: 'Фиксированное' },
  { value: DISCLAIMER_SCALING_ADAPTIVE, label: 'Адаптивное' },
  { value: DISCLAIMER_SCALING_TEXT, label: 'Текстовое' },
  { value: DISCLAIMER_SCALING_TEXT_2, label: 'Текстовое 2' },
  { value: DISCLAIMER_SCALING_TEXT_3, label: 'Текстовое 3' },
];

export const DISCLAIMER_SCALING_MODE_LABELS = {
  [DISCLAIMER_SCALING_PROPORTIONAL]:
    'Лимит высоты 32 px, учёт переноса заголовка, растягивание SVG',
  [DISCLAIMER_SCALING_FIXED]:
    '10% площади, высота = высота ячейки − 32 px (с учётом переноса), ширина от 112 px',
  [DISCLAIMER_SCALING_ADAPTIVE]:
    'Два макета (_s / _l): _s при переносе заголовка, _l при одной строке; расчёт как пропорциональный',
  [DISCLAIMER_SCALING_TEXT]:
    'Кегль под целевую площадь; 1 строка справа или блок под copy с пересчётом высоты ячейки',
  [DISCLAIMER_SCALING_TEXT_2]:
    'Дисклеймер всегда справа: 1 строка → сайт под заголовок → дисклеймер в 2–4 сбалансированные строки (мин. кегль 6)',
  [DISCLAIMER_SCALING_TEXT_3]:
    'Дисклеймер под заголовком и сайтом; кегль как в «Текстовое» (от 8 px), подбор под площадь, 1+ строк',
};

export function isTextScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_TEXT;
}

export function isText2ScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_TEXT_2;
}

export function isText3ScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_TEXT_3;
}

/** Inline-многострочный текстовый режим (text2) */
export function isInlineMultilineTextScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_TEXT_2;
}

/** Любой текстовый режим (text, text2 или text3) */
export function isAnyTextScalingMode(scalingMode) {
  return (
    scalingMode === DISCLAIMER_SCALING_TEXT ||
    scalingMode === DISCLAIMER_SCALING_TEXT_2 ||
    scalingMode === DISCLAIMER_SCALING_TEXT_3
  );
}

export function isAdaptiveScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_ADAPTIVE;
}

export function isFixedScalingMode(scalingMode) {
  return scalingMode === DISCLAIMER_SCALING_FIXED;
}

export function usesCategoryTargetPercent(scalingMode) {
  return (
    scalingMode === DISCLAIMER_SCALING_PROPORTIONAL ||
    scalingMode === DISCLAIMER_SCALING_ADAPTIVE ||
    scalingMode === DISCLAIMER_SCALING_TEXT ||
    scalingMode === DISCLAIMER_SCALING_TEXT_2 ||
    scalingMode === DISCLAIMER_SCALING_TEXT_3
  );
}
