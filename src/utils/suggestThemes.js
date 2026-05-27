/** Темы оформления выпадающего саджеста (Форсаж 2026) */

export const SUGGEST_THEME_DEFAULT = 'light';

export const SUGGEST_THEMES = [
  {
    id: 'light',
    label: 'Светлая',
    query: 'кредит',
  },
  {
    id: 'dark',
    label: 'Тёмная',
    query: 'кредит',
  },
  {
    id: 'grey',
    label: 'Серая',
    query: 'кредит',
  },
];

export function getSuggestTheme(id) {
  return SUGGEST_THEMES.find((theme) => theme.id === id) ?? SUGGEST_THEMES[0];
}
