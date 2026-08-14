import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (relative) => readFile(path.join(root, relative), 'utf8');
const indexesRoot = path.join(root, 'src/content/indexes');
const files = (await readdir(indexesRoot)).filter((name) => name.endsWith('.json'));
const indexes = await Promise.all(files.map(async (name) => JSON.parse(await readFile(path.join(indexesRoot, name), 'utf8'))));
const sourceFiles = (await readdir(path.join(root, 'src/content/sources'))).filter((name) => name.endsWith('.json'));
const sourcesById = new Map(await Promise.all(sourceFiles.map(async (name) => [
  name.replace(/\.json$/, ''),
  JSON.parse(await readFile(path.join(root, 'src/content/sources', name), 'utf8')),
])));
const indexDetailSource = await read('src/pages/indexes/[slug].astro');
const chronologyCss = await read('src/styles/chronology.css');

assert(indexDetailSource.includes('data-index-chronology'), 'Index detail must expose the chronology reading mode');
assert(indexDetailSource.includes('data-index-order="desc"') && indexDetailSource.includes('data-index-order="asc"'),
  'Index detail must expose both chronology directions');
assert(chronologyCss.includes('.chronology-item') && chronologyCss.includes('.chronology-node'),
  'shared Chronology Rail primitive is missing');

assert(indexes.length === 3, `expected 3 Index fixtures after Source migration, found ${indexes.length}`);
for (const entry of indexes) {
  assert(entry.schemaVersion === 1, `${entry.slug}: schemaVersion must be 1`);
  assert(['program-series', 'stage-series', 'public-record'].includes(entry.kind), `${entry.slug}: invalid kind`);
  assert(entry.status === 'published', `${entry.slug}: first-batch fixture must be published`);
  assert(Array.isArray(entry.entries) && entry.entries.length > 0, `${entry.slug}: entries must not be empty`);
  for (const item of entry.entries || []) {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(item.date || ''), `${entry.slug}/${item.id}: invalid date`);
    assert(Array.isArray(item.links), `${entry.slug}/${item.id}: links must be explicit`);
  }
  const html = await read(`dist/indexes/${entry.slug}/index.html`);
  assert(html.includes(entry.title), `${entry.slug}: built route is missing title`);
  assert((html.match(/class="index-entry chronology-item"/g) || []).length === entry.entries.length, `${entry.slug}: built entry count mismatch`);
  const builtDates = [...html.matchAll(/data-entry-date="([^"]+)"/g)].map((match) => match[1]);
  const expectedDates = entry.entries
    .map((item) => item.source ? sourcesById.get(item.source)?.publishedAt || item.date : item.date)
    .sort((left, right) => right.localeCompare(left, 'en'));
  assert(JSON.stringify(builtDates) === JSON.stringify(expectedDates), `${entry.slug}: default chronology order must be newest first`);
  assert(html.includes('data-index-order="desc"') && html.includes('data-index-order="asc"'), `${entry.slug}: chronology controls missing`);
  assert(!html.includes('archive-player'), `${entry.slug}: Index must not embed the Project player`);
  assert(!html.includes('data-view-panel="timeline"'), `${entry.slug}: Index must not embed the Project Event reader`);
}

const home = await read('dist/index.html');
for (const entry of indexes) {
  assert(home.includes(`data-index-teaser="${entry.slug}"`), `${entry.slug}: homepage teaser missing`);
}
assert(home.includes('系列与公开索引'), 'homepage must expose the Index module');

const headerSources = await Promise.all([
  'src/layouts/HomeLayout.astro',
  'src/layouts/BaseLayout.astro',
  'src/layouts/PeopleLayout.astro',
  'src/layouts/ProjectLayout.astro',
  'src/layouts/IndexLayout.astro',
].map(read));
for (const [index, source] of headerSources.entries()) {
  const nav = source.match(/<nav[\s\S]*?<\/nav>/)?.[0] || '';
  for (const label of ['档案', '人物', '索引', '关于']) assert(nav.includes(label), `layout ${index + 1}: primary nav missing ${label}`);
  assert(!nav.includes('Timeline'), `layout ${index + 1}: Timeline must not remain primary navigation`);
}

if (errors.length) {
  console.error('Index model verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Index model verified (${indexes.length} fixtures, standalone routes, homepage projection, and four-item primary navigation).`);
