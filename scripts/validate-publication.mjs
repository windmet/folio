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
  `Publication validation passed (${outputBytes} bytes, ${searchPayload?.items?.length || 0} search JSON items, ${actualSourceEventButtons} initial source event buttons, controller coverage verified, no private source markers).`,
);
