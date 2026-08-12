import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const projectId = 'komachoe-20260425';
const contentRoot = path.resolve('src/content/projects', projectId);
const outputRoot = path.resolve('dist/projects', projectId);
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const listJson = async (folder) => (await readdir(path.join(contentRoot, folder)))
  .filter((name) => name.endsWith('.json'))
  .sort();
const exists = async (target) => stat(target).then(() => true, (error) => {
  if (error?.code === 'ENOENT') return false;
  throw error;
});
const attributeValues = (html, attribute) => [
  ...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')),
].map((match) => match[1]);

const project = await readJson(path.join(contentRoot, 'project.json'));
const trackFiles = await listJson('tracks');
const actFiles = await listJson('acts');
const eventFiles = await listJson('events');
const tracks = await Promise.all(trackFiles.map((name) => readJson(path.join(contentRoot, 'tracks', name))));
const acts = await Promise.all(actFiles.map((name) => readJson(path.join(contentRoot, 'acts', name))));
const events = await Promise.all(eventFiles.map((name) => readJson(path.join(contentRoot, 'events', name))));
const html = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
const searchPayload = await readJson(path.join(outputRoot, 'search.json'));
const homeHtml = await readFile(path.resolve('dist/index.html'), 'utf8');

assert(project.status === 'draft', 'Project must remain draft during vertical slice');
assert(project.defaultView === 'overview', 'defaultView must remain overview');
assert(project.visualTheme === 'broadcast-blue', 'Project must use the broadcast-blue visual theme');
assert(JSON.stringify(project.views) === JSON.stringify(['overview', 'sections', 'timeline']), 'views must be Overview / Sections / Timeline in order');
assert(trackFiles.length === 1 && tracks[0].durationMs === 7926041 && tracks[0].order === 1, 'expected one ordered 7,926,041ms Track');
assert(actFiles.length === 6, `expected 6 Acts, found ${actFiles.length}`);
assert(eventFiles.length === 30, `expected 30 Events, found ${eventFiles.length}`);
assert(!(await exists(path.join(contentRoot, 'threads'))), 'vertical slice must not create a threads directory');
assert(!(await exists(path.join(contentRoot, 'people'))), 'vertical slice must not create a people directory');
assert(!(await exists(path.join(contentRoot, 'sources'))), 'vertical slice must not create a sources directory');

const sectionKeys = ['special-talk', 'mail', 'monthly-benmei', 'futsuota', 'superchat', 'ending'];
const orderedActs = [...acts].sort((left, right) => left.order - right.order);
assert(JSON.stringify(orderedActs.map((act) => act.sectionKey)) === JSON.stringify(sectionKeys), 'Section keys do not match the locked six-part program structure');
assert(orderedActs[0]?.startMs === 0, 'first Act must start at 0');
assert(orderedActs.at(-1)?.endMs === 7926041, 'last Act must end at Track duration');
for (let index = 1; index < orderedActs.length; index += 1) {
  assert(orderedActs[index - 1].endMs === orderedActs[index].startMs, `Act ${index} / ${index + 1} boundary is not contiguous`);
}

for (const [index, event] of events.entries()) {
  assert(event.project === projectId, `${eventFiles[index]} targets another Project`);
  assert(event.track === `${projectId}/yt-main`, `${eventFiles[index]} targets another Track`);
  assert(event.narrativeMode === 'timeline-only', `${eventFiles[index]} must be timeline-only`);
  assert(event.publicationStatus !== 'withheld', `${eventFiles[index]} is not public in the vertical slice`);
  assert(event.people.length === 0 && event.personRelations.length === 0, `${eventFiles[index]} must not manufacture People relations`);
  assert(event.laneAnnotations.length === 0, `${eventFiles[index]} must not manufacture lane annotations`);
}

assert(!homeHtml.includes(`href="/projects/${projectId}/"`), 'draft Project leaked onto the home page');
assert(html.includes('<meta name="robots" content="noindex, nofollow">'), 'draft route is missing noindex/nofollow');
assert(html.includes('data-archive-theme="broadcast-blue"'), 'rendered route is missing the broadcast-blue theme marker');
assert(JSON.stringify(attributeValues(html, 'data-view-button')) === JSON.stringify(project.views), 'rendered view buttons do not match Project views');
assert(JSON.stringify(attributeValues(html, 'data-view-panel')) === JSON.stringify(project.views), 'rendered view panels do not match Project views');
assert((html.match(/class="section-card"/g) || []).length === 6, 'rendered Sections view must contain 6 cards');
assert((html.match(/data-event-card="/g) || []).length === 30, 'rendered Timeline must contain 30 Event cards');
assert((html.match(/data-timeline-navigator-segment="/g) || []).length === 6, 'Timeline navigator must contain 6 segments');
assert(searchPayload.items?.length === 30 && searchPayload.items.every((item) => item.kind === 'event'), 'search index must contain exactly 30 Event items');

for (const [label, marker] of [
  ['Media Source Navigator', 'class="media-sources"'],
  ['Timeline Scope', 'data-timeline-scope'],
  ['Source selector', 'data-source-track='],
  ['Storyline action', 'data-player-rail-thread'],
  ['Storylines view', 'data-view-button="storylines"'],
  ['People view', 'data-view-button="people"'],
  ['Transcript view', 'data-view-button="transcript"'],
  ['Thread overlay', 'data-thread-overlay'],
  ['Person overlay', 'data-person-overlay'],
]) {
  assert(!html.includes(marker), `single-source output renders forbidden ${label}`);
}

assert(html.includes('搜索事件') && html.includes('placeholder="输入姓名、作品或主题"'), 'single-source Search copy is not Project-appropriate');
assert(html.includes(project.playerNote) && !html.includes('使用 YouTube 原生 360°能力'), 'Player note is not Project-specific');

const controllerMatch = html.match(/<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/);
if (!controllerMatch) {
  errors.push('controller JSON is missing');
} else {
  const controller = JSON.parse(controllerMatch[1]);
  assert(Object.keys(controller.tracks).length === 1 && controller.tracks['yt-main'], 'controller must contain only yt-main');
  assert(Object.keys(controller.events).length === 30, 'controller must contain 30 Events');
  assert(!controllerMatch[1].includes('komatsu36/'), 'controller leaks Komatsu36 data');
}

for (const marker of ['E:\\AI_Subtitle_Studio', '.srt', '.jsonl', 'external_asr_raw', 'author_id', '复核切片', 'R01', 'R13']) {
  assert(!html.includes(marker), `published HTML leaks private marker ${marker}`);
  assert(!JSON.stringify(searchPayload).includes(marker), `search JSON leaks private marker ${marker}`);
}

if (errors.length) {
  console.error('Komachoe single-source verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Komachoe single-source verification passed (${Buffer.byteLength(html)} bytes, 1 Track, 6 Sections, 30 Events, draft route excluded from home).`);
