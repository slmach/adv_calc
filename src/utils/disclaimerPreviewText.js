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

/** Тексты дисклеймера только для режима «Текстовое 3» (если отличаются) */
export const DISCLAIMER_TEXT3_PREVIEW_TEXT_BY_CATEGORY = {
  diet: 'Биологически активная добавка. Не является лекарственным средством',
};

export function getDisclaimerPreviewText(categoryId) {
  return (
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY[categoryId] ??
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY.medicine
  );
}

export function getDisclaimerText3PreviewText(categoryId) {
  return (
    DISCLAIMER_TEXT3_PREVIEW_TEXT_BY_CATEGORY[categoryId] ??
    getDisclaimerPreviewText(categoryId)
  );
}

/** Предпочтительные строки дисклеймера в text2 (уже в uppercase) */
export function getDisclaimerText2PreferredLines(categoryId) {
  if (categoryId === 'diet') {
    return ['НЕ ЯВЛЯЕТСЯ', 'ЛЕКАРСТВОМ'];
  }
  return null;
}
