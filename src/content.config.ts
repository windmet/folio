import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

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

export const collections = { posts, timeline };
