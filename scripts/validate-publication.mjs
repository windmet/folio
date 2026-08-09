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
  return { id: name.replace(/\.md$/, ''), data: YAML.parse(frontmatter) };
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

const searchJsonText = searchPayload ? JSON.stringify(searchPayload) : '';
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
