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
assert(helperSource.includes('indexAppearancesByPerson'), 'global People projection must aggregate Index appearances');
assert(helperSource.includes('neutralContextSummary'), 'global People projection must keep global summaries independent from latest appearances');
assert(indexSource.includes('buildGlobalPeopleProjection'), 'People index must consume the global projection');
assert(detailSource.includes('getStaticPaths'), 'People detail route must have static paths');
assert(detailSource.includes('person.contextSummary'), 'People detail route must provide a concise fallback context summary');
assert(detailSource.includes('data-person-chronology'), 'People detail route must expose the chronology reading mode');
assert(detailSource.includes('PROJECT_TIMELINE_LIMIT'), 'People detail route must redirect extreme event sets to Project Timeline');
assert(!detailSource.includes('person.aliases'), 'People detail must not render legacy search aliases');
assert(detailSource.includes('person.knownAs'), 'People detail must render only reviewed knownAs values');

const ids = (await readdir(peopleRoot)).filter((name) => name.endsWith('.json')).map((name) => name.replace(/\.json$/, ''));
const indexHtml = await read(path.join(distPeopleRoot, 'index.html'));
const indexLinks = [...indexHtml.matchAll(/href="\/people\/([^/]+)\/"/g)].map((match) => match[1]);
assert(indexLinks.includes('ito-tomohiro'), 'People index fixture link for ito-tomohiro is missing');
assert((indexHtml.match(/data-directory-person=/g) || []).length === ids.length, 'complete People directory count mismatch');
assert((indexHtml.match(/data-featured-person=/g) || []).length === 10, 'Featured People board must use the bounded ten-person template');
assert(indexHtml.includes('data-person-tier="hero"') && indexHtml.includes('data-person-tier="major"')
  && indexHtml.includes('data-person-tier="mid"') && indexHtml.includes('data-person-tier="compact"'),
  'Featured People board tier contract is incomplete');
assert(indexHtml.includes('data-featured-person="komatsu-shohei"'), 'Komatsu must remain the current archive-density hero fixture');
assert(!indexSource.includes('已收录'), 'People cards must not repeat generic archive instructions');

const itoHtml = await read(path.join(distPeopleRoot, 'ito-tomohiro/index.html'));
const itoHeader = itoHtml.match(/<header class="person-header">([\s\S]*?)<\/header>/)?.[1] || '';
const itoProjectLinks = [...itoHtml.matchAll(/href="\/projects\/([^/]+)\/"/g)].map((match) => match[1]);
assert(JSON.stringify(itoProjectLinks.slice(0, 3)) === JSON.stringify(['komachoe-20260425', 'komatsu36', 'komachoe-20260309']),
  'Ito contexts must be ordered by Project publication date');
for (const projectId of ['komachoe-20260309', 'komatsu36', 'komachoe-20260425']) {
  assert(itoHtml.includes(`/projects/${projectId}/`), `Ito detail is missing ${projectId} project context`);
}
assert((itoHtml.match(/class="person-context-card chronology-item"/g) || []).length === 3, 'Ito detail must show three project contexts');
assert(itoHtml.includes('class="person-context-overview"') && itoHtml.includes('项目档案 3'),
  'Ito detail must expose a reader-facing cross-archive summary');
assert(itoHtml.includes('电话连线 / 预投稿 / 被提及'), 'Ito presence summary must use stable semantic priority');
assert(itoHtml.includes('data-person-order="desc"') && itoHtml.includes('data-person-order="asc"'),
  'People detail must expose both chronology directions');
assert(itoHtml.includes('class="person-event-disclosure"'), 'Ito fixture must render its four-event context as collapsed disclosure');
assert(itoHtml.includes('view=timeline&amp;event='), 'People detail must expose event deep links through the project contract');
assert(itoHtml.includes('person-context-profile'), 'Ito detail must render a concise derived context summary');
assert(itoHeader.includes('当前前情帖收录 3 项项目语境 · 1 项公开索引。'), 'Ito global header must use a neutral aggregate summary');

const komatsuHtml = await read(path.join(distPeopleRoot, 'komatsu-shohei/index.html'));
assert(komatsuHtml.includes('class="person-event-overflow"'), 'Komatsu host fixture must use the extreme-event Project Timeline handoff');
assert(komatsuHtml.includes('/projects/komatsu36/?view=timeline'), 'Komatsu host fixture must link to the complete Project Timeline');

const hamanoHtml = await read(path.join(distPeopleRoot, 'hamano-daiki/index.html'));
assert(hamanoHtml.includes('项目档案 0') && hamanoHtml.includes('公开索引 1'),
  'Hamano fixture must distinguish zero Project contexts from one Index appearance');
assert(hamanoHtml.includes('data-person-context-kind="index"'), 'Hamano detail must render an Index chronology item');
assert(hamanoHtml.includes('class="person-event-disclosure"') && !hamanoHtml.includes('class="person-event-list" aria-label="公开索引节点" open'),
  'Hamano Index nodes must remain grouped behind a closed disclosure');
assert(hamanoHtml.includes('href="/indexes/2016-x-family-record/"'), 'Hamano detail must link to the public record');
assert(hamanoHtml.includes('濱野作为这组对话的起话者与主要参与者出现')
  && hamanoHtml.includes('本记录称呼 · 爸爸'),
  'Hamano Index card must render person-specific Appearance semantics');
assert(hamanoHtml.includes('当前前情帖收录 1 条公开记录。'), 'Hamano global header must remain a neutral aggregate');
assert(!hamanoHtml.includes('/people/hama-kento/'), 'Hamano detail must not collapse into Hama Kento');

const terashimaHtml = await read(path.join(distPeopleRoot, 'terashima-junta/index.html'));
assert(terashimaHtml.includes('从鸡肉话题接入对话')
  && terashimaHtml.includes('本记录称呼 · 淳太ママ')
  && terashimaHtml.includes('本记录称呼 · 妈妈'),
  'Terashima Index card must render its own Appearance and scoped names');

assert(komatsuHtml.includes('根本没参加的家庭会议') && komatsuHtml.includes('本记录称呼 · 公主'),
  'Komatsu Index card must render its own Appearance and scoped name');

const hamaHtml = await read(path.join(distPeopleRoot, 'hama-kento/index.html'));
assert(hamaHtml.includes('濱ちゃん') && hamaHtml.includes('ハマ') && !hamaHtml.includes('<span>濱</span>'),
  'People detail must show reviewed names but hide surname-only search tokens');

if (errors.length) {
  console.error('Global People route verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Global People route verification passed (${ids.length} global People, Project contexts and Index appearances coexist).`);
