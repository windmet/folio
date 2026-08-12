import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const contentRoot = path.resolve('src/content/projects');
const distRoot = path.resolve('dist');
const errors = [];

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const listFiles = async (directory, extension) => {
  try {
    return (await readdir(directory)).filter((name) => name.endsWith(extension));
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
};
const readOutput = async (filePath, label) => {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    errors.push(`${label} is missing: ${path.relative(process.cwd(), filePath)} (${error.message})`);
    return null;
  }
};
const valuesFor = (html, attribute) => [
  ...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')),
].map((match) => match[1]);
const sameMembers = (actual, expected) => (
  actual.length === expected.length
  && actual.every((value, index) => value === expected[index])
);

const projectDirs = (await readdir(contentRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory());
const projects = await Promise.all(projectDirs.map(async ({ name }) => ({
  id: name,
  data: await readJson(path.join(contentRoot, name, 'project.json')),
})));
const homeHtml = await readOutput(path.join(distRoot, 'index.html'), 'home route');

const forbiddenPublicationMarkers = [
  ['raw ASR file marker', /external_asr_raw/i],
  ['private author identifier', /author_id/i],
  ['Windows local path', /(?:^|[\s"'=])(?:[A-Z]:\\|[A-Z]:\/(?!\/))[^\s"'<>]*/i],
  ['subtitle filename', /(?:^|[\s"'=\/\\])[^\s"'=<>]*\.(?:srt|vtt)(?:[\s"'<>]|$)/i],
  ['JSONL evidence filename', /(?:^|[\s"'=\/\\])[^\s"'=<>]*\.jsonl(?:[\s"'<>]|$)/i],
];

for (const { id: projectId, data: project } of projects) {
  const root = path.join(contentRoot, projectId);
  const outputRoot = path.join(distRoot, 'projects', project.slug);
  const html = await readOutput(path.join(outputRoot, 'index.html'), `${projectId} project route`);
  const searchText = await readOutput(path.join(outputRoot, 'search.json'), `${projectId} search route`);
  if (!html || !searchText) continue;

  let searchPayload;
  try {
    searchPayload = JSON.parse(searchText);
  } catch (error) {
    errors.push(`${projectId}: search.json is invalid JSON (${error.message})`);
    continue;
  }

  const [trackFiles, eventFiles, threadFiles, peopleFiles] = await Promise.all([
    listFiles(path.join(root, 'tracks'), '.json'),
    listFiles(path.join(root, 'events'), '.json'),
    listFiles(path.join(root, 'threads'), '.md'),
    listFiles(path.join(root, 'people'), '.json'),
  ]);
  const events = await Promise.all(eventFiles.map((name) => readJson(path.join(root, 'events', name))));
  const publicEventCount = events.filter((event) => event.publicationStatus !== 'withheld').length;
  const expectedSearchItems = publicEventCount + threadFiles.length + peopleFiles.length;

  if (searchPayload.schemaVersion !== 1 || searchPayload.project !== project.slug) {
    errors.push(`${projectId}: search.json identity does not match the project`);
  }
  if (!Array.isArray(searchPayload.items) || searchPayload.items.length !== expectedSearchItems) {
    errors.push(`${projectId}: expected ${expectedSearchItems} public search items, found ${searchPayload.items?.length ?? 'invalid'}`);
  }

  const homeLink = `href="/projects/${project.slug}/"`;
  if (project.status === 'published' && !homeHtml?.includes(homeLink)) {
    errors.push(`${projectId}: published project is missing from the home page`);
  }
  if (project.status === 'draft' && homeHtml?.includes(homeLink)) {
    errors.push(`${projectId}: draft project must not appear on the home page`);
  }

  const expectedViews = [...project.views].sort();
  const navViews = valuesFor(html, 'data-view-button').sort();
  const panelViews = valuesFor(html, 'data-view-panel').sort();
  if (!sameMembers(navViews, expectedViews)) {
    errors.push(`${projectId}: rendered view navigation (${navViews.join(', ')}) does not match views (${expectedViews.join(', ')})`);
  }
  if (!sameMembers(panelViews, expectedViews)) {
    errors.push(`${projectId}: rendered view panels (${panelViews.join(', ')}) do not match views (${expectedViews.join(', ')})`);
  }

  if (trackFiles.length === 1) {
    for (const [label, marker] of [
      ['Media Source Navigator', 'class="media-sources"'],
      ['Timeline Scope', 'data-timeline-scope'],
      ['Source selector', 'data-source-track='],
    ]) {
      if (html.includes(marker)) errors.push(`${projectId}: single-track project renders ${label}`);
    }
  }
  if (threadFiles.length === 0) {
    for (const marker of ['data-view-button="storylines"', 'data-thread-detail=', 'data-thread-overlay']) {
      if (html.includes(marker)) errors.push(`${projectId}: zero-thread project renders Storylines UI (${marker})`);
    }
  }
  if (peopleFiles.length === 0) {
    for (const marker of ['data-view-button="people"', 'data-person-detail=', 'data-person-overlay']) {
      if (html.includes(marker)) errors.push(`${projectId}: zero-people project renders People UI (${marker})`);
    }
  }

  const controllerMatch = html.match(
    /<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!controllerMatch) {
    errors.push(`${projectId}: archive controller JSON is missing`);
  } else {
    try {
      JSON.parse(controllerMatch[1]);
    } catch (error) {
      errors.push(`${projectId}: archive controller JSON is invalid (${error.message})`);
    }
    for (const { id: otherProjectId } of projects) {
      if (otherProjectId !== projectId && controllerMatch[1].includes(`${otherProjectId}/`)) {
        errors.push(`${projectId}: controller JSON contains data from ${otherProjectId}`);
      }
    }
  }

  for (const [label, pattern] of forbiddenPublicationMarkers) {
    if (pattern.test(html)) errors.push(`${projectId}: published HTML contains ${label}`);
    if (pattern.test(searchText)) errors.push(`${projectId}: search JSON contains ${label}`);
  }
}

if (errors.length) {
  console.error('Generic publication validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Generic publication validation passed (${projects.length} project route${projects.length === 1 ? '' : 's'}).`);
