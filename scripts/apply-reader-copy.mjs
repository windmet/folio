import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

const args = process.argv.slice(2);
const reviewArg = args.find((arg) => !arg.startsWith('-'));
const apply = args.includes('--apply');
const outputLabel = args.find((arg) => arg.startsWith('--output-label='))?.slice('--output-label='.length) || '';

if (!reviewArg) {
  console.error('Usage: npm run editorial:apply-copy -- <review.md> [--output-label=<label>] [--apply]');
  process.exit(1);
}
if (outputLabel && !/^[a-z0-9][a-z0-9-]*$/.test(outputLabel)) {
  throw new Error(`Invalid output label: ${outputLabel}`);
}

const reviewPath = path.resolve(reviewArg);
if (!fs.existsSync(reviewPath)) throw new Error(`Review file not found: ${reviewPath}`);

const reviewRaw = fs.readFileSync(reviewPath, 'utf8');
const projectMatch = reviewRaw.match(/^- Project: `([^`]+)`$/m);
if (!projectMatch) throw new Error('Review file is missing its Project metadata');
const projectId = projectMatch[1];
const manifestFile = outputLabel
  ? `${projectId}-reader-copy-manifest-${outputLabel}.json`
  : `${projectId}-reader-copy-manifest.json`;
const manifestPath = path.resolve('docs/editorial', manifestFile);
if (!fs.existsSync(manifestPath)) throw new Error(`Manifest not found: ${manifestPath}`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const hash = (value) => crypto.createHash('sha256').update(String(value).trim(), 'utf8').digest('hex');
const relative = (filePath) => path.relative(process.cwd(), filePath).replaceAll(path.sep, '/');

function parseReview(raw) {
  const lines = raw.replaceAll('\r\n', '\n').split('\n');
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^### `([^`]+)`$/);
    if (!heading) continue;
    const copyKey = heading[1];
    let end = index + 1;
    while (end < lines.length && !/^##(?:#)? /.test(lines[end])) end += 1;
    const block = lines.slice(index + 1, end);
    const reviewedLine = block.find((line) => /^- \[[ xX]\] reviewed$/.test(line));
    const sourceLine = block.find((line) => line.startsWith('- Source: `'));
    const fieldLine = block.find((line) => line.startsWith('- Field: `'));
    const hashLine = block.find((line) => line.startsWith('- Original hash: `'));
    if (!reviewedLine || !sourceLine || !fieldLine || !hashLine) {
      throw new Error(`Incomplete review metadata for ${copyKey}`);
    }
    const fenceStart = block.findIndex((line) => /^`{3,}text$/.test(line));
    if (fenceStart < 0) throw new Error(`Missing text fence for ${copyKey}`);
    const fence = block[fenceStart].slice(0, -4);
    const fenceEnd = block.findIndex((line, position) => position > fenceStart && line === fence);
    if (fenceEnd < 0) throw new Error(`Unclosed text fence for ${copyKey}`);
    entries.push({
      copyKey,
      reviewed: /^- \[[xX]\] reviewed$/.test(reviewedLine),
      source: sourceLine.match(/^- Source: `([^`]+)`$/)?.[1],
      field: fieldLine.match(/^- Field: `([^`]+)`$/)?.[1],
      originalHash: hashLine.match(/^- Original hash: `([^`]+)`$/)?.[1],
      value: block.slice(fenceStart + 1, fenceEnd).join('\n').trim(),
    });
    index = end - 1;
  }
  return entries;
}

function fieldTokens(field) {
  const tokens = [];
  for (const match of field.matchAll(/([^[.\]]+)|\[(\d+)\]/g)) {
    tokens.push(match[2] === undefined ? match[1] : Number(match[2]));
  }
  return tokens;
}

function getIn(value, field) {
  return fieldTokens(field).reduce((current, token) => current?.[token], value);
}

function countOccurrences(raw, needle) {
  if (!needle) return 0;
  let count = 0;
  let position = 0;
  while ((position = raw.indexOf(needle, position)) >= 0) {
    count += 1;
    position += needle.length;
  }
  return count;
}

function replaceUnique(raw, oldValue, newValue, label) {
  const count = countOccurrences(raw, oldValue);
  if (count !== 1) throw new Error(`${label}: expected one source occurrence, found ${count}`);
  return raw.replace(oldValue, newValue);
}

function parseThread(raw, source) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid thread frontmatter: ${source}`);
  return { frontmatterRaw: match[1], data: YAML.parse(match[1]), body: match[2].trim() };
}

const reviewedEntries = parseReview(reviewRaw);
const manifestByKey = new Map(manifest.entries.map((entry) => [entry.copyKey, entry]));
const reviewByKey = new Map();
const errors = [];

for (const entry of reviewedEntries) {
  if (reviewByKey.has(entry.copyKey)) errors.push(`Duplicate copy-key: ${entry.copyKey}`);
  reviewByKey.set(entry.copyKey, entry);
  const expected = manifestByKey.get(entry.copyKey);
  if (!expected) {
    errors.push(`Unknown copy-key: ${entry.copyKey}`);
    continue;
  }
  for (const field of ['source', 'field', 'originalHash']) {
    if (entry[field] !== expected[field]) {
      errors.push(`${entry.copyKey}: ${field} does not match manifest`);
    }
  }
}

for (const entry of manifest.entries) {
  if (!reviewByKey.has(entry.copyKey)) errors.push(`Missing copy-key: ${entry.copyKey}`);
}

const changed = reviewedEntries.filter((entry) => entry.value !== manifestByKey.get(entry.copyKey)?.value);
const reviewed = reviewedEntries.filter((entry) => entry.reviewed);
const changedReviewed = changed.filter((entry) => entry.reviewed);
const changedUnreviewed = changed.filter((entry) => !entry.reviewed);
const reviewedUnchanged = reviewed.filter((entry) => entry.value === manifestByKey.get(entry.copyKey)?.value);

for (const entry of changedUnreviewed) {
  errors.push(`${entry.copyKey}: value changed but reviewed checkbox is not checked`);
}

const sourceCache = new Map();
const applicationState = new Map();
function sourceState(source) {
  if (sourceCache.has(source)) return sourceCache.get(source);
  const absolutePath = path.resolve(source);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const state = { source, absolutePath, raw, nextRaw: raw };
  sourceCache.set(source, state);
  return state;
}

for (const review of changedReviewed) {
  const expected = manifestByKey.get(review.copyKey);
  const state = sourceState(expected.source);
  let currentValue;
  if (expected.scope === 'system/ui') {
    const originalOccurrences = countOccurrences(state.raw, expected.value);
    const reviewedOccurrences = countOccurrences(state.raw, review.value);
    if (originalOccurrences === 1) currentValue = expected.value;
    else if (reviewedOccurrences === 1) currentValue = review.value;
    else {
      errors.push(`${review.copyKey}: cannot identify a unique current UI source value`);
      continue;
    }
  } else if (expected.source.endsWith('.json')) {
    currentValue = getIn(JSON.parse(state.raw), expected.field);
  } else if (expected.source.endsWith('.md')) {
    const thread = parseThread(state.raw, expected.source);
    currentValue = expected.field === 'body' ? thread.body : getIn(thread.data, expected.field);
  } else {
    errors.push(`${review.copyKey}: unsupported source type`);
    continue;
  }
  if (typeof currentValue !== 'string') {
    errors.push(`${review.copyKey}: current source value is not a string`);
  } else if (hash(currentValue) === expected.originalHash) {
    applicationState.set(review.copyKey, 'pending');
  } else if (hash(currentValue) === hash(review.value)) {
    applicationState.set(review.copyKey, 'applied');
  } else {
    errors.push(`${review.copyKey}: current source hash matches neither manifest nor reviewed value`);
  }
}

if (errors.length) {
  console.error(`Reader Copy apply audit failed (${errors.length} errors):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const changesByScope = Object.entries(Object.groupBy(changedReviewed, (entry) => manifestByKey.get(entry.copyKey).scope))
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([scope, entries]) => `${scope}=${entries.length}`)
  .join(', ');
const affectedFiles = new Set(changedReviewed.map((entry) => manifestByKey.get(entry.copyKey).source));
const pendingChanges = changedReviewed.filter((entry) => applicationState.get(entry.copyKey) === 'pending');
const appliedChanges = changedReviewed.filter((entry) => applicationState.get(entry.copyKey) === 'applied');

console.log(`Reader Copy key audit passed (${reviewedEntries.length}/${manifest.entries.length} keys).`);
console.log(`Reviewed: ${reviewed.length}; changed+reviewed: ${changedReviewed.length}; reviewed+unchanged: ${reviewedUnchanged.length}; unchanged+unreviewed: ${reviewedEntries.length - changed.length - reviewedUnchanged.length}.`);
if (reviewedUnchanged.length) {
  console.log(`Reviewed without text change: ${reviewedUnchanged.map((entry) => entry.copyKey).join(', ')}.`);
}
console.log(`Dry-run scope: ${changesByScope || 'no changes'}; ${affectedFiles.size} source files.`);
console.log(`Source state: pending=${pendingChanges.length}; already-applied=${appliedChanges.length}.`);

if (!apply) {
  console.log('Dry-run only. Re-run with --apply to write the reviewed changes.');
  process.exit(0);
}

for (const review of pendingChanges) {
  const expected = manifestByKey.get(review.copyKey);
  const state = sourceState(expected.source);
  if (expected.scope === 'system/ui') {
    state.nextRaw = replaceUnique(state.nextRaw, expected.value, review.value, review.copyKey);
    continue;
  }
  if (expected.source.endsWith('.json')) {
    const oldLiteral = JSON.stringify(expected.value);
    const newLiteral = JSON.stringify(review.value);
    state.nextRaw = replaceUnique(state.nextRaw, oldLiteral, newLiteral, review.copyKey);
    continue;
  }
  const thread = parseThread(state.nextRaw, expected.source);
  const newline = state.nextRaw.includes('\r\n') ? '\r\n' : '\n';
  if (expected.field === 'body') {
    const headerEnd = state.nextRaw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)?.[0];
    if (!headerEnd) throw new Error(`Invalid thread body boundary: ${expected.source}`);
    state.nextRaw = `${headerEnd}${review.value.trim()}${newline}`;
  } else {
    const replacement = YAML.stringify(review.value, null, { lineWidth: 0 }).trimEnd();
    const nextFrontmatter = replaceUnique(thread.frontmatterRaw, expected.value, replacement, review.copyKey);
    state.nextRaw = state.nextRaw.replace(thread.frontmatterRaw, nextFrontmatter);
  }
}

for (const state of sourceCache.values()) {
  if (state.nextRaw === state.raw) continue;
  fs.writeFileSync(state.absolutePath, state.nextRaw, 'utf8');
  console.log(`Updated ${relative(state.absolutePath)}`);
}

const decisionsPath = path.resolve('docs/editorial', `${projectId}-reader-copy-decisions.yml`);
let updatedDecisions = 0;
if (fs.existsSync(decisionsPath)) {
  const decisionsRaw = fs.readFileSync(decisionsPath, 'utf8');
  const decisionsDocument = YAML.parseDocument(decisionsRaw, { keepSourceTokens: true });
  if (decisionsDocument.errors.length) throw decisionsDocument.errors[0];
  const decisions = decisionsDocument.getIn(['decisions'])?.toJSON() || {};
  const decisionField = {
    title: 'newTitle',
    summary: 'newSummary',
    readerNote: 'readerNote',
    deck: 'newDeck',
    body: 'newBody',
  };
  for (const review of changedReviewed) {
    const expected = manifestByKey.get(review.copyKey);
    if (!['event', 'thread'].includes(expected.scope)) continue;
    const id = expected.entityId.split('/').at(-1);
    const targetField = decisionField[expected.field];
    if (!targetField || !Object.hasOwn(decisions[id] || {}, targetField)) continue;
    if (decisions[id][targetField] === review.value) continue;
    decisionsDocument.setIn(['decisions', id, targetField], review.value);
    updatedDecisions += 1;
  }
  if (updatedDecisions) {
    fs.writeFileSync(decisionsPath, decisionsDocument.toString({ lineWidth: 0 }), 'utf8');
    console.log(`Updated ${relative(decisionsPath)} (${updatedDecisions} approved replacements).`);
  }
}

console.log(`Applied ${pendingChanges.length} reviewed copy changes; ${appliedChanges.length} were already present; synced ${updatedDecisions} decision fields.`);
