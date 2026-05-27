import { cpSync, copyFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const dist = join(ROOT, 'dist');
const docs = join(ROOT, 'docs');

// index.html в корне — только для dev; сборка читает index.dev.html
copyFileSync(join(ROOT, 'index.dev.html'), join(ROOT, 'index.html'));

console.log('→ сборка для GitHub Pages…');
execSync('npm run build:pages', { stdio: 'inherit', cwd: ROOT });

rmSync(docs, { recursive: true, force: true });
cpSync(dist, docs, { recursive: true });
writeFileSync(join(docs, '.nojekyll'), '');

// вернуть dev index, чтобы localhost не ломался после деплоя
copyFileSync(join(ROOT, 'index.dev.html'), join(ROOT, 'index.html'));

console.log('✓ папка docs/ обновлена. Закоммитьте docs/ и запушьте для сайта.');
