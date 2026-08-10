import { readFile } from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('scripts/experiments/rc12-y2-windowproxy.html');
const source = await readFile(file, 'utf8');
const required = [
  'DESIGN ONLY — NOT PRODUCTION',
  "window.open('about:blank'",
  'externalWindow.closed',
  'externalWindow.focus',
  'externalWindow.location.replace',
  'target="_blank" rel="noopener noreferrer"',
  '不会扫描或接管用户已有标签页',
];
const forbidden = [
  'project-archive-shell',
  'data-external-youtube-handoff',
  'seekTo(',
  'playVideo(',
];
const missing = required.filter((marker) => !source.includes(marker));
const leaked = forbidden.filter((marker) => source.includes(marker));
if (missing.length || leaked.length) {
  console.error(JSON.stringify({ file, missing, leaked }, null, 2));
  process.exit(1);
}
console.log(`RC12-Y2 isolated experiment contract passed (${file})`);
