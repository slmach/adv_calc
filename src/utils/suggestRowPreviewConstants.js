/** Текст заголовка в превью suggest_row по типу дисклеймера */
export const SUGGEST_ROW_PREVIEW_TITLES = {
  medicine: 'Лекарства с доставкой в ближайшую аптеку Москвы и области',
  diet: 'Бады! — Оптовые поставки! — Выгодно!',
  finance: 'Микрозаймы без переплат онлайн на Сравни',
  bankruptcy: 'РКО для бизнеса от 0₽ в Сбербанке',
  energy: 'Энергетики оптом от поставщика — покупайте выгодно',
};

/** @deprecated используйте getSuggestRowPreviewTitle(categoryId) */
export const SUGGEST_ROW_PREVIEW_TITLE = SUGGEST_ROW_PREVIEW_TITLES.medicine;

export function getSuggestRowPreviewTitle(categoryId) {
  return SUGGEST_ROW_PREVIEW_TITLES[categoryId] ?? SUGGEST_ROW_PREVIEW_TITLES.medicine;
}

/** Домен в мета-блоке превью по типу */
export const SUGGEST_ROW_PREVIEW_DOMAINS = {
  medicine: 'medicine-site.ru',
  diet: 'diet-site.ru',
  finance: 'finance-site.ru',
  bankruptcy: 'bankruptcy-site.ru',
  energy: 'energy-drinks-site.ru',
};

export function getSuggestRowPreviewDomain(categoryId) {
  return SUGGEST_ROW_PREVIEW_DOMAINS[categoryId] ?? SUGGEST_ROW_PREVIEW_DOMAINS.medicine;
}

/** Юр. информация по кнопке (i) в превью suggest_row */
export const SUGGEST_ROW_ADVERTISER_LEGAL_TEXT =
  'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ФИНАНСОВЫЕ И ПЛАТЕЖНЫЕ ТЕХНОЛОГИИ", ИНН 9705212635, ID #315061219';

/**
 * Горизонтальные отступы строки без зоны дисклеймера:
 * padding 16+14, favicon 20, gaps 12+12+12, кнопка (i) 20.
 */
export const SUGGEST_ROW_HORIZONTAL_CHROME_PX = 106;
