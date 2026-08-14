import { normalizeProjectSearchText } from './projectSearchNormalization';

type CollectionEntry = { id: string; data: any };

export type GlobalSearchKind = 'project' | 'event' | 'person' | 'index' | 'post';
export const GLOBAL_SEARCH_SCOPE: GlobalSearchKind[] = ['project', 'event', 'person', 'index', 'post'];
export const GLOBAL_SEARCH_LOCAL_ONLY = ['work', 'context'] as const;

export type GlobalSearchItem = {
  kind: GlobalSearchKind;
  id: string;
  label: string;
  title: string;
  summary: string;
  href: string;
  date?: string;
  searchText: string;
};

const referenceId = (reference: any) => reference?.id || reference;
const localId = (id: string) => id.split('/').at(-1) || id;
const flattenText = (...values: unknown[]) => values.flat(Infinity).filter(Boolean).join(' ');
const dateValue = (value: unknown) => value instanceof Date
  ? value.toISOString().slice(0, 10)
  : String(value || '');

const sortDateDesc = (left: { date?: string }, right: { date?: string }) =>
  (right.date || '').localeCompare(left.date || '', 'en');

export const buildGlobalSearchIndex = ({
  projects,
  events,
  people,
  personContexts,
  indexes,
  posts,
}: {
  projects: CollectionEntry[];
  events: CollectionEntry[];
  people: CollectionEntry[];
  personContexts: CollectionEntry[];
  indexes: CollectionEntry[];
  posts: CollectionEntry[];
}): GlobalSearchItem[] => {
  const publishedProjects = projects.filter((project) => project.data.status === 'published');
  const projectsById = new Map(publishedProjects.map((project) => [project.id, project]));
  const contextsById = new Map(personContexts.map((context) => [context.id, context]));
  const identitiesById = new Map(people.map((person) => [person.id, person]));
  const contextsByPerson = new Map<string, CollectionEntry[]>();

  for (const context of personContexts) {
    const identityId = referenceId(context.data.person);
    const list = contextsByPerson.get(identityId) || [];
    list.push(context);
    contextsByPerson.set(identityId, list);
  }

  const items: GlobalSearchItem[] = [];

  for (const project of publishedProjects) {
    const publication = project.data.publication;
    items.push({
      kind: 'project',
      id: project.data.slug,
      label: publication.kind === 'special' ? 'Project · Special' : 'Project · Episode',
      title: project.data.title,
      summary: project.data.summary,
      href: `/projects/${project.data.slug}/`,
      date: publication.date,
      searchText: normalizeProjectSearchText(flattenText(
        project.data.title,
        project.data.eyebrow,
        project.data.summary,
        project.data.publication.homeDeck,
      )),
    });
  }

  const publishedEvents = events.filter((event) => event.data.publicationStatus !== 'withheld');
  for (const event of publishedEvents) {
    const projectId = referenceId(event.data.project);
    const project = projectsById.get(projectId);
    if (!project) continue;
    const relatedPeople = (event.data.people || [])
      .map((reference: any) => contextsById.get(referenceId(reference)))
      .filter(Boolean)
      .map((context: any) => identitiesById.get(referenceId(context.data.person)))
      .filter(Boolean);
    const projectSlug = project.data.slug;
    items.push({
      kind: 'event',
      id: `${projectSlug}/${localId(event.id)}`,
      label: `Event · ${project.data.title}`,
      title: event.data.title,
      summary: event.data.summary,
      href: `/projects/${projectSlug}/?view=timeline&event=${encodeURIComponent(localId(event.id))}`,
      date: project.data.publication.date,
      searchText: normalizeProjectSearchText(flattenText(
        event.data.title,
        event.data.summary,
        event.data.tags,
        relatedPeople.map((person: any) => [person.data.displayName, person.data.reading, person.data.aliases]),
      )),
    });
  }

  for (const person of people) {
    const contexts = contextsByPerson.get(person.id) || [];
    const publishedContexts = contexts.filter((context) => projectsById.has(referenceId(context.data.project)));
    if (!publishedContexts.length) continue;
    const contextSummaries = publishedContexts.map((context) => context.data.summary);
    items.push({
      kind: 'person',
      id: person.id,
      label: 'Person · Global identity',
      title: person.data.displayName,
      summary: person.data.contextProfile?.deck || contextSummaries[0] || '跨档案人物索引',
      href: `/people/${person.id}/`,
      searchText: normalizeProjectSearchText(flattenText(
        person.data.displayName,
        person.data.reading,
        person.data.aliases,
        person.data.contextProfile,
        contextSummaries,
      )),
    });
  }

  for (const entry of indexes.filter((item) => item.data.status === 'published')) {
    const latestDate = [...entry.data.entries]
      .map((item: any) => item.date)
      .sort((left, right) => right.localeCompare(left, 'en'))[0];
    const entryPeople = entry.data.entries.flatMap((item: any) => item.people || [])
      .map((person: any) => identitiesById.get(referenceId(person)))
      .filter(Boolean);
    items.push({
      kind: 'index',
      id: entry.data.slug,
      label: 'Index · Series / public record',
      title: entry.data.title,
      summary: entry.data.summary,
      href: `/indexes/${entry.data.slug}/`,
      date: latestDate,
      searchText: normalizeProjectSearchText(flattenText(
        entry.data.title,
        entry.data.summary,
        entry.data.homeDeck,
        entry.data.aliases,
        entry.data.entries.map((item: any) => [item.title, item.summary]),
        entryPeople.map((person: any) => [person.data.displayName, person.data.reading, person.data.aliases]),
      )),
    });
  }

  for (const post of posts) {
    const date = dateValue(post.data.date);
    items.push({
      kind: 'post',
      id: post.id,
      label: `Post · ${post.data.section}`,
      title: post.data.title,
      summary: post.data.description || '',
      href: `/posts/${post.id}/`,
      date,
      searchText: normalizeProjectSearchText(flattenText(
        post.data.title,
        post.data.description,
        post.data.section,
      )),
    });
  }

  return items.sort((left, right) => sortDateDesc(left, right) || left.title.localeCompare(right.title, 'zh-CN'));
};
