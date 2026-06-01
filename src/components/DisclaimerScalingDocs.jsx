import {
  DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX,
  DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX,
  DISCLAIMER_MAX_HEIGHT_PX,
} from '../utils/disclaimerAreaCalc.js';
import { BANKRUPTCY_ADAPTIVE_L_MIN_HEIGHT_PX } from '../utils/disclaimerAdaptiveAssets.js';
import { DISCLAIMER_CATEGORIES } from '../utils/disclaimerCategories.js';
import { getDisclaimerPreviewText, getDisclaimerText3PreviewText } from '../utils/disclaimerPreviewText.js';
import {
  DISCLAIMER_FIXED_TARGET_PERCENT,
  DISCLAIMER_SCALING_ADAPTIVE,
  DISCLAIMER_SCALING_FIXED,
  DISCLAIMER_SCALING_PROPORTIONAL,
  DISCLAIMER_SCALING_TEXT,
  DISCLAIMER_SCALING_TEXT_2,
  DISCLAIMER_SCALING_TEXT_3,
} from '../utils/disclaimerScaling.js';
import { SUGGEST_ROW_HORIZONTAL_CHROME_PX } from '../utils/suggestRowPreviewConstants.js';

function CategoryTargetsList() {
  return (
    <ul className="disclaimer-calc__docs-list">
      {DISCLAIMER_CATEGORIES.map((category) => (
        <li key={category.id}>
          <strong>{category.label}</strong> — {category.targetPercent}% площади ячейки
          {category.minHeight != null && (
            <>
              ; мин. высота {category.minHeight} px
              {category.minHeightKeepRatio ? ' (ширина по пропорциям макета)' : ''}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function DocSection({ title, isActive, children }) {
  return (
    <details
      className={`disclaimer-calc__docs-mode${isActive ? ' disclaimer-calc__docs-mode--active' : ''}`}
    >
      <summary className="disclaimer-calc__docs-mode-summary">{title}</summary>
      <div className="disclaimer-calc__docs-mode-body">{children}</div>
    </details>
  );
}

export default function DisclaimerScalingDocs({ scalingMode }) {
  return (
    <details className="disclaimer-calc__docs" aria-label="Спецификация логики дисклеймера">
      <summary className="disclaimer-calc__docs-title">
        Логика отображения дисклеймера (для разработки)
      </summary>

      <div className="disclaimer-calc__docs-inner">
      <p className="disclaimer-calc__docs-lead">
        Калькулятор считает размер зоны дисклеймера в превью строки suggest_row и
        показывает inline-SVG. Ниже — правила по режимам масштабирования. Активный
        режим в селекторе сверху подсвечен.
      </p>

      <div className="disclaimer-calc__docs-block">
        <h3 className="disclaimer-calc__docs-subtitle">Общее для всех режимов</h3>
        <ul className="disclaimer-calc__docs-list">
          <li>
            <strong>Ячейка</strong> — прямоугольник превью шириной из слайдера (
            {550}–{2000} px) и базовой высотой из пресета (60 или 80 px). Площадь
            ячейки = ширина × высота.
          </li>
          <li>
            <strong>Макет строки</strong> — favicon, заголовок и мета слева, дисклеймер
            справа от текста в одной строке, иконка (i) у правого края. Горизонтальные
            отступы без учёта copy и дисклеймера — {SUGGEST_ROW_HORIZONTAL_CHROME_PX} px.
          </li>
          <li>
            <strong>SVG</strong> — в превью растягивается на всю вычисленную зону (
            <code>width/height: 100%</code>, без сохранения aspect ratio внутри блока).
            Текст и иконка «i» — чёрный 18% opacity.
          </li>
          <li>
            <strong>Высота ячейки при переносе заголовка</strong> — после отрисовки
            измеряется фактическая высота строки (ResizeObserver). Если заголовок
            переносится, высота ячейки для расчёта площади берётся как max(базовая
            высота пресета, измеренная высота). В метриках показывается базовая высота
            отдельно.
          </li>
          <li>
            <strong>Подсветка</strong> — опциональная красная заливка зоны дисклеймера
            (только превью, не в прод).
          </li>
        </ul>
        <p className="disclaimer-calc__docs-note">
          Целевые доли площади по типам (пропорциональный и адаптивный режимы):
        </p>
        <CategoryTargetsList />
      </div>

      <DocSection
        title="1. Пропорциональное"
        isActive={scalingMode === DISCLAIMER_SCALING_PROPORTIONAL}
      >
        <p>
          <strong>Назначение:</strong> дисклеймер занимает заданный % площади ячейки,
          пропорции сторон — из SVG макета типа (<code>assets/disclamers/*.svg</code>
          ).
        </p>
        <h4>Расчёт размера</h4>
        <ol className="disclaimer-calc__docs-list disclaimer-calc__docs-list--ordered">
          <li>
            Целевая площадь = (targetPercent / 100) × ширина ячейки × высота ячейки
            (с учётом переноса заголовка).
          </li>
          <li>
            Подбираются ширина и высота с соотношением proportionW : proportionH из
            SVG, чтобы площадь ≥ целевой.
          </li>
          <li>
            Если высота &gt; {DISCLAIMER_MAX_HEIGHT_PX} px — высота фиксируется на{' '}
            {DISCLAIMER_MAX_HEIGHT_PX} px, ширина увеличивается до достижения целевой
            площади (не шире ячейки).
          </li>
          <li>
            Если для типа задана минимальная высота (сейчас только банкротство — 26
            px): высота не ниже минимума; при{' '}
            <code>minHeightKeepRatio: true</code> ширина = пропорция макета × высота.
          </li>
          <li>Итоговый блок не выходит за границы ячейки по ширине и высоте.</li>
        </ol>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>Дисклеймер у верхнего края, рядом с заголовком (не по центру ячейки).</li>
          <li>Отступ сверху у блока дисклеймера — 4 px.</li>
          <li>Фавикон и (i) — у верхнего края строки.</li>
        </ul>
      </DocSection>

      <DocSection
        title="2. Фиксированное"
        isActive={scalingMode === DISCLAIMER_SCALING_FIXED}
      >
        <p>
          <strong>Назначение:</strong> фиксированная доля площади и «полоса» по высоте
          ячейки; пропорции SVG макета не используются (SVG растягивается в
          прямоугольник).
        </p>
        <h4>Расчёт размера</h4>
        <ol className="disclaimer-calc__docs-list disclaimer-calc__docs-list--ordered">
          <li>
            Целевая площадь = {DISCLAIMER_FIXED_TARGET_PERCENT}% площади ячейки для
            всех типов (не зависит от targetPercent типа).
          </li>
          <li>
            Высота дисклеймера = высота ячейки − {DISCLAIMER_ALTERNATIVE_CELL_OFFSET_PX}{' '}
            px (минимум 1 px). Учитывается перенос заголовка.
          </li>
          <li>
            Ширина = max({DISCLAIMER_ALTERNATIVE_MIN_WIDTH_PX} px, ceil(целевая площадь
            / высота)), но не шире ячейки.
          </li>
          <li>Минимальная высота по типу (банкротство и т.д.) в этом режиме не применяется.</li>
        </ol>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            Дисклеймер вертикально центрирован в высоте ячейки; фавикон и (i) — у
            верхнего края (как в обычной строке).
          </li>
          <li>Используется тот же SVG из <code>assets/disclamers/</code>, растянутый на зону.</li>
        </ul>
      </DocSection>

      <DocSection
        title="3. Адаптивное"
        isActive={scalingMode === DISCLAIMER_SCALING_ADAPTIVE}
      >
        <p>
          <strong>Назначение:</strong> два макета на тип — узкий (_s) и широкий (_l) в{' '}
          <code>assets/disclamers_alt/</code> (файлы <code>{'{prefix}'}_s.svg</code>,{' '}
          <code>{'{prefix}'}_l.svg</code>). Расчёт площади как в пропорциональном
          режиме, но пропорции и картинка зависят от выбранного варианта.
        </p>
        <h4>Выбор варианта _l / _s</h4>
        <ol className="disclaimer-calc__docs-list disclaimer-calc__docs-list--ordered">
          <li>
            Считается размер дисклеймера для макета <strong>_l</strong> (на базовой
            высоте пресета, без петли DOM).
          </li>
          <li>
            Ширина блока заголовка (copy) = ширина ячейки − {SUGGEST_ROW_HORIZONTAL_CHROME_PX}{' '}
            px − ширина дисклеймера _l.
          </li>
          <li>
            Если для copy не остаётся места (ширина ≤ 0) или заголовок не помещается в
            одну строку (шрифт 15px, измерение через canvas) — выбирается{' '}
            <strong>_s</strong>, иначе <strong>_l</strong>.
          </li>
          <li>
            После выбора варианта финальный размер пересчитывается с фактической
            высотой строки (если заголовок перенесён и ячейка выросла).
          </li>
        </ol>
        <h4>Расчёт размера (после выбора _s или _l)</h4>
        <ol className="disclaimer-calc__docs-list disclaimer-calc__docs-list--ordered">
          <li>Целевая площадь — targetPercent типа (см. список выше).</li>
          <li>
            Алгоритм как в пропорциональном: соотношение из выбранного SVG, лимит
            высоты {DISCLAIMER_MAX_HEIGHT_PX} px, при превышении — рост ширины.
          </li>
          <li>
            <strong>Банкротство + _l:</strong> мин. высота {BANKRUPTCY_ADAPTIVE_L_MIN_HEIGHT_PX}{' '}
            px (в пропорциональном режиме для банкротства — 26 px). Ширина по
            пропорциям макета _l.
          </li>
          <li>
            Для остальных типов / _s — минимальная высота по конфигу типа, если задана
            (как в пропорциональном).
          </li>
        </ol>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>Как в пропорциональном: дисклеймер у заголовка, favicon и (i) сверху.</li>
          <li>В метриках строки — активный вариант (_s / _l) и признак переноса заголовка.</li>
        </ul>
        <p className="disclaimer-calc__docs-note">
          Префиксы файлов: med, finance, diet, bankcr, energy.
        </p>
      </DocSection>

      <DocSection
        title="4. Текстовое"
        isActive={scalingMode === DISCLAIMER_SCALING_TEXT}
      >
        <p>
          <strong>Назначение:</strong> целевая площадь — доля типа + 4 п.п. от площади
          ячейки (например, при норме 5% считаем 9%). Кегль подбирается так, чтобы текст
          заполнял блок (8–20 px): площадь текста ≥ эффективной нормы, без
          пустых полей по ширине. Если текст в одну строку справа укладывается и норма выполняется —
          inline (высота ячейки только от copy). Иначе дисклеймер под строкой, высота ячейки
          пересчитывается итеративно. В превью — текст, не SVG.
        </p>
        <h4>Тексты по типам</h4>
        <ul className="disclaimer-calc__docs-list">
          {DISCLAIMER_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.label}</strong> — {getDisclaimerPreviewText(category.id)}
            </li>
          ))}
        </ul>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            Типографика: 8–12 px — Medium (500), 13–15 px — Regular (400), &gt;15 px —
            Light (300);
            uppercase, letter-spacing
            0.06em, line-height ×1.2.
          </li>
          <li>
            <strong>Порядок переносов:</strong> (1) дисклеймер под copy → (2) сайт и «Реклама»
            под заголовок → (3) заголовок до 2 строк.
          </li>
          <li>
            Стартовый вариант: дисклеймер справа, заголовок + сайт в одну строку, заголовок
            в 1 строку.
          </li>
          <li>
            Высота ячейки: copy (padding 10 + строки по 20 px) + при шаге 1 зазор 4 px +
            дисклеймер; площадь пересчитывается от новой высоты.
          </li>
        </ul>
      </DocSection>

      <DocSection
        title="5. Текстовое 2"
        isActive={scalingMode === DISCLAIMER_SCALING_TEXT_2}
      >
        <p>
          <strong>Назначение:</strong> как «Текстовое» (целевая площадь = норма типа + 4
          п.п.), но дисклеймер <strong>всегда справа</strong> от copy — он не уходит вниз.
          Минимальный кегль — <strong>6 px</strong> (вместо 8). В превью — текст, не SVG.
          У медицины дисклеймер — не больше <strong>2 строк</strong>; у финансов и
          банкротства — <strong>не меньше 2 строк</strong>, при этом заголовок + сайт
          + «Реклама» могут оставаться в одну строку, если умещаются рядом с
          двустрочным дисклеймером.
        </p>
        <h4>Порядок раскладки</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            <strong>(1)</strong> всё в одну строку: заголовок + сайт + «Реклама» и
            дисклеймер в 1 строку справа.
          </li>
          <li>
            <strong>(2)</strong> если не помещается — сайт и «Реклама» переносятся под
            заголовок (copy в столбик), <strong>заголовок остаётся в 1 строку</strong>,
            дисклеймер растёт по числу строк: 1 → 2 → … (до 4, у медицины до 2) по площади.
          </li>
          <li>
            <strong>(3)</strong> только если и так не помещается — заголовок переносится
            на 2 строки, но <strong>только когда дисклеймер уже в 2+ строках</strong>
            (при дисклеймере в 1 строку тайтл остаётся в одну); не больше 2 строк тайтла.
          </li>
          <li>
            Диета: предпочтительный перенос «НЕ ЯВЛЯЕТСЯ» / «ЛЕКАРСТВОМ» в 2 строки.
          </li>
          <li>
            Дисклеймер делится на строки с ≈ одинаковым числом символов (перенос целыми
            словами), берётся минимально возможное число строк.
          </li>
        </ul>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            Кегль 6–32 px; вес: 8–12 px — Medium (500), 13–15 px — Regular (400), &gt;15 px —
            Light (300); line-height ×1.2.
          </li>
          <li>
            Высота ячейки = padding 10×2 + высота copy; дисклеймер на высоту строки не
            влияет (может выступать за её границы).
          </li>
          <li>Дисклеймер вертикально центрируется справа относительно блока copy.</li>
        </ul>
      </DocSection>

      <DocSection
        title="6. Текстовое 3"
        isActive={scalingMode === DISCLAIMER_SCALING_TEXT_3}
      >
        <p>
          <strong>Назначение:</strong> как «Текстовое» (целевая площадь = норма типа + 4
          п.п., кегль 8–32 px), но дисклеймер <strong>всегда под заголовком и сайтом</strong> —
          не уходит вправо. Кегль подбирается под целевую площадь; текст переносится на
          столько строк, сколько нужно (минимум 1).
        </p>
        <h4>Порядок раскладки</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            Заголовок + сайт + «Реклама» в одну строку, если влезают; иначе сайт и метка
            переносятся под заголовок.
          </li>
          <li>
            Дисклеймер — на всю ширину copy под блоком заголовка, зазор 4 px.
          </li>
          <li>
            Высота ячейки пересчитывается итеративно: copy + зазор + дисклеймер; площадь
            считается от итоговой высоты.
          </li>
        </ul>
        <h4>Тексты по типам</h4>
        <ul className="disclaimer-calc__docs-list">
          {DISCLAIMER_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.label}</strong> —{' '}
              {getDisclaimerText3PreviewText(category.id)}
            </li>
          ))}
        </ul>
        <h4>Отображение в превью</h4>
        <ul className="disclaimer-calc__docs-list">
          <li>
            Типографика: 8–10 px — Regular (400), &gt;10 px — Light (300); uppercase,
            letter-spacing 0.06em, line-height ×1.2.
          </li>
          <li>Дисклеймер в потоке под copy, над юр. текстом по кнопке (i).</li>
        </ul>
      </DocSection>
      </div>
    </details>
  );
}
