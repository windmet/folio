import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const projectId = 'komatsu36';
const projectRoot = path.resolve('src/content/projects', projectId);
const outputFile = path.resolve('dist/projects', projectId, 'index.html');
const homeOutputFile = path.resolve('dist/index.html');
const errors = [];

const listFiles = async (folder, extension) => (await readdir(path.join(projectRoot, folder)))
  .filter((name) => name.endsWith(extension));
const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const eventFiles = await listFiles('events', '.json');
const publicEvents = (await Promise.all(eventFiles.map((name) => readJson(path.join(projectRoot, 'events', name)))))
  .filter((event) => event.publicationStatus !== 'withheld');
const threadCount = (await listFiles('threads', '.md')).length;
const peopleCount = (await listFiles('people', '.json')).length;
const expectedSearchItems = publicEvents.length + threadCount + peopleCount;

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
if (actualSearchItems !== expectedSearchItems) {
  errors.push(`search index contains ${actualSearchItems} items; expected ${expectedSearchItems} public Event/Thread/Person items`);
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

for (const event of publicEvents) {
  if (event.qualification && html.includes(event.qualification)) {
    errors.push(`published HTML contains internal qualification for event ${event.title}`);
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
  `Publication validation passed (${outputBytes} bytes, ${actualSearchItems} public search items, no private source markers).`,
);
