import { spawnSync } from 'node:child_process';
import path from 'node:path';

const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : null;
const batches = [
  ['p0', 'verify-komatsu36-semantic-p0-browser.mjs'],
  ['p1-person', 'verify-komatsu36-semantic-p1-person-browser.mjs'],
  ['p1-account', 'verify-komatsu36-semantic-p1-account-browser.mjs'],
  ['p1-story', 'verify-komatsu36-semantic-p1-story-browser.mjs'],
  ['p1-thread-language', 'verify-komatsu36-semantic-p1-thread-language-browser.mjs'],
  ['p1-ui-language', 'verify-komatsu36-semantic-p1-ui-language-browser.mjs'],
  ['p1-event-language', 'verify-komatsu36-semantic-p1-event-language-browser.mjs'],
];

for (const [batch, script] of batches) {
  const args = [path.resolve('scripts', script)];
  if (outputRoot) args.push(path.join(outputRoot, batch));
  console.log(`\n[semantic closeout] ${batch}`);
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\nKomatsu36 semantic closeout browser verification passed (7/7 batches).');
