import { copyFileSync, readFileSync } from 'node:fs';

const DEV_ENTRY = '/src/main.jsx';
const indexPath = 'index.html';

const html = readFileSync(indexPath, 'utf8');
if (!html.includes(DEV_ENTRY)) {
  copyFileSync('index.dev.html', indexPath);
  console.log('[dev] index.html восстановлен из index.dev.html');
}
