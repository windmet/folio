import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const contentRoot = path.resolve('src/content/projects');
const manifestRoot = path.resolve('data/source-sets');
const errors = [];

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const exists = (set, value, context) => {
  if (!set.has(value)) errors.push(`${context}: missing reference ${value}`);
};
const asId = (projectId, fileName) => `${projectId}/${fileName.replace(/\.(json|md)$/, '')}`;

const projectDirs = (await readdir(contentRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());

for (const projectDir of projectDirs) {
  const projectId = projectDir.name;
  const root = path.join(contentRoot, projectId);
  const project = await readJson(path.join(root, 'project.json'));
  const manifest = await readJson(path.join(manifestRoot, `${project.sourceSetId}.json`));

  if (project.slug !== projectId) errors.push(`${projectId}: project.slug must match its directory`);
  if (manifest.sourceSetId !== project.sourceSetId) errors.push(`${projectId}: sourceSetId mismatch`);

  const readCollection = async (folder, extension = '.json') => {
    const dir = path.join(root, folder);
    const entries = (await readdir(dir)).filter((name) => name.endsWith(extension));
    return Promise.all(entries.map(async (name) => ({
      id: asId(projectId, name),
      file: name,
      data: extension === '.json'
        ? await readJson(path.join(dir, name))
        : YAML.parse((await readFile(path.join(dir, name), 'utf8')).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''),
    })));
  };

  const tracks = await readCollection('tracks');
  const acts = await readCollection('acts');
  const events = await readCollection('events');
  const threads = await readCollection('threads', '.md');
  const people = await readCollection('people');
  const sources = await readCollection('sources');

  const trackIds = new Set(tracks.map(({ id }) => id));
  const actIds = new Set(acts.map(({ id }) => id));
  const eventIds = new Set(events.map(({ id }) => id));
  const threadIds = new Set(threads.map(({ id }) => id));
  const peopleIds = new Set(people.map(({ id }) => id));
  const trackById = new Map(tracks.map((entry) => [entry.id, entry.data]));
  const actById = new Map(acts.map((entry) => [entry.id, entry.data]));
  const eventById = new Map(events.map((entry) => [entry.id, entry.data]));
  const referencedEventIds = new Set();

  if (threads.length !== manifest.files.arcs.arcCount) {
    errors.push(`${projectId}: expected ${manifest.files.arcs.arcCount} threads from canonical arcs, found ${threads.length}`);
  }

  if (acts.length !== 8) errors.push(`${projectId}: Phase 2 requires 8 editorial acts, found ${acts.length}`);

  const publicSourceUrls = new Set(sources.map(({ data }) => data.publicUrl).filter(Boolean));
  for (const { id, data } of tracks) {
    if (data.playback.provider === 'external') {
      if (data.playback.url !== data.fallbackUrl) errors.push(`${id}: external playback URL must equal fallbackUrl`);
      if (!publicSourceUrls.has(data.playback.url)) errors.push(`${id}: external playback URL is missing from projectSources`);
      if (!data.sourcePublishedAt) errors.push(`${id}: external playback requires sourcePublishedAt`);
    }
  }

  for (const id of project.featuredThreads || []) exists(threadIds, id, `${projectId}/project.json`);

  for (const { id, data } of acts) {
    exists(trackIds, data.track, id);
    if (!(data.startMs < data.endMs)) errors.push(`${id}: invalid time range`);
    if (!['draft', 'confirmed'].includes(data.editorialStatus)) errors.push(`${id}: missing editorialStatus`);
  }

  const defaultTrackId = project.defaultTrack;
  const defaultTrack = trackById.get(defaultTrackId);
  const mainActs = acts
    .filter(({ data }) => data.track === defaultTrackId)
    .sort((a, b) => a.data.order - b.data.order);
  if (!defaultTrack) errors.push(`${projectId}: defaultTrack must reference a track in this project`);
  if (!mainActs.length) errors.push(`${projectId}: defaultTrack must have at least one editorial act`);
  if (defaultTrack && mainActs.length) {
    if (mainActs[0].data.startMs !== 0) errors.push(`${projectId}: first main act must start at 0`);
    if (mainActs.at(-1).data.endMs !== defaultTrack.durationMs) {
      errors.push(`${projectId}: last main act must end at default track duration`);
    }
    for (let index = 1; index < mainActs.length; index += 1) {
      if (mainActs[index].data.order !== mainActs[index - 1].data.order + 1) {
        errors.push(`${projectId}: main act order must be contiguous`);
      }
      if (mainActs[index].data.startMs !== mainActs[index - 1].data.endMs) {
        errors.push(`${projectId}: main acts must cover the track without gaps or overlaps`);
      }
    }
  }

  for (const { id, data } of events) {
    for (const forbidden of ['threadIds', 'topicIds', 'claimIds']) {
      if (forbidden in data) errors.push(`${id}: forbidden Phase 1 field ${forbidden}`);
    }
    exists(trackIds, data.track, id);
    for (const person of data.people) exists(peopleIds, person, id);
    const track = trackById.get(data.track);
    if (!(data.startMs < data.endMs && data.endMs <= track.durationMs)) {
      errors.push(`${id}: event range is outside track duration`);
    }
    if (data.act) {
      exists(actIds, data.act, id);
      const act = actById.get(data.act);
      if (act && (data.track !== act.track || data.startMs < act.startMs || data.endMs > act.endMs)) {
        errors.push(`${id}: event is outside its act`);
      }
    }
    if (data.publicationStatus === 'qualified' && !data.qualification) {
      errors.push(`${id}: qualified event requires qualification text`);
    }
    const serialized = JSON.stringify(data);
    if (/[A-Z]:\\|author_id/.test(serialized)) errors.push(`${id}: contains private source data`);
  }

  for (const { id, data } of threads) {
    const nodeEvents = [];
    for (const node of data.nodes) {
      exists(eventIds, node.event, id);
      if (eventById.has(node.event)) {
        const event = eventById.get(node.event);
        nodeEvents.push(event);
        referencedEventIds.add(node.event);
        if (event.publicationStatus === 'withheld') {
          errors.push(`${id}: thread exposes withheld event ${node.event}`);
        }
      }
    }
    const tracksUsed = new Set(nodeEvents.map((event) => event.track));
    if (tracksUsed.size === 1) {
      for (let index = 1; index < nodeEvents.length; index += 1) {
        if (nodeEvents[index].startMs < nodeEvents[index - 1].startMs) {
          errors.push(`${id}: single-track nodes are not time-ascending`);
        }
      }
    }
  }

  for (const { id, data } of events) {
    const narrativeMode = data.narrativeMode || 'threaded';
    const isReferenced = referencedEventIds.has(id);
    if (data.publicationStatus !== 'withheld' && narrativeMode === 'threaded' && !isReferenced) {
      errors.push(`${id}: threaded public event is not consumed by any thread`);
    }
    if (narrativeMode === 'timeline-only' && isReferenced) {
      errors.push(`${id}: timeline-only event must not be referenced by a thread`);
    }
  }

  for (const { id } of people) {
    const used = events.some(({ data }) => data.people.includes(id));
    if (!used) errors.push(`${id}: person is not referenced by any event`);
  }

  for (const collection of [tracks, acts, events, threads, people, sources]) {
    for (const { id, data } of collection) {
      if (data.project !== projectId) errors.push(`${id}: project reference must match directory`);
      if (/[A-Z]:\\|author_id/i.test(JSON.stringify(data))) errors.push(`${id}: contains private source data`);
    }
  }
}

if (errors.length) {
  console.error('Project validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Project validation passed (${projectDirs.length} project).`);
