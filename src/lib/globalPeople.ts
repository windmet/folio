import { globalPersonRelevance, projectPersonRelevance } from './projectPeople';

type CollectionEntry = {
  id: string;
  data: any;
};

const referenceId = (reference: any) => reference?.id || reference;
const localId = (id: string) => id.split('/').at(-1) || id;

export const PERSON_PRESENCE_LABELS = {
  host: '主持',
  'on-site': '现场',
  'live-call': '电话连线',
  'live-space': 'Space',
  submitted: '预投稿',
  referenced: '被提及',
  'account-context': '账号语境',
} as const;

export const PERSON_ROLE_LABELS = {
  cast: '演员',
  production: '制作',
  action: '动作',
  host: '主持',
  ensemble: 'ensemble',
} as const;

const PERSON_PRESENCE_ORDER = Object.keys(PERSON_PRESENCE_LABELS);
const byPresenceKind = (left: { kind: string }, right: { kind: string }) => {
  const leftIndex = PERSON_PRESENCE_ORDER.indexOf(left.kind);
  const rightIndex = PERSON_PRESENCE_ORDER.indexOf(right.kind);
  return (leftIndex === -1 ? PERSON_PRESENCE_ORDER.length : leftIndex)
    - (rightIndex === -1 ? PERSON_PRESENCE_ORDER.length : rightIndex);
};

type EventAnchor = {
  id: string;
  event: CollectionEntry;
  href: string;
};

export type GlobalPersonContext = {
  kind: 'project';
  id: string;
  project: CollectionEntry;
  context: CollectionEntry;
  relevance: number;
  presence: Array<{ kind: string; label: string }>;
  roles: any[];
  events: EventAnchor[];
};

export type GlobalPersonIndexAppearance = {
  kind: 'index';
  id: string;
  index: CollectionEntry;
  date: string;
  roleLabel: string;
  summary: string;
  participation: string[];
  contextNames: Array<{
    label: string;
    kind: 'situational';
    evidence: string[];
  }>;
  entries: Array<{
    id: string;
    title: string;
    date: string;
    timestamp: string;
    href: string;
  }>;
};

export type GlobalPersonProjection = {
  id: string;
  identity: CollectionEntry;
  displayName: string;
  reading?: string;
  knownAs: string[];
  searchTokens: string[];
  contextSummary: string;
  links: any[];
  contextProfile?: { deck: string; scopeNote?: string };
  projectCount: number;
  indexCount: number;
  nodeCount: number;
  contexts: GlobalPersonContext[];
  indexAppearances: GlobalPersonIndexAppearance[];
  chronology: Array<GlobalPersonContext | GlobalPersonIndexAppearance>;
  relevance: number;
  presence: Array<{ kind: string; label: string }>;
};

const byPublicationDate = (left: GlobalPersonContext, right: GlobalPersonContext) =>
  right.project.data.publication.date.localeCompare(left.project.data.publication.date, 'en')
  || left.project.data.title.localeCompare(right.project.data.title, 'zh-CN');

const INDEX_PARTICIPATION_LABELS: Record<string, string> = {
  author: '发帖者',
  'conversation-participant': '对话参与者',
  referenced: '被提及',
  'source-subject': '记录对象',
};

const neutralContextSummary = (projectCount: number, indexAppearances: GlobalPersonIndexAppearance[]) => {
  const publicRecordCount = indexAppearances.filter((appearance) => appearance.index.data.kind === 'public-record').length;
  const otherIndexCount = indexAppearances.length - publicRecordCount;
  const parts = [
    projectCount > 0 ? `${projectCount} 项项目语境` : '',
    publicRecordCount > 0 ? `${publicRecordCount} 条公开记录` : '',
    otherIndexCount > 0 ? `${otherIndexCount} 项公开索引` : '',
  ].filter(Boolean);
  return parts.length > 0 ? `当前前情帖收录 ${parts.join(' · ')}。` : '当前仅建立人物身份记录。';
};

export const buildGlobalPeopleProjection = ({
  identities,
  projects,
  contexts,
  events,
  indexes = [],
  indexContexts = [],
  sources = [],
}: {
  identities: CollectionEntry[];
  projects: CollectionEntry[];
  contexts: CollectionEntry[];
  events: CollectionEntry[];
  indexes?: CollectionEntry[];
  indexContexts?: CollectionEntry[];
  sources?: CollectionEntry[];
}): GlobalPersonProjection[] => {
  const publishedProjects = projects.filter((project) => project.data.status === 'published');
  const projectsById = new Map(publishedProjects.map((project) => [project.id, project]));
  const identitiesById = new Map(identities.map((identity) => [identity.id, identity]));
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const indexContextsByPublicationAndPerson = new Map(indexContexts.map((context) => [
    `${referenceId(context.data.index)}::${referenceId(context.data.person)}`,
    context,
  ]));
  const contextsByPerson = new Map<string, GlobalPersonContext[]>();
  const indexAppearancesByPerson = new Map<string, GlobalPersonIndexAppearance[]>();

  for (const context of contexts) {
    const projectId = referenceId(context.data.project);
    const personId = referenceId(context.data.person);
    const project = projectsById.get(projectId);
    const identity = identitiesById.get(personId);
    if (!project || !identity) continue;

    const eventAnchors = (context.data.events || [])
      .map((eventReference: any) => eventsById.get(referenceId(eventReference)))
      .filter((event: CollectionEntry | undefined) => event && event.data.publicationStatus !== 'withheld')
      .map((event: CollectionEntry) => ({
        id: localId(event.id),
        event,
        href: `/projects/${project.data.slug}/?view=timeline&event=${localId(event.id)}`,
      }))
      .sort((left: EventAnchor, right: EventAnchor) => left.event.data.startMs - right.event.data.startMs);

    const presence: Array<{ kind: string; label: string }> = Array.from(
      new Map<string, { kind: string; label: string }>((context.data.presence || []).map((item: any) => [
        item.kind,
        { kind: item.kind, label: PERSON_PRESENCE_LABELS[item.kind as keyof typeof PERSON_PRESENCE_LABELS] || item.kind },
      ] as [string, { kind: string; label: string }])).values(),
    );
    const projectedContext: GlobalPersonContext = {
      kind: 'project',
      id: context.id,
      project,
      context,
      relevance: projectPersonRelevance(context.data.presence),
      presence,
      roles: context.data.roles || [],
      events: eventAnchors,
    };
    const list = contextsByPerson.get(identity.id) || [];
    list.push(projectedContext);
    contextsByPerson.set(identity.id, list);
  }

  for (const index of indexes.filter((entry) => entry.data.status === 'published')) {
    const entriesByPerson = new Map<string, any[]>();
    for (const item of index.data.entries || []) {
      for (const personReference of item.people || []) {
        const personId = referenceId(personReference);
        if (!identitiesById.has(personId)) continue;
        const entries = entriesByPerson.get(personId) || [];
        entries.push(item);
        entriesByPerson.set(personId, entries);
      }
    }
    for (const [personId, matchingEntries] of entriesByPerson) {
      const indexContext = indexContextsByPublicationAndPerson.get(`${index.id}::${personId}`);
      const scopedEntryIds = new Set(indexContext?.data.entries || matchingEntries.map((item) => item.id));
      const scopedEntries = matchingEntries.filter((item) => scopedEntryIds.has(item.id));
      const entryTimestamp = (item: any) => item.source
        ? sourcesById.get(referenceId(item.source))?.data.publishedAt || item.date
        : item.date;
      const sortedEntries = [...scopedEntries].sort((left, right) => {
        const comparison = entryTimestamp(left).localeCompare(entryTimestamp(right), 'en');
        return index.data.chronology.defaultOrder === 'asc' ? comparison : -comparison;
      });
      const appearance: GlobalPersonIndexAppearance = {
        kind: 'index',
        id: index.id,
        index,
        date: sortedEntries.at(-1)?.date || '',
        roleLabel: indexContext
          ? indexContext.data.participation.map((kind: string) => INDEX_PARTICIPATION_LABELS[kind] || kind).join(' / ')
          : (sortedEntries.some((item) => {
            const source = item.source ? sourcesById.get(referenceId(item.source)) : null;
            return source && referenceId(source.data.author?.person) === personId;
          }) ? '发帖者 / 对话参与者' : '对话参与者'),
        summary: indexContext?.data.summary
          || `该人物在这项公开索引中出现于 ${sortedEntries.length} 个记录节点。`,
        participation: indexContext?.data.participation || [],
        contextNames: indexContext?.data.contextNames || [],
        entries: sortedEntries.map((item) => ({
          id: item.id,
          title: item.title,
          date: item.date,
          timestamp: entryTimestamp(item),
          href: `/indexes/${index.data.slug}/#${item.id}`,
        })),
      };
      const appearances = indexAppearancesByPerson.get(personId) || [];
      appearances.push(appearance);
      indexAppearancesByPerson.set(personId, appearances);
    }
  }

  return identities.map((identity) => {
    const personContexts = (contextsByPerson.get(identity.id) || []).sort(byPublicationDate);
    const indexAppearances = (indexAppearancesByPerson.get(identity.id) || [])
      .sort((left, right) => right.date.localeCompare(left.date, 'en')
        || left.index.data.title.localeCompare(right.index.data.title, 'zh-CN'));
    const chronology = [...personContexts, ...indexAppearances].sort((left, right) => {
      const leftDate = left.kind === 'project' ? left.project.data.publication.date : left.date;
      const rightDate = right.kind === 'project' ? right.project.data.publication.date : right.date;
      return rightDate.localeCompare(leftDate, 'en');
    });
    const projectIds = new Set(personContexts.map((context) => context.project.id));
    const nodeCount = personContexts.reduce((total, context) => total + context.events.length, 0)
      + indexAppearances.reduce((total, appearance) => total + appearance.entries.length, 0);
    const presence: Array<{ kind: string; label: string }> = Array.from(
      new Map<string, { kind: string; label: string }>(
        personContexts.flatMap((context) => context.presence).map((item) => [item.kind, item]),
      ).values(),
    ).sort(byPresenceKind);
    return {
      id: identity.id,
      identity,
      displayName: identity.data.displayName,
      reading: identity.data.reading,
      knownAs: identity.data.knownAs || [],
      searchTokens: identity.data.searchTokens || [],
      contextSummary: identity.data.contextProfile?.deck
        || identity.data.contextSummary
        || neutralContextSummary(projectIds.size, indexAppearances),
      links: identity.data.links || [],
      contextProfile: identity.data.contextProfile,
      projectCount: projectIds.size,
      indexCount: indexAppearances.length,
      nodeCount,
      contexts: personContexts,
      indexAppearances,
      chronology,
      relevance: globalPersonRelevance(personContexts.map((context) => context.context)),
      presence,
    };
  }).sort((left, right) => right.relevance - left.relevance
    || right.projectCount - left.projectCount
    || left.displayName.localeCompare(right.displayName, 'zh-CN'));
};
