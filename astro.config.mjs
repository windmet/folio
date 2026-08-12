import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://folio-ca3.pages.dev',
  integrations: [mdx()],
});
