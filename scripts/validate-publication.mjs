import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const projectId = 'komatsu36';
const projectRoot = path.resolve('src/content/projects', projectId);
const outputFile = path.resolve('dist/projects', projectId, 'index.html');
const searchOutputFile = path.resolve('dist/projects', projectId, 'search.json');
const homeOutputFile = path.resolve('dist/index.html');
const errors = [];

const listFiles = async (folder, extension) => (await readdir(path.join(projectRoot, folder)))
  .filter((name) => name.endsWith(extension));
const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const trackFiles = await listFiles('tracks', '.json');
const eventFiles = await listFiles('events', '.json');
const eventEntries = await Promise.all(eventFiles.map(async (name) => ({
  id: name.replace(/\.json$/, ''),
  data: await readJson(path.join(projectRoot, 'events', name)),
})));
const publicEventEntries = eventEntries.filter(({ data }) => data.publicationStatus !== 'withheld');
const publicEvents = publicEventEntries.map(({ data }) => data);
const threadFiles = await listFiles('threads', '.md');
const threadEntries = await Promise.all(threadFiles.map(async (name) => {
  const source = await readFile(path.join(projectRoot, 'threads', name), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const body = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)?.[1]?.trim() || '';
  return { id: name.replace(/\.md$/, ''), data: YAML.parse(frontmatter), body };
}));
const peopleFiles = await listFiles('people', '.json');
const peopleEntries = await Promise.all(peopleFiles.map(async (name) => ({
  id: name.replace(/\.json$/, ''),
  data: await readJson(path.join(projectRoot, 'people', name)),
})));
const threadCount = threadEntries.length;
const peopleCount = peopleEntries.length;
const expectedSearchItems = publicEvents.length + threadCount + peopleCount;
const expectedTrackIds = new Set(trackFiles.map((name) => name.replace(/\.json$/, '')));

let html;
let homeHtml;
try {
  html = await readFile(outputFile, 'utf8');
  homeHtml = await readFile(homeOutputFile, 'utf8');
} catch (error) {
  console.error(`Publication validation failed: build output is missing (${outputFile}).`);
  console.error(error.message);
  process.exit(1);
}

const project = await readJson(path.join(projectRoot, 'project.json'));
const semanticPatch = await readFile(path.resolve('docs/komatsu36_semantic_patch_20260810.md'), 'utf8');
const semanticEventById = new Map(eventEntries.map((entry) => [entry.id, entry.data]));
const semanticThreadById = new Map(threadEntries.map((entry) => [entry.id, entry]));
const semanticPersonById = new Map(peopleEntries.map((entry) => [entry.id, entry.data]));
const amazonEvent = semanticEventById.get('yt-040405-amazon-hama');
const amazonGrabEvent = semanticEventById.get('yt-040524-hama-grabs-amazon-card');
const amazonPeople = new Set(amazonEvent?.people || []);
if (!project.editorialRevision.startsWith('2026-08-10-semantic-')) {
  errors.push(`semantic passes require a 2026-08-10-semantic-* editorialRevision; found ${project.editorialRevision}`);
}
if (!semanticPatch.includes('OVERRIDE：Amazonギフトカード 5000円分 × 2')
  || !semanticPatch.includes('本文件第 1～2 节对 Amazon / 濱线的结论覆盖上述旧条目')) {
  errors.push('semantic override authority is missing the Amazon/濱 precedence contract');
}
if (!amazonEvent
  || amazonEvent.title !== 'Amazon 5000 円×2：寺島与堀金同时 Bingo'
  || amazonEvent.publicationStatus !== 'qualified'
  || !amazonEvent.readerNote
  || amazonPeople.size !== 2
  || !amazonPeople.has('komatsu36/terashima-junta')
  || !amazonPeople.has('komatsu36/horikane-sohei')
  || amazonPeople.has('komatsu36/hama-kento')) {
  errors.push('semantic P0 Amazon Event must identify 寺島+堀金, exclude 濱 as winner, and preserve the reader-facing uncertainty note');
}
if (!amazonGrabEvent
  || amazonGrabEvent.startMs !== 14724000
  || amazonGrabEvent.endMs !== 14739000
  || !amazonGrabEvent.people.includes('komatsu36/hama-kento')
  || !amazonGrabEvent.people.includes('komatsu36/terashima-junta')) {
  errors.push('semantic P0 must publish the separate 04:05:24 濱-grabs-寺島-card Event');
}
const bingoThread = semanticThreadById.get('bingo-payback');
const hamaThread = semanticThreadById.get('hama-paid-drinking');
const bingoNodeIds = new Set((bingoThread?.data.nodes || []).map((node) => String(node.event)));
const hamaNodeIds = new Set((hamaThread?.data.nodes || []).map((node) => String(node.event)));
if (!bingoNodeIds.has('komatsu36/yt-040405-amazon-hama')
  || !bingoNodeIds.has('komatsu36/yt-040524-hama-grabs-amazon-card')) {
  errors.push('semantic P0 Bingo thread must retain the winner Event and add the separate card-grab Event');
}
if (!hamaNodeIds.has('komatsu36/yt-040524-hama-grabs-amazon-card')
  || hamaNodeIds.has('komatsu36/yt-040405-amazon-hama')
  || !hamaThread?.body.includes('始终没有中到主奖')) {
  errors.push('semantic P0 濱 thread must use the card-grab Event and must not present 濱 as an Amazon winner');
}
if (semanticPersonById.get('shioya-fumiyasu')?.reading !== 'しおや ふみよし') {
  errors.push('semantic P0 requires 汐谷文康 reading しおや ふみよし');
}
const expectedCallNames = new Map([
  ['komatsu-shohei', ['コマッチ']],
  ['hama-kento', ['濱ちゃん', 'ハマ']],
  ['kano-sho', []],
  ['terashima-junta', ['惇太']],
  ['shioya-fumiyasu', ['ふーみん']],
  ['inoue-yuki', []],
  ['yano-shogo', []],
  ['horikane-sohei', ['蒼平']],
  ['mitsutomi-takao', []],
  ['kumagai-toshiki', ['トシピ']],
  ['sato-yugo', ['祐吾']],
  ['ito-tomohiro', []],
  ['kanze-tomoaki', []],
  ['muro-genki', []],
  ['nakamura-shugo', ['宗悟']],
  ['seiten', []],
  ['yamamoto-masahiro', []],
  ['uchida-shuichi', ['修']],
]);
for (const [personId, expected] of expectedCallNames) {
  const person = semanticPersonById.get(personId);
  if (!person
    || JSON.stringify(person.callNames || []) !== JSON.stringify(expected)
    || !Array.isArray(person.searchAliases)
    || person.searchAliases.length !== 0
    || 'aliases' in person) {
    errors.push(`semantic P1 callNames mismatch for ${personId}`);
  }
}
if (expectedCallNames.size !== peopleEntries.length) {
  errors.push(`semantic P1 callNames ledger covers ${expectedCallNames.size} people; expected ${peopleEntries.length}`);
}
const expectedAccountContextEvents = new Set([
  'sp1-004324-space-restart',
  'sp2-000131-muro-account',
  'sp2-000311-account-hijack',
]);
for (const eventId of expectedAccountContextEvents) {
  const event = semanticEventById.get(eventId);
  const relations = event?.personRelations || [];
  if (relations.length !== 1
    || String(relations[0].person) !== 'komatsu36/muro-genki'
    || relations[0].kind !== 'account-context') {
    errors.push(`semantic P1 account-context relation mismatch for ${eventId}`);
  }
}
const accountHijackEvent = semanticEventById.get('sp2-000311-account-hijack');
if (accountHijackEvent?.readerNote !== '这段只能确认使用的是室元気的账号，实际说话者未确认。') {
  errors.push('semantic P1 account speaker uncertainty requires the natural reader note');
}
if ((semanticEventById.get('sp2-000509-hokkaido')?.personRelations || []).length !== 0) {
  errors.push('semantic P1 Hokkaido payoff must keep 室元気 as a person, not an account-context relation');
}
if (project.status === 'published') {
  const expectedProjectHref = `/projects/${project.slug}/`;
  if (!homeHtml.includes(`href="${expectedProjectHref}"`)) {
    errors.push(`homepage is missing published project link: ${expectedProjectHref}`);
  }
  if (!homeHtml.includes(project.title)) {
    errors.push(`homepage is missing published project title: ${project.title}`);
  }
}

const outputBytes = (await stat(outputFile)).size;
const maxOutputBytes = 350 * 1024;
if (outputBytes > maxOutputBytes) {
  errors.push(`project HTML is ${outputBytes} bytes; budget is ${maxOutputBytes} bytes`);
}

const actualSearchItems = (html.match(/\bdata-search-item(?:[=>\s])/g) || []).length;
if (actualSearchItems !== 0) {
  errors.push(`initial HTML contains ${actualSearchItems} search items; expected 0 for lazy generation`);
}

let searchPayload;
try {
  searchPayload = JSON.parse(await readFile(searchOutputFile, 'utf8'));
} catch (error) {
  errors.push(`search JSON is missing or invalid: ${searchOutputFile} (${error.message})`);
}
const searchJsonText = searchPayload ? JSON.stringify(searchPayload) : '';

const expectedSearchOrder = [
  ...publicEventEntries
    .slice()
    .sort((left, right) => String(left.data.track).localeCompare(String(right.data.track), 'en')
      || left.data.startMs - right.data.startMs
      || left.id.localeCompare(right.id, 'en'))
    .map(({ id }) => ({ kind: 'event', id })),
  ...threadEntries
    .slice()
    .sort((left, right) => Number(right.data.featured) - Number(left.data.featured)
      || left.data.title.localeCompare(right.data.title, 'zh-CN'))
    .map(({ id }) => ({ kind: 'thread', id })),
  ...peopleEntries
    .slice()
    .sort((left, right) => left.data.displayName.localeCompare(right.data.displayName, 'zh-CN'))
    .map(({ id }) => ({ kind: 'person', id })),
];

if (!searchPayload || searchPayload.schemaVersion !== 1 || searchPayload.project !== projectId || !Array.isArray(searchPayload.items)) {
  errors.push('search JSON must expose schemaVersion 1, project komatsu36, and an items array');
} else {
  const searchItems = searchPayload.items;
  if (searchItems.length !== expectedSearchItems) {
    errors.push(`search JSON contains ${searchItems.length} items; expected ${expectedSearchItems} public Event/Thread/Person items`);
  }
  const actualSearchOrder = searchItems.map((item) => ({ kind: item.kind, id: item.id }));
  if (JSON.stringify(actualSearchOrder) !== JSON.stringify(expectedSearchOrder)) {
    errors.push('search JSON order or public Event/Thread/Person membership is not stable');
  }
  for (const [index, item] of searchItems.entries()) {
    const itemKind = item?.kind;
    const allowedKeys = itemKind === 'event'
      ? new Set(['kind', 'id', 'label', 'title', 'searchText', 'trackId', 'startMs', 'preferredThreadId'])
      : new Set(['kind', 'id', 'label', 'title', 'searchText']);
    if (!item || !['event', 'thread', 'person'].includes(itemKind) || Object.keys(item).some((key) => !allowedKeys.has(key))) {
      errors.push(`search JSON item ${index} has an unexpected public field`);
    }
    if (!item || typeof item.id !== 'string' || typeof item.label !== 'string' || typeof item.title !== 'string'
      || typeof item.searchText !== 'string' || item.searchText !== item.searchText.toLocaleLowerCase('ja-JP')) {
      errors.push(`search JSON item ${index} has invalid searchable fields`);
    }
    if (item?.kind === 'event' && (typeof item.trackId !== 'string' || typeof item.startMs !== 'number')) {
      errors.push(`search JSON Event item ${index} is missing trackId/startMs`);
    }
  }
  const amazonSearchItem = searchItems.find((item) => item.kind === 'event' && item.id === 'yt-040405-amazon-hama');
  const grabSearchItem = searchItems.find((item) => item.kind === 'event' && item.id === 'yt-040524-hama-grabs-amazon-card');
  const shioyaSearchItem = searchItems.find((item) => item.kind === 'person' && item.id === 'shioya-fumiyasu');
  if (!amazonSearchItem?.searchText.includes('堀金蒼平') || amazonSearchItem.searchText.includes('濱健人')) {
    errors.push('semantic P0 search index must identify 堀金, not 濱, as the Amazon winner');
  }
  if (!grabSearchItem?.searchText.includes('濱健人') || !grabSearchItem.searchText.includes('寺島惇太')) {
    errors.push('semantic P0 search index is missing the separate 濱/寺島 card-grab Event');
  }
  if (!shioyaSearchItem?.searchText.includes('しおや ふみよし') || shioyaSearchItem.searchText.includes('しおや ふみやす')) {
    errors.push('semantic P0 search index contains the wrong 汐谷 reading');
  }
}

for (const forbidden of [
  '濱与寺島同时拿到 Amazon 5000 円',
  '没带礼物的濱反而获得高价值返礼',
  'しおや ふみやす',
]) {
  if (html.includes(forbidden)) errors.push(`semantic P0 published HTML contains superseded copy: ${forbidden}`);
}
for (const required of [
  'Amazon 5000 円×2：寺島与堀金同时 Bingo',
  '濱去抢寺島的 Amazon 卡',
  'しおや ふみよし',
]) {
  if (!html.includes(required)) errors.push(`semantic P0 published HTML is missing corrected copy: ${required}`);
}
if (!html.includes('本场常用称呼') || html.includes('本场别名')) {
  errors.push('semantic P1 Person UI must label visible callNames as 本场常用称呼');
}
for (const removedHonorific of ['狩野さん', '井上君', '矢野さん', '光富さん', '熊谷君', '伊藤さん', '観世君', 'むろさん', '清典さん', '山本さん']) {
  if (html.includes(removedHonorific) || searchJsonText.includes(removedHonorific)) {
    errors.push(`semantic P1 published output contains removed honorific alias: ${removedHonorific}`);
  }
}
if (!html.includes('トシピ') || !searchJsonText.includes('トシピ') || html.includes('タカオ')) {
  errors.push('semantic P1 must publish トシピ, keep it searchable, and leave タカオ pending');
}
const accountChipCount = (html.match(/>室元気账号<\/button>/g) || []).length;
if (accountChipCount !== expectedAccountContextEvents.size
  || !html.includes('这段只能确认使用的是室元気的账号，实际说话者未确认。')) {
  errors.push(`semantic P1 account identity projection is incomplete: ${accountChipCount} account chips`);
}

const actualSourceEventButtons = (html.match(/data-source-event="/g) || []).length;
if (actualSourceEventButtons !== 0) {
  errors.push(`source event index contains ${actualSourceEventButtons} initial buttons; expected 0 for lazy generation`);
}

const actualSourceBrowseButtons = (html.match(/data-source-browse="/g) || []).length;
if (actualSourceBrowseButtons !== expectedTrackIds.size) {
  errors.push(`source browse shell contains ${actualSourceBrowseButtons} buttons; expected ${expectedTrackIds.size} tracks`);
}

const actualSourceLists = [...html.matchAll(/data-source-event-list="([^"]+)"/g)].map((match) => match[1]);
if (actualSourceLists.length !== expectedTrackIds.size || actualSourceLists.some((trackId) => !expectedTrackIds.has(trackId))) {
  errors.push(`source event list hosts are ${actualSourceLists.join(', ')}; expected one host for each public track`);
}

// RC12-B2 publication contract: every reader-facing expandable title must have
// exactly one hidden inline control wired to a real DOM target. This is a
// structural check for the built artifact; overflow and click behavior remain
// Browser consumer checks because they depend on the rendered viewport.
const readAttribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? null;
const expandableTags = [...html.matchAll(/<[^>]*data-inline-expandable="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const expandableEntries = expandableTags.map((tag) => ({
  id: readAttribute(tag, 'id'),
  key: readAttribute(tag, 'data-inline-expandable'),
}));
const expandableIds = new Set(expandableEntries.map(({ id }) => id).filter(Boolean));
const expandableKeys = new Set(expandableEntries.map(({ key }) => key).filter(Boolean));
const toggleTags = [...html.matchAll(/<button[^>]*data-inline-text-toggle="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const toggleEntries = toggleTags.map((tag) => ({
  key: readAttribute(tag, 'data-inline-text-toggle'),
  controls: readAttribute(tag, 'aria-controls'),
  expanded: readAttribute(tag, 'aria-expanded'),
  hidden: /\bhidden(?:\s|=|>)/.test(tag),
}));

const expectedInlineKeys = [
  'source-title-yt-main',
  'source-title-space-1',
  'source-title-space-2',
  'timeline-current-title',
  ...Array.from({ length: 8 }, (_, index) => `act-title-act-${String(index + 1).padStart(2, '0')}`),
];
if (expandableEntries.some(({ id, key }) => !id || !key)) {
  errors.push('inline expandable title is missing id or data-inline-expandable');
}
if (new Set(expandableEntries.map(({ id }) => id)).size !== expandableEntries.length) {
  errors.push('inline expandable titles contain duplicate DOM ids');
}
if (expandableKeys.size !== expectedInlineKeys.length
  || expectedInlineKeys.some((key) => !expandableKeys.has(key))) {
  errors.push(`inline expandable title keys are ${[...expandableKeys].join(', ')}; expected RC12-B2 Act/Timeline/Source coverage`);
}
if (toggleEntries.length !== expandableEntries.length) {
  errors.push(`inline text toggle count is ${toggleEntries.length}; expected one toggle per expandable title (${expandableEntries.length})`);
}
for (const { key, controls, expanded, hidden } of toggleEntries) {
  if (!key || !expandableKeys.has(key)) errors.push(`inline text toggle targets unknown expandable key: ${key || '(missing)'}`);
  if (!controls || !expandableIds.has(controls)) errors.push(`inline text toggle ${key || '(missing)'} targets missing DOM id: ${controls || '(missing)'}`);
  if (expanded !== 'false') errors.push(`inline text toggle ${key || '(missing)'} must initialize aria-expanded="false"`);
  if (!hidden) errors.push(`inline text toggle ${key || '(missing)'} must initialize hidden`);
}
const toggleKeys = new Set(toggleEntries.map(({ key }) => key).filter(Boolean));
if (toggleKeys.size !== toggleEntries.length) errors.push('inline text toggles contain duplicate data-inline-text-toggle keys');
for (const key of expandableKeys) {
  if (!toggleKeys.has(key)) errors.push(`expandable title ${key} is missing its inline text toggle`);
}

const controllerMatch = html.match(
  /<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/,
);
if (!controllerMatch) {
  errors.push('archive controller JSON is missing');
} else {
  try {
    const controller = JSON.parse(controllerMatch[1]);
    const controllerEvents = controller.events || {};
    const expectedEventIds = new Set(publicEventEntries.map(({ id }) => id));
    const actualEventIds = Object.keys(controllerEvents);
    if (actualEventIds.length !== expectedEventIds.size) {
      errors.push(`controller contains ${actualEventIds.length} events; expected ${expectedEventIds.size} public events`);
    }
    for (const { id, data } of publicEventEntries) {
      const event = controllerEvents[id];
      if (!event) {
        errors.push(`controller is missing public Event ${id}`);
        continue;
      }
      const expectedTrackId = data.track.split('/').at(-1) || data.track;
      if (event.trackId !== expectedTrackId || typeof event.startMs !== 'number' || typeof event.title !== 'string') {
        errors.push(`controller Event ${id} is missing stable trackId/startMs/title fields`);
      }
    }
    for (const id of actualEventIds) {
      if (!expectedEventIds.has(id)) errors.push(`controller exposes unexpected or withheld Event ${id}`);
    }
  } catch (error) {
    errors.push(`archive controller JSON is invalid: ${error.message}`);
  }
}

const expectedEventsByTrack = new Map();
for (const { id, data } of publicEventEntries) {
  const trackId = String(data.track).split('/').at(-1) || String(data.track);
  const list = expectedEventsByTrack.get(trackId) || [];
  list.push({ id, startMs: data.startMs });
  expectedEventsByTrack.set(trackId, list);
}
for (const [trackId, entries] of expectedEventsByTrack) {
  entries.sort((left, right) => left.startMs - right.startMs || left.id.localeCompare(right.id, 'en'));
}
const expectedTimelineTrackIds = ['yt-main', 'space-1', 'space-2'];
if (!controllerMatch) {
  errors.push('RC12-E controller track projection cannot be checked without controller JSON');
} else {
  try {
    const controller = JSON.parse(controllerMatch[1]);
    if (/["'](?:offset|offsetMs|offsetSeconds|globalOffset|globalStartMs)["']\s*:/i.test(JSON.stringify(controller))) {
      errors.push('RC12-E controller must not publish cross-source offset fields');
    }
    const controllerTracks = controller.tracks || {};
    for (const trackId of expectedTimelineTrackIds) {
      const track = controllerTracks[trackId];
      if (!track) {
        errors.push(`RC12-E controller is missing track projection ${trackId}`);
        continue;
      }
      if (track.clock !== 'native') errors.push(`RC12-E track ${trackId} must declare native clock`);
      const expectedIds = (expectedEventsByTrack.get(trackId) || []).map(({ id }) => id);
      const actualIds = Object.values(controller.events || {})
        .filter((event) => event.trackId === trackId)
        .sort((left, right) => left.startMs - right.startMs || left.id.localeCompare(right.id, 'en'))
        .map((event) => event.id);
      if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
        errors.push(`RC12-E event projection for ${trackId} is not complete or stably ordered`);
      }
    }
    const unexpectedTrackIds = [...expectedEventsByTrack.keys()].filter((trackId) => !expectedTimelineTrackIds.includes(trackId));
    if (unexpectedTrackIds.length) errors.push(`RC12-E found unexpected event track ids: ${unexpectedTrackIds.join(', ')}`);
  } catch (error) {
    errors.push(`RC12-E controller track projection is invalid: ${error.message}`);
  }
}

const actualTimelineScopeButtons = (html.match(/data-timeline-scope-button="/g) || []).length;
const actualTimelineScopePanels = (html.match(/data-timeline-scope-panel="/g) || []).length;
if (actualTimelineScopeButtons !== expectedTimelineTrackIds.length) {
  errors.push(`RC12-E timeline scope has ${actualTimelineScopeButtons} buttons; expected ${expectedTimelineTrackIds.length}`);
}
if (actualTimelineScopePanels !== expectedTimelineTrackIds.length) {
  errors.push(`RC12-E timeline scope has ${actualTimelineScopePanels} panels; expected ${expectedTimelineTrackIds.length}`);
}
const timelineScopePanelIds = new Set(
  [...html.matchAll(/<[^>]*data-timeline-scope-panel="[^"]+"[^>]*>/g)]
    .map((match) => readAttribute(match[0], 'id'))
    .filter(Boolean),
);
const timelineScopePanelTags = [...html.matchAll(/<[^>]*data-timeline-scope-panel="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
for (const tag of timelineScopePanelTags) {
  const key = readAttribute(tag, 'data-timeline-scope-panel');
  const labelledBy = readAttribute(tag, 'aria-labelledby');
  const hidden = readAttribute(tag, 'aria-hidden');
  const expectedHidden = key === expectedTimelineTrackIds[0] ? 'false' : 'true';
  if (!['true', 'false'].includes(hidden || '')) errors.push(`RC12-E panel ${key || '(missing)'} must expose aria-hidden`);
  else if (hidden !== expectedHidden) errors.push(`RC12-E panel ${key || '(missing)'} has unexpected initial aria-hidden=${hidden}`);
  if (!labelledBy || !htmlIds.has(labelledBy)) errors.push(`RC12-E panel ${key || '(missing)'} has invalid aria-labelledby`);
}
const timelineScopeButtonTags = [...html.matchAll(/<button[^>]*data-timeline-scope-button="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
for (const tag of timelineScopeButtonTags) {
  const key = readAttribute(tag, 'data-timeline-scope-button');
  const controls = readAttribute(tag, 'aria-controls');
  if (readAttribute(tag, 'type') !== 'button') errors.push(`RC12-E scope ${key || '(missing)'} must be a button`);
  if (!['true', 'false'].includes(readAttribute(tag, 'aria-pressed') || '')) errors.push(`RC12-E scope ${key || '(missing)'} must expose aria-pressed`);
  if (!controls || !timelineScopePanelIds.has(controls)) errors.push(`RC12-E scope ${key || '(missing)'} has invalid aria-controls`);
  if (!readAttribute(tag, 'aria-label')) errors.push(`RC12-E scope ${key || '(missing)'} is missing an accessible label`);
}
const timelineScopeDescriptionTag = html.match(/<p[^>]*data-timeline-scope-description[^>]*>/)?.[0];
if (!timelineScopeDescriptionTag || readAttribute(timelineScopeDescriptionTag, 'aria-live') !== 'polite') {
  errors.push('RC12-E scope description must expose aria-live=polite');
}

// RC12-T1 static contract: the YT 8-Act Navigator keeps one duration-ratio
// segment per Act and exposes a complete visible tooltip payload for each
// segment. Geometry, hover/focus visibility and narrow-container projection
// remain rendered Browser checks.
const timelineSegmentTags = [...html.matchAll(/<button[^>]*data-timeline-navigator-segment="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const timelineTooltipCount = (html.match(/data-timeline-navigator-tooltip/g) || []).length;
if (timelineSegmentTags.length !== 8) {
  errors.push(`RC12-T1 Navigator has ${timelineSegmentTags.length} segment buttons; expected 8`);
}
if (timelineTooltipCount !== 8) {
  errors.push(`RC12-T1 Navigator has ${timelineTooltipCount} tooltip markers; expected 8`);
}
for (const tag of timelineSegmentTags) {
  if (!readAttribute(tag, 'aria-label')?.startsWith('跳转到 ACT ')) {
    errors.push('RC12-T1 Navigator segment is missing its complete accessible label');
  }
}
if ((html.match(/data-timeline-navigator-tooltip[^>]*role="tooltip"/g) || []).length !== 8) {
  errors.push('RC12-T1 Navigator tooltips must expose role="tooltip"');
}

// RC12-T1.1 product correction: Navigator remains an inline child of the
// Timeline content column. Guard against reintroducing the rejected JS/CSS
// shell breakout or coupling Player sticky geometry to Navigator height.
const timelineShellSource = await readFile(path.resolve('src/components/project/ProjectArchiveShell.astro'), 'utf8');
const timelineNavigatorSource = await readFile(path.resolve('src/components/project/TimelineNavigator.astro'), 'utf8');
const timelineCssSource = await readFile(path.resolve('src/styles/project.css'), 'utf8');
const rejectedTimelineGeometryTokens = [
  'applyTimelineNavigatorGeometry',
  '--timeline-navigator-margin-start',
  '--timeline-navigator-margin-end',
  '--timeline-player-sticky-top',
  'data-timeline-geometry',
];
const timelineGeometrySources = `${timelineShellSource}\n${timelineNavigatorSource}\n${timelineCssSource}`;
for (const token of rejectedTimelineGeometryTokens) {
  if (timelineGeometrySources.includes(token)) {
    errors.push(`RC12-T1.1 rejected shell-breakout token is present: ${token}`);
  }
}
if (!/\.timeline-navigator\s*\{[\s\S]*?padding:\s*14px 14px 12px;/.test(timelineCssSource)) {
  errors.push('RC12-T1.1 Navigator must keep the 14px horizontal safe inset');
}
if (!/\.project-player-column\s*\{[\s\S]*?top:\s*96px;/.test(timelineCssSource)) {
  errors.push('RC12-T1.1 expanded Player must keep its independent 96px sticky top');
}

// RC12-Y1 static contract: both the visible player fallback and the player
// context rail must use the managed pause-before-handoff hook. The hook is
// intentionally independent from the external link's noopener default.
const externalHandoffCount = (html.match(/data-external-youtube-handoff/g) || []).length;
if (externalHandoffCount !== 2) {
  errors.push(`RC12-Y1 external handoff hooks are ${externalHandoffCount}; expected player fallback + context rail`);
}

// The built HTML proves that both reader-facing links carry the handoff hook,
// while this source contract protects the runtime side of Y1 from being
// reduced to a marker-only implementation during later refactors.
const archiveShellSource = await readFile(path.resolve('src/components/project/ProjectArchiveShell.astro'), 'utf8');
const handoffStart = archiveShellSource.indexOf('\n    pauseEmbeddedForExternalHandoff()');
const handoffEnd = handoffStart >= 0
  ? archiveShellSource.indexOf('\n    syncFromPlayer()', handoffStart)
  : -1;
const handoffSource = handoffStart >= 0 && handoffEnd > handoffStart
  ? archiveShellSource.slice(handoffStart, handoffEnd)
  : '';
if (!handoffSource) errors.push('RC12-Y1 pause-before-handoff method is missing or cannot be scoped');
if (!/this\.pendingSeekMs\s*=\s*null/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must clear pendingSeekMs before external navigation');
}
if (!/this\.stopPlaybackSync\(\)/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must stop playback sync before external navigation');
}
if (!/this\.player\.pauseVideo\(\)/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must call pauseVideo when the player is ready');
}

const forbiddenPublicationMarkers = [
  ['raw ASR file marker', /external_asr_raw/i],
  ['X author identifier', /author_id/i],
  ['private source root', /E:\\AI_Subtitle_Studio/i],
  ['private source root with forward slashes', /E:\/AI_Subtitle_Studio/i],
  ['process archive filename', /小松昌平生日会流程-所有对话存档/i],
  ['subtitle filename', /(?:^|[\s"'=\/\\])[^\s"'=<>]*\.(?:srt|vtt)(?:[\s"'<>]|$)/i],
  ['internal publication status label', /(?:已复核|有限定)/],
  ['internal transcript policy', /transcriptPolicy\s*:/i],
];

for (const [label, pattern] of forbiddenPublicationMarkers) {
  if (pattern.test(html)) errors.push(`published HTML contains ${label}`);
}

for (const [label, pattern] of forbiddenPublicationMarkers) {
  if (pattern.test(searchJsonText)) errors.push(`search JSON contains ${label}`);
}

for (const event of publicEvents) {
  if (event.qualification && html.includes(event.qualification)) {
    errors.push(`published HTML contains internal qualification for event ${event.title}`);
  }
  if (event.qualification && searchJsonText.includes(event.qualification)) {
    errors.push(`search JSON contains internal qualification for event ${event.title}`);
  }
}

for (const required of [
  'https://x.com/i/status/2043996150802592097',
  'https://x.com/i/status/2044007616284897782',
  'https://x.com/i/spaces/1dKrPEwrAoQJX',
  'https://x.com/i/spaces/1OxwblPnkDDJB',
  'MEDIA SOURCES',
  'data-source-track="yt-main"',
  'data-source-track="space-1"',
  'data-source-track="space-2"',
  'data-source-browse="yt-main"',
  'data-source-browse="space-1"',
  'data-source-browse="space-2"',
  'data-source-event-index',
  'data-player-current',
  '逐字稿暂不公开',
]) {
  if (!html.includes(required)) errors.push(`published HTML is missing required public marker: ${required}`);
}

if (errors.length) {
  console.error('Publication validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Publication validation passed (${outputBytes} bytes, ${searchPayload?.items?.length || 0} search JSON items, ${actualSourceEventButtons} initial source event buttons, ${expandableEntries.length} RC12-B2 expandable title contracts, ${actualTimelineScopeButtons} RC12-E timeline scopes, controller coverage verified, no private source markers).`,
);
