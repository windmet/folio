import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://megazine-blog.pages.dev',
  integrations: [mdx()],
});
