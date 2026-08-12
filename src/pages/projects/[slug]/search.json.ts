import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { buildProjectSearchIndex } from '../../../lib/projectSearchIndex';

const projectReference = (entry: any, projectId: string) => entry.data.project?.id === projectId;

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return Promise.all(projects.map(async (project) => {
    const [tracks, events, threads, people] = await Promise.all([
      getCollection('projectTracks', (entry) => projectReference(entry, project.id)),
      getCollection('projectEvents', (entry) => projectReference(entry, project.id)),
      getCollection('projectThreads', (entry) => projectReference(entry, project.id)),
      getCollection('projectPeople', (entry) => projectReference(entry, project.id)),
    ]);
    return {
      params: { slug: project.data.slug },
      props: {
        projectId: project.id,
        projectSlug: project.data.slug,
        tracks,
        events,
        threads,
        people,
      },
    };
  }));
}

export const GET: APIRoute = ({ props }) => {
  const searchProps = props as {
    projectSlug: string;
    tracks: any[];
    events: any[];
    threads: any[];
    people: any[];
  };
  const items = buildProjectSearchIndex(searchProps);
  return new Response(JSON.stringify({
    schemaVersion: 1,
    project: searchProps.projectSlug,
    items,
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
