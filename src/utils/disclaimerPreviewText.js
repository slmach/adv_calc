/** Тексты дисклеймера для режима «Текстовое» (вместо SVG в превью) */

export const DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY = {
  medicine: 'Есть противопоказания. Посоветуйтесь с врачом',
  finance:
    'Изучите все условия кредита (займа) на сайте в соответствующем разделе. Оценивайте свои финансовые возможности и риски',
  diet: 'Не является лекарством',
  bankruptcy:
    'Банкротство влечет негативные последствия, в том числе ограничения на получение кредита и повторное банкротство в течение пяти лет. Предварительно обратитесь к своему кредитору и в МФЦ',
  energy: 'Чрезмерное употребление вредит здоровью',
};

/** Диета (БАД): текст для «Текстовое 2» и «Текстовое 3» */
export const DISCLAIMER_DIET_EXTENDED_TEXT =
  'Биологически активная добавка. Не является лекарственным средством';

const DISCLAIMER_EXTENDED_PREVIEW_TEXT_BY_CATEGORY = {
  diet: DISCLAIMER_DIET_EXTENDED_TEXT,
};

export function getDisclaimerPreviewText(categoryId) {
  return (
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY[categoryId] ??
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY.medicine
  );
}

export function getDisclaimerText2PreviewText(categoryId) {
  return (
    DISCLAIMER_EXTENDED_PREVIEW_TEXT_BY_CATEGORY[categoryId] ??
    getDisclaimerPreviewText(categoryId)
  );
}

export function getDisclaimerText3PreviewText(categoryId) {
  return getDisclaimerText2PreviewText(categoryId);
}

/** Предпочтительные строки дисклеймера в text2 (уже в uppercase) */
export function getDisclaimerText2PreferredLines(categoryId) {
  if (categoryId === 'diet') {
    return [
      'БИОЛОГИЧЕСКИ АКТИВНАЯ ДОБАВКА.',
      'НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ',
    ];
  }
  return null;
}
