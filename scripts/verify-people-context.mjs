import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const referenceId = (reference) => reference?.id || reference;

const peopleRoot = path.join(root, 'src/content/people');
const indexesRoot = path.join(root, 'src/content/indexes');
const contextsRoot = path.join(root, 'src/content/indexPeople');
const peopleFiles = (await readdir(peopleRoot)).filter((file) => file.endsWith('.json'));
const indexFiles = (await readdir(indexesRoot)).filter((file) => file.endsWith('.json'));
const contextFiles = (await readdir(contextsRoot)).filter((file) => file.endsWith('.json'));
const peopleById = new Map(await Promise.all(peopleFiles.map(async (file) => [
  file.replace(/\.json$/, ''),
  await readJson(path.join(peopleRoot, file)),
])));
const indexesById = new Map(await Promise.all(indexFiles.map(async (file) => [
  file.replace(/\.json$/, ''),
  await readJson(path.join(indexesRoot, file)),
])));
const contexts = await Promise.all(contextFiles.map((file) => readJson(path.join(contextsRoot, file))));
const contextKeys = new Set();

for (const context of contexts) {
  const indexId = referenceId(context.index);
  const personId = referenceId(context.person);
  const key = `${indexId}::${personId}`;
  const index = indexesById.get(indexId);
  const person = peopleById.get(personId);
  assert(index, `${key}: missing Index`);
  assert(person, `${key}: missing Global Person`);
  assert(!contextKeys.has(key), `${key}: duplicate Index Person Appearance`);
  contextKeys.add(key);
  assert(typeof context.summary === 'string' && context.summary.length > 0, `${key}: missing Appearance summary`);
  assert(Array.isArray(context.participation) && context.participation.length > 0, `${key}: missing participation`);
  assert(Array.isArray(context.entries) && context.entries.length > 0, `${key}: missing node references`);
  const entriesById = new Map((index?.entries || []).map((entry) => [entry.id, entry]));
  for (const entryId of context.entries || []) {
    const entry = entriesById.get(entryId);
    assert(entry, `${key}: unknown Index entry ${entryId}`);
    assert((entry?.people || []).some((candidate) => referenceId(candidate) === personId),
      `${key}: Index entry ${entryId} does not include the Person`);
  }
  for (const name of context.contextNames || []) {
    assert(name.kind === 'situational', `${key}/${name.label}: context name must remain situational`);
    assert(Array.isArray(name.evidence) && name.evidence.length > 0, `${key}/${name.label}: missing evidence`);
    assert(name.evidence.every((entryId) => context.entries.includes(entryId)),
      `${key}/${name.label}: evidence must belong to the same Appearance`);
    assert(!(person?.knownAs || []).includes(name.label),
      `${key}/${name.label}: scoped context name was promoted into global knownAs`);
  }
}

for (const [indexId, index] of indexesById) {
  if (index.status !== 'published' || index.kind !== 'public-record') continue;
  const personIds = new Set(index.entries.flatMap((entry) => entry.people || []).map(referenceId));
  for (const personId of personIds) {
    assert(contextKeys.has(`${indexId}::${personId}`), `${indexId}::${personId}: published Index Person lacks Appearance semantics`);
  }
}

const projectionSource = await readFile(path.join(root, 'src/lib/globalPeople.ts'), 'utf8');
const summaryAssignment = projectionSource.match(/contextSummary:\s*([\s\S]*?),\n\s*links:/)?.[1] || '';
assert(summaryAssignment.includes('identity.data.contextProfile?.deck') && summaryAssignment.includes('identity.data.contextSummary'),
  'Global Person summary must prefer reviewed global copy');
for (const forbidden of ['personContexts[0]', 'chronology[0]', 'latestAppearance']) {
  assert(!summaryAssignment.includes(forbidden), `Global Person summary must not read ${forbidden}`);
}
assert(summaryAssignment.includes('neutralContextSummary'), 'Global Person summary must use the neutral aggregate fallback');

const fixture = new Map(contexts.map((context) => [referenceId(context.person), context]));
assert(fixture.get('hamano-daiki')?.summary.includes('起话者') && fixture.get('hamano-daiki')?.contextNames[0]?.label === '爸爸',
  'Hamano fixture semantics are incomplete');
assert(fixture.get('terashima-junta')?.summary.includes('鸡肉话题')
  && JSON.stringify(fixture.get('terashima-junta')?.contextNames.map((name) => name.label)) === JSON.stringify(['淳太ママ', '妈妈']),
  'Terashima fixture semantics are incomplete');
assert(fixture.get('komatsu-shohei')?.summary.includes('根本没参加') && fixture.get('komatsu-shohei')?.contextNames[0]?.label === '公主',
  'Komatsu fixture semantics are incomplete');

if (errors.length) {
  console.error('People Context verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`People Context verified (${contexts.length} Index Person Appearances, scoped names and global-summary boundary stable).`);
