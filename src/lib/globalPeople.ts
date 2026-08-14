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

type EventAnchor = {
  id: string;
  event: CollectionEntry;
  href: string;
};

export type GlobalPersonContext = {
  id: string;
  project: CollectionEntry;
  context: CollectionEntry;
  relevance: number;
  presence: Array<{ kind: string; label: string }>;
  roles: any[];
  events: EventAnchor[];
};

export type GlobalPersonProjection = {
  id: string;
  identity: CollectionEntry;
  displayName: string;
  reading?: string;
  aliases: string[];
  links: any[];
  contextProfile?: { deck: string; scopeNote?: string };
  projectCount: number;
  contexts: GlobalPersonContext[];
  relevance: number;
  presence: Array<{ kind: string; label: string }>;
};

const byPublicationDate = (left: GlobalPersonContext, right: GlobalPersonContext) =>
  right.project.data.publication.date.localeCompare(left.project.data.publication.date, 'en')
  || left.project.data.title.localeCompare(right.project.data.title, 'zh-CN');

export const buildGlobalPeopleProjection = ({
  identities,
  projects,
  contexts,
  events,
}: {
  identities: CollectionEntry[];
  projects: CollectionEntry[];
  contexts: CollectionEntry[];
  events: CollectionEntry[];
}): GlobalPersonProjection[] => {
  const publishedProjects = projects.filter((project) => project.data.status === 'published');
  const projectsById = new Map(publishedProjects.map((project) => [project.id, project]));
  const identitiesById = new Map(identities.map((identity) => [identity.id, identity]));
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const contextsByPerson = new Map<string, GlobalPersonContext[]>();

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

  return identities.map((identity) => {
    const personContexts = (contextsByPerson.get(identity.id) || []).sort(byPublicationDate);
    const projectIds = new Set(personContexts.map((context) => context.project.id));
    const presence: Array<{ kind: string; label: string }> = Array.from(
      new Map<string, { kind: string; label: string }>(
        personContexts.flatMap((context) => context.presence).map((item) => [item.kind, item]),
      ).values(),
    );
    return {
      id: identity.id,
      identity,
      displayName: identity.data.displayName,
      reading: identity.data.reading,
      aliases: identity.data.aliases || [],
      links: identity.data.links || [],
      contextProfile: identity.data.contextProfile,
      projectCount: projectIds.size,
      contexts: personContexts,
      relevance: globalPersonRelevance(personContexts.map((context) => context.context)),
      presence,
    };
  }).sort((left, right) => right.relevance - left.relevance
    || right.projectCount - left.projectCount
    || left.displayName.localeCompare(right.displayName, 'zh-CN'));
};
