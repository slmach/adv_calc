import { SUGGEST_ORGANIC_ROWS } from './suggestOrganicRows.js';

/** Позиция рекламной строки в списке саджеста (1-based) */
export const SUGGEST_AD_ROW_POSITION = 3;

/** Запрос в омнибоксе по типу дисклеймера (если задан — иначе из темы) */
export const SUGGEST_PANEL_QUERY_BY_CATEGORY = {
  medicine: 'лекарства',
  finance: 'микрозайм',
  diet: 'бады',
  bankruptcy: 'банкротство',
  energy: 'энергетик',
};

/** Органические саджесты для медицины — короткие, с «лекарства» в начале */
export const SUGGEST_ORGANIC_ROWS_MEDICINE = [
  {
    id: 'med-1',
    title: 'лекарства',
    subtitle: 'найти в Яндексе',
    variant: 'search-subtitle',
  },
  {
    id: 'med-2',
    title: 'лекарства онлайн',
    variant: 'search',
  },
  {
    id: 'med-3',
    title: 'лекарства аптека',
    variant: 'search',
  },
  {
    id: 'med-4',
    title: 'лекарства препараты',
    domain: 'medicine-site.ru',
    variant: 'site',
  },
  {
    id: 'med-5',
    title: 'лекарства клиника',
    variant: 'search',
  },
  {
    id: 'med-6',
    title: 'лекарства справочник',
    variant: 'search',
  },
  {
    id: 'med-7',
    title: 'лекарства рядом',
    variant: 'search',
  },
];

/** Органические саджесты для финансов — короткие, с «микрозайм» в начале */
export const SUGGEST_ORGANIC_ROWS_FINANCE = [
  {
    id: 'fin-1',
    title: 'микрозайм',
    subtitle: 'найти в Яндексе',
    variant: 'search-subtitle',
  },
  {
    id: 'fin-2',
    title: 'микрозайм онлайн',
    variant: 'search',
  },
  {
    id: 'fin-3',
    title: 'микрозайм срочно',
    variant: 'search',
  },
  {
    id: 'fin-4',
    title: 'микрозайм без отказа',
    domain: 'finance-site.ru',
    variant: 'site',
  },
  {
    id: 'fin-5',
    title: 'микрозайм на карту',
    variant: 'search',
  },
  {
    id: 'fin-6',
    title: 'микрозайм под залог',
    variant: 'search',
  },
  {
    id: 'fin-7',
    title: 'микрозайм первый',
    variant: 'search',
  },
];

/** Органические саджесты для диеты — короткие, с «бады» в начале */
export const SUGGEST_ORGANIC_ROWS_DIET = [
  {
    id: 'diet-1',
    title: 'бады',
    subtitle: 'найти в Яндексе',
    variant: 'search-subtitle',
  },
  {
    id: 'diet-2',
    title: 'бады онлайн',
    variant: 'search',
  },
  {
    id: 'diet-3',
    title: 'бады оптом',
    variant: 'search',
  },
  {
    id: 'diet-4',
    title: 'бады витамины',
    domain: 'diet-site.ru',
    variant: 'site',
  },
  {
    id: 'diet-5',
    title: 'бады для похудения',
    variant: 'search',
  },
  {
    id: 'diet-6',
    title: 'бады спорт',
    variant: 'search',
  },
  {
    id: 'diet-7',
    title: 'бады купить',
    variant: 'search',
  },
];

/** Органические саджесты для банкротства — короткие, с «банкротство» в начале */
export const SUGGEST_ORGANIC_ROWS_BANKRUPTCY = [
  {
    id: 'bankr-1',
    title: 'банкротство',
    subtitle: 'найти в Яндексе',
    variant: 'search-subtitle',
  },
  {
    id: 'bankr-2',
    title: 'банкротство физлиц',
    variant: 'search',
  },
  {
    id: 'bankr-3',
    title: 'банкротство юрлиц',
    variant: 'search',
  },
  {
    id: 'bankr-4',
    title: 'банкротство процедура',
    domain: 'bankruptcy-site.ru',
    variant: 'site',
  },
  {
    id: 'bankr-5',
    title: 'банкротство мфц',
    variant: 'search',
  },
  {
    id: 'bankr-6',
    title: 'банкротство долги',
    variant: 'search',
  },
  {
    id: 'bankr-7',
    title: 'банкротство консультация',
    variant: 'search',
  },
];

/** Органические саджесты для энергетиков — короткие, с «энергетик» в начале */
export const SUGGEST_ORGANIC_ROWS_ENERGY = [
  {
    id: 'energy-1',
    title: 'энергетик',
    subtitle: 'найти в Яндексе',
    variant: 'search-subtitle',
  },
  {
    id: 'energy-2',
    title: 'энергетик оптом',
    variant: 'search',
  },
  {
    id: 'energy-3',
    title: 'энергетик купить',
    variant: 'search',
  },
  {
    id: 'energy-4',
    title: 'энергетик без сахара',
    domain: 'energy-drinks-site.ru',
    variant: 'site',
  },
  {
    id: 'energy-5',
    title: 'энергетик опт',
    variant: 'search',
  },
  {
    id: 'energy-6',
    title: 'энергетик доставка',
    variant: 'search',
  },
  {
    id: 'energy-7',
    title: 'энергетик цена',
    variant: 'search',
  },
];

const ORGANIC_ROWS_BY_CATEGORY = {
  medicine: SUGGEST_ORGANIC_ROWS_MEDICINE,
  finance: SUGGEST_ORGANIC_ROWS_FINANCE,
  diet: SUGGEST_ORGANIC_ROWS_DIET,
  bankruptcy: SUGGEST_ORGANIC_ROWS_BANKRUPTCY,
  energy: SUGGEST_ORGANIC_ROWS_ENERGY,
};

export function getSuggestPanelQuery(categoryId, themeQuery) {
  return SUGGEST_PANEL_QUERY_BY_CATEGORY[categoryId] ?? themeQuery;
}

export function getSuggestOrganicRowsForCategory(categoryId) {
  return ORGANIC_ROWS_BY_CATEGORY[categoryId] ?? SUGGEST_ORGANIC_ROWS;
}
