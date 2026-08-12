import { normalizeProjectSearchText } from './projectSearchNormalization';

type CollectionEntry = {
  id: string;
  data: any;
};

export type ProjectSearchItem =
  | {
      kind: 'event';
      id: string;
      label: string;
      title: string;
      searchText: string;
      trackId: string;
      startMs: number;
      preferredThreadId?: string;
    }
  | {
      kind: 'thread' | 'person';
      id: string;
      label: string;
      title: string;
      searchText: string;
    };

const localId = (id: string) => id.split('/').at(-1) || id;
const referenceId = (reference: any) => reference?.id || reference;

const formatTime = (milliseconds: number) => {
  const total = Math.floor(milliseconds / 1000);
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

const searchText = (...values: unknown[]) => values
  .flat(Infinity)
  .filter(Boolean)
  .join(' ');

const participationText = (person: CollectionEntry) => (person.data.participation || []).map((item: any) => [
  item.kind,
  item.character,
  item.credit,
  ...(item.sessions || []),
]);

export const buildProjectSearchIndex = ({
  events,
  threads,
  people,
  tracks,
}: {
  events: CollectionEntry[];
  threads: CollectionEntry[];
  people: CollectionEntry[];
  tracks: CollectionEntry[];
}): ProjectSearchItem[] => {
  const tracksById = new Map(tracks.map((track) => [track.id, track]));
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const threadsByEvent = new Map<string, string[]>();

  for (const thread of threads) {
    for (const node of thread.data.nodes) {
      const eventId = referenceId(node.event);
      const list = threadsByEvent.get(eventId) || [];
      list.push(localId(thread.id));
      threadsByEvent.set(eventId, list);
    }
  }
  for (const threadIds of threadsByEvent.values()) {
    threadIds.sort((left, right) => left.localeCompare(right, 'en'));
  }

  const publishedEvents = events
    .filter((event) => event.data.publicationStatus !== 'withheld')
    .sort((left, right) => referenceId(left.data.track).localeCompare(referenceId(right.data.track), 'en')
      || left.data.startMs - right.data.startMs
      || localId(left.id).localeCompare(localId(right.id), 'en'));
  const orderedThreads = [...threads].sort((left, right) => Number(right.data.featured) - Number(left.data.featured)
    || left.data.title.localeCompare(right.data.title, 'zh-CN'));
  const orderedPeople = [...people].sort((left, right) => left.data.displayName.localeCompare(right.data.displayName, 'zh-CN'));

  const items: ProjectSearchItem[] = [];
  for (const event of publishedEvents) {
    const track = tracksById.get(referenceId(event.data.track));
    const relatedPeople = event.data.people
      .map((personReference: any) => peopleById.get(referenceId(personReference)))
      .filter(Boolean);
    const relatedThread = threadsByEvent.get(event.id)?.[0];
    const item: ProjectSearchItem = {
      kind: 'event',
      id: localId(event.id),
      label: `事件 · ${track?.data.shortLabel || '—'} ${formatTime(event.data.startMs)}`,
      title: event.data.title,
      searchText: normalizeProjectSearchText(searchText(
        event.data.title,
        event.data.summary,
        relatedPeople.map((person: any) => [person.data.displayName, person.data.callNames, person.data.searchAliases]),
      )),
      trackId: localId(referenceId(event.data.track)),
      startMs: event.data.startMs,
    };
    if (relatedThread) item.preferredThreadId = relatedThread;
    items.push(item);
  }

  for (const thread of orderedThreads) {
    items.push({
      kind: 'thread',
      id: localId(thread.id),
      label: `故事线 · ${thread.data.nodes.length} 个节点`,
      title: thread.data.title,
      searchText: normalizeProjectSearchText(searchText(thread.data.title, thread.data.deck, thread.data.category)),
    });
  }

  for (const person of orderedPeople) {
    items.push({
      kind: 'person',
      id: localId(person.id),
      label: `人物 · ${person.data.reading || '人物索引'}`,
      title: person.data.displayName,
      searchText: normalizeProjectSearchText(searchText(
        person.data.displayName,
        person.data.reading,
        person.data.callNames,
        person.data.searchAliases,
        person.data.projectContext,
        participationText(person),
        (person.data.links || []).map((link: any) => [link.label, link.platform]),
      )),
    });
  }

  return items;
};
