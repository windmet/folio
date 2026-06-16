import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://megazine-blog.pages.dev',
  integrations: [mdx()],
  adapter: cloudflare(),
});