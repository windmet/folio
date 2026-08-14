type CollectionEntry = {
  id: string;
  data: any;
};

export const HOME_ARTICLE_SECTIONS = ['interview', 'archaeology', 'radio', 'note'] as const;
export type HomeArticleSection = typeof HOME_ARTICLE_SECTIONS[number];

export type HomeProjection = {
  posts: CollectionEntry[];
  projects: CollectionEntry[];
  projectStats: Map<string, { tracks: number; events: number; threads: number }>;
  articleCollections: Map<HomeArticleSection, CollectionEntry[]>;
};

const byPublicationDate = (left: CollectionEntry, right: CollectionEntry) =>
  right.data.publication.date.localeCompare(left.data.publication.date, 'en')
  || left.data.title.localeCompare(right.data.title, 'zh-CN');

const publicationKindOrder = (kind: 'special' | 'episode') => kind === 'special' ? 0 : 1;

export const buildHomeProjection = ({
  posts,
  projects,
  tracks,
  events,
  threads,
}: {
  posts: CollectionEntry[];
  projects: CollectionEntry[];
  tracks: CollectionEntry[];
  events: CollectionEntry[];
  threads: CollectionEntry[];
}): HomeProjection => {
  const sortedPosts = [...posts].sort((left, right) => right.data.date.getTime() - left.data.date.getTime());
  const publishedProjects = projects
    .filter((project) => project.data.status === 'published')
    .sort((left, right) => Number(right.data.publication.featured) - Number(left.data.publication.featured)
      || publicationKindOrder(left.data.publication.kind) - publicationKindOrder(right.data.publication.kind)
      || byPublicationDate(left, right));
  const projectStats = new Map(publishedProjects.map((project) => [project.id, {
    tracks: tracks.filter((track) => track.data.project?.id === project.id || track.data.project === project.id).length,
    events: events.filter((event) => (event.data.project?.id === project.id || event.data.project === project.id)
      && event.data.publicationStatus !== 'withheld').length,
    threads: threads.filter((thread) => thread.data.project?.id === project.id || thread.data.project === project.id).length,
  }]));
  const articleCollections = new Map<HomeArticleSection, CollectionEntry[]>(
    HOME_ARTICLE_SECTIONS.map((section) => [section, sortedPosts.filter((post) => post.data.section === section)]),
  );

  return {
    posts: sortedPosts,
    projects: publishedProjects,
    projectStats,
    articleCollections,
  };
};
