import { cpSync, copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const dist = join(ROOT, 'dist');
const docs = join(ROOT, 'docs');
const assets = join(ROOT, 'assets');

console.log('→ сборка для GitHub Pages…');
copyFileSync(join(ROOT, 'index.dev.html'), join(ROOT, 'index.html'));
execSync('npm run build:pages', { stdio: 'inherit', cwd: ROOT });

rmSync(docs, { recursive: true, force: true });
cpSync(dist, docs, { recursive: true });
writeFileSync(join(docs, '.nojekyll'), '');

copyFileSync(join(dist, 'index.html'), join(ROOT, 'index.html'));

const builtAssets = readdirSync(join(dist, 'assets'));
mkdirSync(assets, { recursive: true });
for (const name of builtAssets) {
  if (/^index-.*\.(js|css)$/.test(name) || /^disclaimer-.*-[A-Za-z0-9_-]+\.svg$/.test(name)) {
    copyFileSync(join(dist, 'assets', name), join(assets, name));
  }
}

console.log('→ ветка gh-pages…');
const remote = execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim();
const tmp = join(ROOT, '.pages-deploy');
rmSync(tmp, { recursive: true, force: true });
cpSync(dist, tmp, { recursive: true });
writeFileSync(join(tmp, '.nojekyll'), '');
execSync('git init -b gh-pages', { cwd: tmp, stdio: 'pipe' });
execSync('git add -A', { cwd: tmp });
execSync('git commit -m "Deploy site"', { cwd: tmp, stdio: 'pipe' });
execSync(`git push -f "${remote}" HEAD:gh-pages`, { cwd: tmp, stdio: 'inherit' });
rmSync(tmp, { recursive: true, force: true });

console.log('✓ docs/, корень и gh-pages обновлены');
