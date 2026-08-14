import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('src/content');
const projectsRoot = path.join(root, 'projects');
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const listJson = async (folder) => (await readdir(folder)).filter((name) => name.endsWith('.json')).sort();
const weights = {
  host: 3,
  'on-site': 2,
  'live-call': 2,
  'live-space': 2,
  submitted: 1,
  referenced: 0.5,
  'account-context': 0.25,
};
const projectScore = (context) => Math.max(...context.presence.map(({ kind }) => weights[kind] || 0));

const globalFiles = await listJson(path.join(root, 'people'));
const globalIds = new Set(globalFiles.map((name) => name.replace(/\.json$/, '')));
assert(globalFiles.length === 24, `expected 24 canonical global People, found ${globalFiles.length}`);
for (const legacyId of ['ito', 'seiten', 'ham-kento']) {
  assert(!globalIds.has(legacyId), `legacy global Person id must not exist: ${legacyId}`);
}
for (const canonicalId of ['ito-tomohiro', 'kiyoten', 'hama-kento']) {
  assert(globalIds.has(canonicalId), `canonical global Person is missing: ${canonicalId}`);
}

const expectedContextCounts = new Map([
  ['komatsu36', 18],
  ['komachoe-20260309', 13],
  ['komachoe-20260425', 11],
]);
const contextsByPerson = new Map();
for (const [projectId, expectedCount] of expectedContextCounts) {
  const project = await readJson(path.join(projectsRoot, projectId, 'project.json'));
  assert((project.mentions || []).every(({ kind }) => kind !== 'person'), `${projectId}: person entries remain in project mentions`);
  const peopleDir = path.join(projectsRoot, projectId, 'people');
  const files = await listJson(peopleDir);
  assert(files.length === expectedCount, `${projectId}: expected ${expectedCount} Project Person Context entries, found ${files.length}`);
  const projectIdentityIds = new Set();
  for (const file of files) {
    const contextId = file.replace(/\.json$/, '');
    const context = await readJson(path.join(peopleDir, file));
    assert(context.project === projectId, `${projectId}/${contextId}: project reference mismatch`);
    assert(globalIds.has(context.person), `${projectId}/${contextId}: missing global Person ${context.person}`);
    assert(!projectIdentityIds.has(context.person), `${projectId}: duplicate context for ${context.person}`);
    projectIdentityIds.add(context.person);
    assert(typeof context.summary === 'string' && context.summary.length > 0, `${projectId}/${contextId}: missing summary`);
    assert(Array.isArray(context.presence) && context.presence.length > 0, `${projectId}/${contextId}: missing presence`);
    assert(context.presence.every(({ kind }) => kind in weights), `${projectId}/${contextId}: unknown presence kind`);
    const list = contextsByPerson.get(context.person) || [];
    list.push(context);
    contextsByPerson.set(context.person, list);
  }
}

const komatsuSeiten = await readJson(path.join(projectsRoot, 'komatsu36', 'people', 'seiten.json'));
assert(komatsuSeiten.person === 'kiyoten', 'komatsu36/seiten must preserve its context id and target canonical kiyoten');
const marchHama = await readJson(path.join(projectsRoot, 'komachoe-20260309', 'people', 'hama-kento.json'));
assert(marchHama.person === 'hama-kento', 'March broadcast must use canonical hama-kento');

const itoScore = (contextsByPerson.get('ito-tomohiro') || []).reduce((sum, context) => sum + projectScore(context), 0);
assert(itoScore === 3.5, `Ito cross-project relevance must be 3.5, found ${itoScore}`);
assert(projectScore((contextsByPerson.get('kiyoten') || []).find(({ project }) => project === 'komatsu36')) === 2,
  'project relevance must use max presence weight, not sum multiple presence kinds');

if (errors.length) {
  console.error('Person Model v2 verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Person Model v2 verified (${globalFiles.length} global People, 42 project contexts, canonical ids and relevance mapping stable).`);
