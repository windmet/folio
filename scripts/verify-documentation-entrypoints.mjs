import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (relative) => readFile(path.join(root, relative), 'utf8');

const readme = await read('README.md');
const history = await read('docs/archive/komatsu36-history.md');
const packageJson = JSON.parse(await read('package.json'));

for (const required of [
  '当前 review branch 为 `codex/publication-metadata-v2`',
  '收录三个已发布 Project',
  'Person Model v2',
  '`PUBLIC_LAUNCH_ENABLED` 仍为 `false`',
  '`noindex, nofollow`',
  '`docs/archive/komatsu36-history.md`',
  '`docs/qa/publication-v0.2-launch-gate.md`',
]) assert(readme.includes(required), `README is missing current-state marker: ${required}`);

assert(!readme.includes('RC 0.11 分批收尾 Runbook'), 'README must not retain the expanded Komatsu36 RC history list');
assert(history.includes('RC 0.08–0.11') && history.includes('RC 0.12') && history.includes('Semantic 与 Reader Copy'),
  'Komatsu36 archive index must preserve RC and Semantic groupings');
assert(packageJson.description.startsWith('前情帖：'), 'package description must use the reader-facing publication identity');

const sources = [
  ['README.md', readme],
  ['docs/archive/komatsu36-history.md', history],
];
for (const [sourceName, source] of sources) {
  const references = [...source.matchAll(/`((?:docs|scripts|src)\/[^`\n]+)`/g)].map((match) => match[1]);
  for (const reference of references) {
    try {
      await access(path.join(root, reference));
    } catch {
      errors.push(`${sourceName}: missing referenced path ${reference}`);
    }
  }
}

for (const requiredArchive of [
  'docs/archive/product-guidance/GOMYAKU_前情帖_收口与产品化改造指导_v0.1.md',
  'docs/GOMYAKU_前情帖_三项目验证后产品建设指导_v0.2.md',
]) {
  try {
    await access(path.join(root, requiredArchive));
  } catch {
    errors.push(`documentation governance entry is missing: ${requiredArchive}`);
  }
}

if (errors.length) {
  console.error('Documentation entrypoint verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Documentation entrypoints verified (current README, archived Komatsu36 history, v0.1/v0.2 governance, and referenced paths).');
