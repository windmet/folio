import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projectEntryId = ({ entry, folder }: { entry: string; folder: string }) => {
  const normalized = entry.replaceAll('\\', '/');
  const [projectId] = normalized.split('/');
  const fileName = normalized.split('/').at(-1)?.replace(/\.(json|md)$/, '');
  return folder === 'project' ? projectId : `${projectId}/${fileName}`;
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

const timeline = defineCollection({
  loader: file('src/content/timeline/timeline.json'),
  schema: z.object({
    date: z.string(),
    type: z.enum(['event', 'tweet', 'video', 'note']),
    title: z.string().optional(),
    content: z.string(),
    jp: z.string().optional(),
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '*/project.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'project' }),
  }),
  schema: z.object({
    schemaVersion: z.literal(1),
    sourceSetId: z.string(),
    editorialRevision: z.string(),
    slug: z.string(),
    title: z.string(),
    eyebrow: z.string(),
    mark: z.string().max(4).optional(),
    status: z.enum(['draft', 'published']),
    defaultTrack: reference('projectTracks'),
    defaultView: z.enum(['overview', 'timeline', 'storylines', 'people', 'transcript']),
    summary: z.string(),
    featuredThreads: z.array(reference('projectThreads')),
  }),
});

const projectTracks = defineCollection({
  loader: glob({
    pattern: '*/tracks/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'tracks' }),
  }),
  schema: z.object({
    project: reference('projects'),
    kind: z.enum(['video', 'audio']),
    label: z.string(),
    shortLabel: z.string(),
    durationMs: z.number().int().positive(),
    clock: z.literal('native'),
    transcriptPolicy: z.enum(['private', 'excerpted', 'public']),
    playback: z.discriminatedUnion('provider', [
      z.object({ provider: z.literal('youtube'), videoId: z.string() }),
      z.object({ provider: z.literal('external'), url: z.string().url() }),
      z.object({ provider: z.literal('unavailable') }),
    ]),
    sourcePublishedAt: z.string().datetime().optional(),
    fallbackUrl: z.string().url().optional(),
  }),
});

const projectActs = defineCollection({
  loader: glob({
    pattern: '*/acts/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'acts' }),
  }),
  schema: z.object({
    project: reference('projects'),
    track: reference('projectTracks'),
    order: z.number().int().positive(),
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    editorialStatus: z.enum(['draft', 'confirmed']),
    title: z.string(),
    summary: z.string(),
  }),
});

const projectEvents = defineCollection({
  loader: glob({
    pattern: '*/events/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'events' }),
  }),
  schema: z.object({
    project: reference('projects'),
    track: reference('projectTracks'),
    act: reference('projectActs').optional(),
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    timingStatus: z.enum(['exact', 'approximate']),
    title: z.string(),
    summary: z.string(),
    people: z.array(reference('projectPeople')),
    tags: z.array(z.string()),
    publicationStatus: z.enum(['verified', 'qualified', 'withheld']),
    qualification: z.string().optional(),
    readerNote: z.string().optional(),
    narrativeMode: z.enum(['threaded', 'timeline-only']).default('threaded'),
    laneAnnotations: z.array(z.object({
      lane: z.string(),
      label: z.string(),
    })).default([]),
  }),
});

const projectThreads = defineCollection({
  loader: glob({
    pattern: '*/threads/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'threads' }),
  }),
  schema: z.object({
    project: reference('projects'),
    title: z.string(),
    category: z.enum(['running-gag', 'perfect-callback', 'cross-platform', 'making-of']),
    deck: z.string(),
    nodes: z.array(z.object({
      event: reference('projectEvents'),
      role: z.enum(['setup', 'development', 'payoff']),
      transition: z.string().optional(),
    })).min(2),
    featured: z.boolean().default(false),
    relatedSources: z.array(z.object({
      source: reference('projectSources'),
      afterEvent: reference('projectEvents'),
      context: z.string(),
    })).default([]),
  }),
});

const projectPeople = defineCollection({
  loader: glob({
    pattern: '*/people/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'people' }),
  }),
  schema: z.object({
    project: reference('projects'),
    displayName: z.string(),
    reading: z.string().optional(),
    aliases: z.array(z.string()),
    projectContext: z.string().optional(),
    participation: z.array(z.object({
      kind: z.enum([
        'ore-shiri-cast',
        'production',
        'ensemble',
        'birthday-live',
        'space-guest',
        'remote-call',
        'space-account',
        'submitted-comment',
      ]),
      character: z.string().optional(),
      sessions: z.array(z.enum(['day', 'night'])).optional(),
      credit: z.string().optional(),
    })).default([]),
    links: z.array(z.object({
      kind: z.enum(['social', 'agency', 'official']),
      platform: z.enum(['x', 'instagram', 'youtube']).optional(),
      label: z.string(),
      url: z.string().url(),
    })).default([]),
  }),
});

const projectSources = defineCollection({
  loader: glob({
    pattern: '*/sources/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => projectEntryId({ entry, folder: 'sources' }),
  }),
  schema: z.object({
    project: reference('projects'),
    kind: z.enum(['media', 'transcript', 'chat', 'editorial', 'social']),
    platform: z.enum(['x', 'web']).optional(),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T[^\s]+)?$/).optional(),
    author: z.object({
      name: z.string(),
      handle: z.string().optional(),
    }).optional(),
    label: z.string(),
    publicUrl: z.string().url().optional(),
    note: z.string(),
  }),
});

export const collections = {
  posts,
  timeline,
  projects,
  projectTracks,
  projectActs,
  projectEvents,
  projectThreads,
  projectPeople,
  projectSources,
};
