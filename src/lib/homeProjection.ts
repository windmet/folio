import { buildGlobalPeopleProjection, type GlobalPersonProjection } from './globalPeople';

type CollectionEntry = {
  id: string;
  data: any;
};

export const HOME_ARTICLE_SECTIONS = ['interview', 'archaeology', 'radio', 'note'] as const;
export type HomeArticleSection = typeof HOME_ARTICLE_SECTIONS[number];

export type HomeProjection = {
  posts: CollectionEntry[];
  projects: CollectionEntry[];
  indexes: CollectionEntry[];
  projectStats: Map<string, { tracks: number; events: number; threads: number }>;
  articleCollections: Map<HomeArticleSection, CollectionEntry[]>;
  people: GlobalPersonProjection[];
  recentFeed: HomePublication[];
};

export type HomePublication = {
  id: string;
  kind: 'project' | 'index' | 'post';
  title: string;
  description: string;
  href: string;
  date: string;
  sortDate: number;
  publicationKind?: 'special' | 'episode';
  section?: HomeArticleSection;
};

const byPublicationDate = (left: CollectionEntry, right: CollectionEntry) =>
  right.data.publication.date.localeCompare(left.data.publication.date, 'en')
  || left.data.title.localeCompare(right.data.title, 'zh-CN');

const publicationKindOrder = (kind: 'special' | 'episode') => kind === 'special' ? 0 : 1;

export const buildHomeProjection = ({
  posts,
  projects,
  indexes,
  tracks,
  events,
  threads,
  identities,
  personContexts,
}: {
  posts: CollectionEntry[];
  projects: CollectionEntry[];
  indexes: CollectionEntry[];
  tracks: CollectionEntry[];
  events: CollectionEntry[];
  threads: CollectionEntry[];
  identities: CollectionEntry[];
  personContexts: CollectionEntry[];
}): HomeProjection => {
  const sortedPosts = [...posts].sort((left, right) => right.data.date.getTime() - left.data.date.getTime());
  const publishedProjects = projects
    .filter((project) => project.data.status === 'published')
    .sort((left, right) => Number(right.data.publication.featured) - Number(left.data.publication.featured)
      || publicationKindOrder(left.data.publication.kind) - publicationKindOrder(right.data.publication.kind)
      || byPublicationDate(left, right));
  const publishedIndexes = indexes
    .filter((entry) => entry.data.status === 'published')
    .sort((left, right) => Number(right.data.featured) - Number(left.data.featured)
      || left.data.title.localeCompare(right.data.title, 'ja'));
  const projectStats = new Map(publishedProjects.map((project) => [project.id, {
    tracks: tracks.filter((track) => track.data.project?.id === project.id || track.data.project === project.id).length,
    events: events.filter((event) => (event.data.project?.id === project.id || event.data.project === project.id)
      && event.data.publicationStatus !== 'withheld').length,
    threads: threads.filter((thread) => thread.data.project?.id === project.id || thread.data.project === project.id).length,
  }]));
  const articleCollections = new Map<HomeArticleSection, CollectionEntry[]>(
    HOME_ARTICLE_SECTIONS.map((section) => [section, sortedPosts.filter((post) => post.data.section === section)]),
  );
  const people = buildGlobalPeopleProjection({
    identities,
    projects: publishedProjects,
    contexts: personContexts,
    events,
    indexes: publishedIndexes,
  });
  const recentFeed = [
    ...publishedProjects.map((project) => ({
      id: project.id,
      kind: 'project' as const,
      title: project.data.title,
      description: project.data.publication.homeDeck,
      href: `/projects/${project.data.slug}/`,
      date: project.data.publication.date,
      sortDate: Date.parse(project.data.publication.date),
      publicationKind: project.data.publication.kind,
    })),
    ...publishedIndexes.map((entry) => {
      const date = [...entry.data.entries].sort((left: any, right: any) => right.date.localeCompare(left.date, 'en'))[0]?.date || '';
      return {
        id: entry.id,
        kind: 'index' as const,
        title: entry.data.title,
        description: entry.data.homeDeck,
        href: `/indexes/${entry.data.slug}/`,
        date,
        sortDate: Date.parse(date),
      };
    }),
    ...sortedPosts.map((post) => ({
      id: post.id,
      kind: 'post' as const,
      title: post.data.title,
      description: post.data.description || '',
      href: `/posts/${post.id}/`,
      date: post.data.date.toISOString().slice(0, 10),
      sortDate: post.data.date.getTime(),
      section: post.data.section,
    })),
  ].sort((left, right) => right.sortDate - left.sortDate || left.title.localeCompare(right.title, 'zh-CN'));

  return {
    posts: sortedPosts,
    projects: publishedProjects,
    indexes: publishedIndexes,
    projectStats,
    articleCollections,
    people,
    recentFeed,
  };
};
