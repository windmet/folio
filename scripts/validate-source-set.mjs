import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const sourceRoot = valueAfter('--root') || process.env.KOMATSU36_SOURCE_ROOT;
const manifestPath = valueAfter('--manifest') || 'data/source-sets/komatsu36-20260808-r1.json';

if (!sourceRoot) {
  console.error('Missing source root. Pass --root <path> or set KOMATSU36_SOURCE_ROOT.');
  process.exit(2);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];

for (const [role, expected] of Object.entries(manifest.files)) {
  const absolutePath = path.resolve(sourceRoot, expected.path);
  let bytes;
  try {
    bytes = await readFile(absolutePath);
  } catch (error) {
    failures.push(`${role}: cannot read ${expected.path}: ${error.message}`);
    continue;
  }

  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const text = bytes.toString('utf8');
  const lineCount = text.split(/\r?\n/).length - (text.endsWith('\n') ? 1 : 0);

  if (sha256 !== expected.sha256) {
    failures.push(`${role}: sha256 ${sha256} != ${expected.sha256}`);
  }
  if (lineCount !== expected.lineCount) {
    failures.push(`${role}: lineCount ${lineCount} != ${expected.lineCount}`);
  }
  if (expected.arcCount !== undefined) {
    const arcCount = (text.match(/^# ARC-\d+/gm) || []).length;
    if (arcCount !== expected.arcCount) {
      failures.push(`${role}: arcCount ${arcCount} != ${expected.arcCount}`);
    }
  }
}

if (failures.length) {
  console.error(`Source set ${manifest.sourceSetId} is NOT canonical:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Source set ${manifest.sourceSetId} verified (${Object.keys(manifest.files).length} files).`);
