import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const read = (file) => readFile(file, 'utf8');

const personCardSource = await read(path.join(root, 'src/components/project/PersonCard.astro'));
const leadCardSource = await read(path.join(root, 'src/components/project/LeadPersonCard.astro'));
const popoverSource = await read(path.join(root, 'src/components/project/PersonPopover.astro'));
const inlineLinkSource = await read(path.join(root, 'src/lib/mentionInlineLinks.ts'));
assert(personCardSource.includes('person.data.identityId'), 'Project PersonCard must resolve the canonical global Person id');
assert(leadCardSource.includes('person.data.identityId'), 'Project lead PersonCard must resolve the canonical global Person id');
assert(popoverSource.includes('person-global-link'), 'Project PersonPopover must expose the global Person route');
assert(inlineLinkSource.includes('?view=mentions&event='), 'Event inline mention links must remain Project-local');
assert(!inlineLinkSource.includes('/people/'), 'Event inline mention links must not jump directly to global People');

for (const projectId of ['komatsu36', 'komachoe-20260309', 'komachoe-20260425']) {
  const html = await read(path.join(root, `dist/projects/${projectId}/index.html`));
  const globalLinkCount = (html.match(/(?:person-index-row__global|mention-global-link)/g) || []).length;
  assert(globalLinkCount > 0, `${projectId}: Project Person or Mention cards missing global links`);
  assert(html.includes('/people/'), `${projectId}: Project page has no global People route link`);
}

const komatsuHtml = await read(path.join(root, 'dist/projects/komatsu36/index.html'));
assert(komatsuHtml.includes('href="/people/ito-tomohiro/"'), 'Komatsu36 must expose canonical Ito global Person link when present');
const marchHtml = await read(path.join(root, 'dist/projects/komachoe-20260309/index.html'));
assert(marchHtml.includes('data-mention-link') && marchHtml.includes('href="?view=mentions&amp;event='),
  'Project event inline mentions must link back to the local Mentions view');

if (errors.length) {
  console.error('Project ↔ Person closure verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Project ↔ Person closure verified (Project-local event links, canonical global Person links, and three Project routes stable).');
