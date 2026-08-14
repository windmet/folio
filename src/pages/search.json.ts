import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { buildGlobalSearchIndex, GLOBAL_SEARCH_LOCAL_ONLY, GLOBAL_SEARCH_SCOPE } from '../lib/globalSearch';

export const GET: APIRoute = async () => {
  const [projects, events, people, personContexts, indexPersonContexts, indexes, posts] = await Promise.all([
    getCollection('projects'),
    getCollection('projectEvents'),
    getCollection('people'),
    getCollection('projectPeople'),
    getCollection('indexPeople'),
    getCollection('indexes'),
    getCollection('posts'),
  ]);
  const items = buildGlobalSearchIndex({ projects, events, people, personContexts, indexPersonContexts, indexes, posts });
  return new Response(JSON.stringify({
    schemaVersion: 1,
    scope: GLOBAL_SEARCH_SCOPE,
    localOnly: GLOBAL_SEARCH_LOCAL_ONLY,
    items,
  }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
