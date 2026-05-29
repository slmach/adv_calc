import { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const dist = join(ROOT, 'dist');
const docs = join(ROOT, 'docs');
const assets = join(ROOT, 'assets');

copyFileSync(join(ROOT, 'index.dev.html'), join(ROOT, 'index.html'));

console.log('→ сборка для GitHub Pages…');
execSync('npm run build:pages', { stdio: 'inherit', cwd: ROOT });

rmSync(docs, { recursive: true, force: true });
cpSync(dist, docs, { recursive: true });
writeFileSync(join(docs, '.nojekyll'), '');

// production для коммита (корень main — GitHub Pages)
copyFileSync(join(dist, 'index.html'), join(ROOT, 'index.pages.html'));

const builtAssets = readdirSync(join(dist, 'assets'));
mkdirSync(assets, { recursive: true });
for (const name of builtAssets) {
  if (/^index-.*\.(js|css)$/.test(name) || /^disclaimer-.*-[A-Za-z0-9_-]+\.svg$/.test(name)) {
    copyFileSync(join(dist, 'assets', name), join(assets, name));
  }
}

// production для коммита (корень main — GitHub Pages), см. index.pages.html
copyFileSync(join(dist, 'index.html'), join(ROOT, 'index.pages.html'));

// локальная разработка — всегда dev index
copyFileSync(join(ROOT, 'index.dev.html'), join(ROOT, 'index.html'));

console.log('✓ docs/ обновлена. Для push: git add docs assets');
console.log('  Если Pages из корня: cp dist/index.html index.html && git add index.html');
