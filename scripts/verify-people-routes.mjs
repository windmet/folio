import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const peopleRoot = path.join(root, 'src/content/people');
const distPeopleRoot = path.join(root, 'dist/people');
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const read = (file) => readFile(file, 'utf8');

const helperSource = await read(path.join(root, 'src/lib/globalPeople.ts'));
const indexSource = await read(path.join(root, 'src/pages/people/index.astro'));
const detailSource = await read(path.join(root, 'src/pages/people/[id].astro'));
assert(helperSource.includes('buildGlobalPeopleProjection'), 'global People projection helper is missing');
assert(indexSource.includes('buildGlobalPeopleProjection'), 'People index must consume the global projection');
assert(detailSource.includes('getStaticPaths'), 'People detail route must have static paths');
assert(detailSource.includes('person-empty-note'), 'People detail route must handle absent contextProfile');

const ids = (await readdir(peopleRoot)).filter((name) => name.endsWith('.json')).map((name) => name.replace(/\.json$/, ''));
const indexHtml = await read(path.join(distPeopleRoot, 'index.html'));
const indexLinks = [...indexHtml.matchAll(/href="\/people\/([^/]+)\/"/g)].map((match) => match[1]);
assert(indexLinks.length === ids.length, `People index must expose ${ids.length} detail links, found ${indexLinks.length}`);
assert(indexLinks.includes('ito-tomohiro'), 'People index fixture link for ito-tomohiro is missing');
assert((indexHtml.match(/class="person-card"/g) || []).length === ids.length, 'People index card count mismatch');

const itoHtml = await read(path.join(distPeopleRoot, 'ito-tomohiro/index.html'));
const itoProjectLinks = [...itoHtml.matchAll(/href="\/projects\/([^/]+)\/"/g)].map((match) => match[1]);
assert(JSON.stringify(itoProjectLinks.slice(0, 3)) === JSON.stringify(['komachoe-20260425', 'komatsu36', 'komachoe-20260309']),
  'Ito contexts must be ordered by Project publication date');
for (const projectId of ['komachoe-20260309', 'komatsu36', 'komachoe-20260425']) {
  assert(itoHtml.includes(`/projects/${projectId}/`), `Ito detail is missing ${projectId} project context`);
}
assert((itoHtml.match(/class="person-context-card"/g) || []).length === 3, 'Ito detail must show three project contexts');
assert(itoHtml.includes('view=timeline&amp;event='), 'People detail must expose event deep links through the project contract');
assert(itoHtml.includes('person-empty-note'), 'Ito detail must state that no independent profile is present');

if (errors.length) {
  console.error('Global People route verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Global People route verification passed (${ids.length} global People, Ito fixture spans 3 Project contexts).`);
