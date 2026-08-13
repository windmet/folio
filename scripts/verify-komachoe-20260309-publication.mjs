import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const projectId = 'komachoe-20260309';
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

assert(project.status === 'draft', 'Project must remain draft until editorial review');
assert(project.defaultView === 'overview', 'defaultView must remain overview');
assert(project.visualTheme === 'broadcast-blue', 'Project must use the broadcast-blue theme');
assert(JSON.stringify(project.views) === JSON.stringify(['overview', 'sections', 'timeline', 'mentions']), 'views must remain Overview / Sections / Timeline / Mentions');
assert(Array.isArray(project.mentions) && project.mentions.length === 15, 'Mentions must contain the reviewed 15-entry index');
assert(project.mentions.filter((mention) => mention.kind === 'person').length === 12, 'Mentions must contain 12 People entries');
assert(project.mentions.filter((mention) => mention.kind === 'work').length === 2, 'Mentions must contain 2 Works entries');
assert(project.mentions.filter((mention) => mention.kind === 'context').length === 1, 'Mentions must contain 1 Context entry');
assert(trackFiles.length === 1 && tracks[0].durationMs === 9206015 && tracks[0].order === 1, 'expected one ordered 9,206,015ms Track');
assert(actFiles.length === 6, `expected 6 Acts, found ${actFiles.length}`);
assert(eventFiles.length === 38, `expected 38 Events, found ${eventFiles.length}`);
assert(!(await exists(path.join(contentRoot, 'threads'))), 'single-source page must not create a threads directory');
assert(!(await exists(path.join(contentRoot, 'people'))), 'single-source page must not create a people directory');
assert(!(await exists(path.join(contentRoot, 'sources'))), 'single-source page must not create a sources directory');

const orderedActs = [...acts].sort((left, right) => left.order - right.order);
assert(orderedActs[0]?.startMs === 0, 'first Act must start at 0');
assert(orderedActs.at(-1)?.endMs === 9206015, 'last Act must end at Track duration');
for (let index = 1; index < orderedActs.length; index += 1) {
  assert(orderedActs[index - 1].endMs === orderedActs[index].startMs, `Act ${index} / ${index + 1} boundary is not contiguous`);
}
const eventDistribution = orderedActs.map((act) => events.filter(
  (event) => event.act === `${projectId}/act-${String(act.order).padStart(2, '0')}`,
).length);
assert(JSON.stringify(eventDistribution) === JSON.stringify([3, 4, 5, 6, 12, 8]), 'Event distribution must remain 3 / 4 / 5 / 6 / 12 / 8');

for (const [index, event] of events.entries()) {
  assert(event.project === projectId, `${eventFiles[index]} targets another Project`);
  assert(event.track === `${projectId}/yt-main`, `${eventFiles[index]} targets another Track`);
  assert(event.narrativeMode === 'timeline-only', `${eventFiles[index]} must be timeline-only`);
  assert(event.publicationStatus !== 'withheld', `${eventFiles[index]} is withheld`);
  assert(event.startMs >= 0 && event.endMs <= 9206015 && event.startMs < event.endMs, `${eventFiles[index]} has an invalid time window`);
}

assert(!homeHtml.includes(`href="/projects/${projectId}/"`), 'draft Project leaked onto the home page');
assert(html.includes('<meta name="robots" content="noindex, nofollow">'), 'draft route is missing noindex/nofollow');
assert(html.includes('data-archive-theme="broadcast-blue"'), 'rendered route is missing the theme marker');
assert(JSON.stringify(attributeValues(html, 'data-view-button')) === JSON.stringify(project.views), 'rendered view buttons do not match Project views');
assert(JSON.stringify(attributeValues(html, 'data-view-panel')) === JSON.stringify(project.views), 'rendered view panels do not match Project views');
assert((html.match(/class="section-card"/g) || []).length === 6, 'Sections must contain 6 cards');
assert((html.match(/data-event-card="/g) || []).length === 38, 'Timeline must contain 38 Event cards');
assert((html.match(/data-timeline-navigator-segment="/g) || []).length === 6, 'Timeline navigator must contain 6 segments');
assert((html.match(/data-mention-card="/g) || []).length === 15, 'Mentions must contain 15 cards');
assert((html.match(/data-mention-summary-toggle="/g) || []).length === 15, 'Mentions must expose 15 adaptive summaries');
assert(searchPayload.items?.length === 38 && searchPayload.items.every((item) => item.kind === 'event'), 'search index must contain exactly 38 Events');

const controllerMatch = html.match(/<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/);
if (!controllerMatch) {
  errors.push('controller JSON is missing');
} else {
  const controller = JSON.parse(controllerMatch[1]);
  assert(Object.keys(controller.tracks).length === 1 && controller.tracks['yt-main'], 'controller must contain only yt-main');
  assert(Object.keys(controller.events).length === 38, 'controller must contain 38 Events');
}

const renderedPayload = `${html}\n${JSON.stringify(searchPayload)}`;
for (const marker of ['.srt', '.jsonl', 'external_asr_raw', 'author_id', 'Qwen', 'Gemini', 'Purfview', 'Subtitle Edit']) {
  assert(!renderedPayload.includes(marker), `reader output leaks private technical marker ${marker}`);
}

if (errors.length) {
  console.error('Komachoe 2026-03-09 publication verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Komachoe 2026-03-09 publication verification passed (${Buffer.byteLength(html)} bytes, 1 Track, 6 Sections, 38 Events, 15 Mentions).`);
