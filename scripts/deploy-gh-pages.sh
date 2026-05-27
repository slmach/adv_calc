#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMPDIR="$(mktemp -d)"

cd "$ROOT"
npm run build

cd "$TMPDIR"
git init -q
git remote add origin "$(git -C "$ROOT" remote get-url origin)"
cp -R "$ROOT/dist/." .
touch .nojekyll
git add -A
git commit -m "Deploy GitHub Pages"
git push -f origin HEAD:gh-pages

echo "Готово: https://slmach.github.io/adv_calc/"
