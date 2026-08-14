import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`site metadata verification failed: ${message}`);
};

for (const layout of ['BaseLayout.astro', 'HomeLayout.astro', 'IndexLayout.astro', 'PeopleLayout.astro', 'ProjectLayout.astro']) {
  const source = read(`src/layouts/${layout}`);
  assert(source.includes("SiteHead from '../components/SiteHead.astro'") || source.includes("SiteHead from '../components/SiteHead.astro';"), `${layout} must use SiteHead`);
  assert(!source.includes('Magazine'), `${layout} still exposes the old reader-facing brand`);
}

const siteHead = read('src/components/SiteHead.astro');
for (const contract of ['canonical', 'og:site_name', 'og:title', 'twitter:card', 'favicon.svg', 'resolveRobots']) {
  assert(siteHead.includes(contract), `SiteHead is missing ${contract}`);
}

const siteMetadata = read('src/lib/siteMetadata.ts');
assert(siteMetadata.includes("'/indexes/'"), 'future public-route allowlist must include the first-class Index routes');
assert(!siteMetadata.includes("'/timeline/'"), 'retired global Timeline must not remain in the public-route allowlist');
assert(siteMetadata.includes('PUBLIC_LAUNCH_ENABLED = false'), 'public launch must remain explicitly disabled before production QA');

const about = read('src/pages/about/index.astro');
for (const section of ['Subject', 'Source', 'Editorial', 'Governance', 'Corrections', 'Rights / Contact']) {
  assert(about.includes(section), `/about/ is missing ${section}`);
}

const favicon = read('public/favicon.svg');
assert(favicon.includes('<svg') && favicon.includes('前情帖'), 'favicon.svg must be a named site mark');

const dist = path.join(root, 'dist');
assert(fs.existsSync(dist), 'dist/ does not exist; run npm run build first');
const routes = [
  ['/', 'index.html'],
  ['/about/', 'about/index.html'],
  ['/indexes/', 'indexes/index.html'],
  ['/indexes/ore-shiri/', 'indexes/ore-shiri/index.html'],
  ['/people/', 'people/index.html'],
  ['/projects/komatsu36/', 'projects/komatsu36/index.html'],
];

assert(!fs.existsSync(path.join(dist, 'timeline/index.html')), 'retired global Timeline route must not be built');

for (const [route, relative] of routes) {
  const html = read(path.join('dist', relative));
  assert(html.includes('<meta name="robots" content="noindex, nofollow">'), `${route} must remain launch-safe noindex`);
  assert(html.includes('<link rel="canonical" href="https://folio-ca3.pages.dev/'), `${route} must have a production-origin canonical`);
  assert(html.includes('<meta property="og:site_name" content="前情帖">'), `${route} must expose the publication name to OG`);
  assert(html.includes('<meta property="og:title"'), `${route} must expose an OG title`);
  assert(html.includes('<link rel="icon" href="/favicon.svg"'), `${route} must expose the favicon`);
}

const home = read(path.join('dist', 'index.html'));
assert(home.includes('<title>前情帖</title>'), 'homepage title must be exactly 前情帖');
assert(home.includes('href="/about/"'), 'homepage must expose the About entry');
console.log(`site metadata verified: ${routes.length} routes, launch-safe robots, canonical/OG/favicon contract`);
