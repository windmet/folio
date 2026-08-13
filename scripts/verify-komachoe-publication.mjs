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
const expectedNarrativeEvents = [
  ['yt-000031-production-retrospective', 31000, 397000],
  ['yt-000643-360-experience-worked', 403000, 500000],
  ['yt-000820-camera-model-gap', 500000, 762000],
  ['yt-001242-backstage-became-visible', 762000, 932000],
  ['yt-001602-360-industry-rules', 962000, 1130000],
  ['yt-001850-spatial-audio-tradeoff', 1130000, 1220000],
  ['yt-002020-guest-participation-gap', 1220000, 1431000],
  ['yt-002351-terashima-backstage-mc', 1431000, 1510000],
  ['yt-002510-no-more-dual-platform', 1510000, 1630000],
  ['yt-002710-wasabi-takoyaki-missed', 1630000, 1683000],
  ['yt-002803-terashima-midnight-ramen', 1683000, 1777000],
  ['yt-002940-karaoke-time-ran-out', 1780000, 1824000],
  ['yt-003057-script-staging-documented', 1857000, 1984000],
  ['yt-003304-izo-performance-change', 1984000, 2250000],
  ['yt-003730-broken-bamboo-sword', 2250000, 2612000],
  ['yt-004333-producer-casting', 2613000, 3034000],
  ['yt-005144-what-is-a-gilet', 3104000, 3269000],
  ['yt-005429-hosoya-bonfire', 3269000, 3699000],
  ['yt-010139-miyazaki-backstage-jokes', 3699000, 3821000],
  ['yt-010348-performance-varies-naturally', 3828000, 4158000],
  ['yt-011004-fifth-crew-decision', 4204000, 4649000],
  ['yt-011737-recent-announcements', 4657000, 4836000],
  ['yt-012036-trpg-event-format', 4836000, 5129000],
  ['yt-012529-boy-meets-xxx', 5129000, 5286000],
  ['yt-012824-family-distance', 5304000, 5670000],
  ['yt-013430-hontou-wa-accent', 5670000, 5941000],
  ['yt-013901-chikuho-dialect', 5941000, 6535000],
  ['yt-015153-seiten-and-ito', 6713000, 6770000],
  ['yt-020257-game-backlog-and-recovery', 7377000, 7572000],
  ['yt-020612-slay-the-spire-2', 7572000, 7840000],
];

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
const komatsuHtml = await readFile(path.resolve('dist/projects/komatsu36/index.html'), 'utf8');

assert(project.status === 'draft', 'Project must remain draft during vertical slice');
assert(project.defaultView === 'overview', 'defaultView must remain overview');
assert(project.visualTheme === 'broadcast-blue', 'Project must use the broadcast-blue visual theme');
assert(JSON.stringify(project.views) === JSON.stringify(['overview', 'sections', 'timeline', 'mentions']), 'views must be Overview / Sections / Timeline / Mentions in order');
assert(Array.isArray(project.mentions) && project.mentions.length === 19, 'Mentions must contain the restructured 19-entry index');
const mentionsById = new Map(project.mentions.map((mention) => [mention.id, mention]));
assert(project.mentions.filter((mention) => mention.kind === 'person').length === 10, 'Mentions must retain all 10 reviewed People entries');
assert(project.mentions.filter((mention) => mention.kind === 'work').length === 8, 'Mentions must retain the 8 Works / Projects / Games entries');
assert(
  JSON.stringify(project.mentions.filter((mention) => mention.kind === 'context').map((mention) => mention.id)) === JSON.stringify(['chikuho-ben']),
  '筑豊弁 must be the only remaining Context entry',
);
assert(
  ['360-live', 'spatial-audio', 'honto-wa-accent', 'trpg-format', 'uchia-ge'].every((id) => !mentionsById.has(id)),
  'removed Event-like concepts must not remain in Mentions',
);
assert(project.mentions.filter((mention) => mention.kind !== 'person').every((mention) => mention.url && mention.urlLabel), 'all Work / Context Mentions must expose one labeled primary source');
assert(project.mentions.filter((mention) => mention.kind === 'person').every((mention) => !mention.url && !mention.urlLabel), 'People Mentions must not expose external profile links');
assert(trackFiles.length === 1 && tracks[0].durationMs === 7926041 && tracks[0].order === 1, 'expected one ordered 7,926,041ms Track');
assert(actFiles.length === 6, `expected 6 Acts, found ${actFiles.length}`);
assert(eventFiles.length === 30, `expected 30 Events, found ${eventFiles.length}`);
const eventsById = new Map(eventFiles.map((name, index) => [name.replace(/\.json$/, ''), events[index]]));
assert(
  JSON.stringify([...eventsById.keys()].sort()) === JSON.stringify(expectedNarrativeEvents.map(([id]) => id).sort()),
  'Event IDs do not match mother v1 P01-P30 narrative selection',
);
for (const [id, startMs, endMs] of expectedNarrativeEvents) {
  const event = eventsById.get(id);
  assert(event?.startMs === startMs && event?.endMs === endMs, `${id} does not match its mother v1 narrative window`);
  assert(event?.timingStatus === 'exact', `${id} must use its exact primary narrative window`);
}
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
const eventDistribution = orderedActs.map((act) => events.filter(
  (event) => event.act === `${projectId}/act-${String(act.order).padStart(2, '0')}`,
).length);
assert(
  JSON.stringify(eventDistribution) === JSON.stringify([12, 4, 8, 3, 1, 2]),
  'Public Event distribution must remain 12 / 4 / 8 / 3 / 1 / 2 across the six Sections',
);

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
assert((html.match(/data-mention-card="/g) || []).length === project.mentions.length, 'rendered Mentions view must contain one card per mention');
assert((html.match(/data-mention-summary="/g) || []).length === project.mentions.length, 'rendered Mentions view must expose one adaptive summary per mention');
assert((html.match(/data-mention-summary-toggle="/g) || []).length === project.mentions.length, 'rendered Mentions view must expose measured overflow controls for every summary');
assert((html.match(/data-mention-group-toggle="/g) || []).length === 2, 'mobile Mentions must expose group-level controls for People and Works');
assert((html.match(/aria-controls="mention-summary-/g) || []).length === project.mentions.length, 'Mention summary disclosures must reference their controlled text');
assert((html.match(/class="inline-mention"/g) || []).length > 0, 'Timeline Event details must render inline Mention links when a related surface form exists');
assert(html.includes('event=yt-005429-hosoya-bonfire#mention-hosoya-yoshimasa'), 'inline Mention links must preserve the current Event query and target card hash');
assert(html.includes('event=yt-004333-producer-casting#mention-ore-shiri'), 'inline Mention aliases must resolve reviewed shorthand such as 《俺知》');
const mentionSummaryBlocks = [...html.matchAll(/<p[^>]*data-mention-summary="[^"]+"[^>]*>([\s\S]*?)<\/p>/g)].map((match) => match[1]);
assert(mentionSummaryBlocks.length === project.mentions.length && mentionSummaryBlocks.every((block) => !block.includes('data-mention-link')), 'inline Mention links must stay out of Mentions card summaries');
assert(!(komatsuHtml.match(/data-mention-link/g) || []).length, 'Komatsu36 must not opt into inline Mention links without the Mentions capability');
assert((html.match(/aria-controls="mentions-list-/g) || []).length === 2, 'Mention group disclosures must reference their controlled lists');
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
assert(html.includes('data-view-button="mentions"') && html.includes('data-view-panel="mentions"'), 'Mentions view is not rendered');
assert(html.includes('MENTION INDEX') && html.includes('提及索引'), 'Mentions presentation copy is missing');
assert(html.includes('class="mentions-jump"') && html.includes('class="mention-times-more"'), 'Mentions card-grid navigation or time folding is missing');
assert(html.includes('查看更多 ↓') && html.includes('查看全部人物（10） ↓') && html.includes('查看全部作品（8） ↓'), 'Mentions complete micro-context disclosure copy is missing');
assert((html.match(/class="mention-source"/g) || []).length === 9, 'Mentions must render exactly 9 labeled primary-source links');
assert((html.match(/class="mention-source"[^>]*>\s*查看/g) || []).length === 9, 'Mentions primary sources must render as secondary 查看 links');
assert(!html.includes('data-inline-expandable="act-title-'), 'Act body titles must not use inline expansion controls');
for (const label of ['查看声優グランプリ', '查看官方网站', '查看KiR 作品页', '查看福岡県｜筑豊地域']) {
  assert(html.includes(label), `Mentions source label is missing: ${label}`);
}
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
