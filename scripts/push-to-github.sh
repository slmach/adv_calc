#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "Установите GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Войдите в GitHub (откроется браузер):"
  gh auth login -h github.com -p https -w
fi

REPO_NAME="${1:-forsage-disclaimer-calculator}"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Пуш в существующий origin..."
  git push -u origin main
else
  echo "Создаём репозиторий ${REPO_NAME} и пушим..."
  gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
fi

echo "Готово: $(gh repo view --json url -q .url)"
