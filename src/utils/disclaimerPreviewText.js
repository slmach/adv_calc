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

export function getDisclaimerPreviewText(categoryId) {
  return (
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY[categoryId] ??
    DISCLAIMER_PREVIEW_TEXT_BY_CATEGORY.medicine
  );
}
