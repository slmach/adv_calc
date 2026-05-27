# Редактор ячейки «mobile suggest_exp»

Инструмент для изменения ширины и данных рекламной ячейки из макета [Форсаж 2026](https://www.figma.com/design/rYHGKtXp9hnFTC8sU2UuRD/) (node `550:28271`).

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно http://localhost:5173).

## Демо на GitHub Pages

**https://slmach.github.io/adv_calc/**

Один раз в репозитории: **Settings → Pages → Build and deployment → Deploy from a branch** → ветка **`gh-pages`**, папка **`/ (root)`**. Подожди 1–2 минуты после включения.

Обновить сайт после изменений:

```bash
npm run build
./scripts/deploy-gh-pages.sh
```

## Возможности

- Слайдер и поле ввода ширины (по умолчанию 360px)
- Редактирование заголовка, домена, метки «Реклама»
- Включение/выключение дисклеймера
- Превью в реальном времени
