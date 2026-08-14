import fs from 'node:fs';
import path from 'node:path';

const [diffArg, outputArg] = process.argv.slice(2);
if (!diffArg || !outputArg) {
  console.error('Usage: node scripts/convert-reader-copy-diff.mjs <diff.md> <reviewed.md>');
  process.exit(1);
}

const diffPath = path.resolve(diffArg);
const outputPath = path.resolve(outputArg);
const diffRaw = fs.readFileSync(diffPath, 'utf8').replaceAll('\r\n', '\n');
const basisName = diffRaw.match(/^- Basis: `([^`]+)`$/m)?.[1];
if (!basisName) throw new Error('Diff is missing its Basis metadata');

const basisPath = path.resolve(path.dirname(diffPath), basisName);
const basisRaw = fs.readFileSync(basisPath, 'utf8').replaceAll('\r\n', '\n');
const projectId = basisRaw.match(/^- Project: `([^`]+)`$/m)?.[1];
if (!projectId) throw new Error('Basis review is missing its Project metadata');

const manifestPath = path.resolve(path.dirname(diffPath), `${projectId}-reader-copy-manifest.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestByKey = new Map(manifest.entries.map((entry) => [entry.copyKey, entry]));
const entryPattern = /^### `(?<key>[^`]+)`\n\n(?<meta>[\s\S]*?)\n\*\*Before\*\*\n\n(?<beforeFence>`{3,})text\n(?<before>[\s\S]*?)\n\k<beforeFence>\n\n\*\*Proposed\*\*\n\n(?<proposedFence>`{3,})text\n(?<proposed>[\s\S]*?)\n\k<proposedFence>(?=\n\n(?:### `|## )|\s*$)/gm;
const proposals = [...diffRaw.matchAll(entryPattern)].map((match) => ({
  key: match.groups.key,
  meta: match.groups.meta,
  before: match.groups.before.trim(),
  proposed: match.groups.proposed.trim(),
}));
const copyHeadings = [...diffRaw.matchAll(/^### `((?:project|track|act|event|thread|person|source|ui):[^`]+)`$/gm)].map((match) => match[1]);

if (proposals.length !== copyHeadings.length) {
  throw new Error(`Parsed ${proposals.length}/${copyHeadings.length} copy entries`);
}

const seen = new Set();
for (const proposal of proposals) {
  if (seen.has(proposal.key)) throw new Error(`Duplicate copy-key: ${proposal.key}`);
  seen.add(proposal.key);
  const expected = manifestByKey.get(proposal.key);
  if (!expected) throw new Error(`Unknown copy-key: ${proposal.key}`);
  const source = proposal.meta.match(/^- Source: `([^`]+)`$/m)?.[1];
  const field = proposal.meta.match(/^- Field: `([^`]+)`$/m)?.[1];
  const originalHash = proposal.meta.match(/^- Original hash: `([^`]+)`$/m)?.[1];
  if (source !== expected.source) throw new Error(`${proposal.key}: Source does not match manifest`);
  if (field !== expected.field) throw new Error(`${proposal.key}: Field does not match manifest`);
  if (originalHash !== expected.originalHash) throw new Error(`${proposal.key}: Original hash does not match manifest`);
  if (proposal.before !== expected.value) throw new Error(`${proposal.key}: Before text does not match manifest`);
  if (!proposal.proposed) throw new Error(`${proposal.key}: Proposed text is empty`);
  if (proposal.proposed === proposal.before) throw new Error(`${proposal.key}: Proposed text is unchanged`);
}

let reviewedRaw = basisRaw;
for (const proposal of proposals) {
  const heading = `### \`${proposal.key}\`\n`;
  const blockStart = reviewedRaw.indexOf(heading);
  if (blockStart < 0) throw new Error(`${proposal.key}: entry is missing from Basis review`);
  const nextEntry = reviewedRaw.indexOf('\n### `', blockStart + heading.length);
  const nextSection = reviewedRaw.indexOf('\n## ', blockStart + heading.length);
  const candidates = [nextEntry, nextSection].filter((position) => position >= 0);
  const blockEnd = candidates.length > 0 ? Math.min(...candidates) + 1 : reviewedRaw.length;
  const originalBlock = reviewedRaw.slice(blockStart, blockEnd);
  let nextBlock = originalBlock.replace('- [ ] reviewed', '- [x] reviewed');
  const valuePattern = /(`{3,})text\n[\s\S]*?\n\1/;
  if (!valuePattern.test(nextBlock)) throw new Error(`${proposal.key}: Basis text fence is missing`);
  nextBlock = nextBlock.replace(valuePattern, (full, fence) => `${fence}text\n${proposal.proposed}\n${fence}`);
  reviewedRaw = `${reviewedRaw.slice(0, blockStart)}${nextBlock}${reviewedRaw.slice(blockEnd)}`;
}

const note = `> First-pass semantic review prepared from \`${path.basename(diffPath)}\`; ${proposals.length} changed fields are marked reviewed.\n\n`;
reviewedRaw = reviewedRaw.replace(/^(# .+\n\n)/, `$1${note}`);
fs.writeFileSync(outputPath, reviewedRaw.endsWith('\n') ? reviewedRaw : `${reviewedRaw}\n`, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} (${proposals.length} reviewed changes).`);
