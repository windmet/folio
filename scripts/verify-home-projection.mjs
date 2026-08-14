import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const root = path.resolve('.');
const projectsRoot = path.join(root, 'src/content/projects');
const postsRoot = path.join(root, 'src/content/posts');
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const readPost = async (file) => {
  const source = await readFile(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  return frontmatter ? YAML.parse(frontmatter) : null;
};

const indexSource = await readFile(path.join(root, 'src/pages/index.astro'), 'utf8');
const homeCss = await readFile(path.join(root, 'src/styles/home.css'), 'utf8');
const componentSources = await Promise.all((await readdir(path.join(root, 'src/components/home')))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => readFile(path.join(root, 'src/components/home', name), 'utf8')));
const homepageSource = [indexSource, ...componentSources].join('\n');
assert(!indexSource.includes("id.includes('interview')"), 'homepage still classifies posts by filename');
assert(!indexSource.includes("id.includes('radio')"), 'homepage still infers Radio from filename');
assert(!indexSource.includes('tracks === 1'), 'homepage still infers publication kind from track count');
assert(indexSource.includes('buildHomeProjection'), 'homepage must consume the Home Projection helper');
for (const scene of ['cover', 'archives', 'people', 'indexes']) {
  assert(indexSource.includes(`id="${scene}"`), `homepage chapter scene is missing: ${scene}`);
}
assert(indexSource.includes('class="home-tail"'), 'homepage must keep Recent and Legacy in a normal-flow tail');
assert(indexSource.indexOf('id="indexes"') < indexSource.indexOf('class="home-tail"'), 'homepage tail must follow all snap scenes');
assert(homeCss.includes('position: sticky'), 'homepage header must remain sticky');
assert(homeCss.includes('scroll-snap-type: y proximity'), 'desktop chapter flow must use proximity scroll snap');
assert(homeCss.includes('.home-root { scroll-snap-type: none; }'), 'mobile chapter flow must disable scroll snap');
assert(homeCss.includes('@media (prefers-reduced-motion: reduce)'), 'homepage must honor reduced-motion preferences');
assert(homeCss.includes("[data-tone='broadcast-blue']"), 'homepage must consume the controlled broadcast-blue tone');
assert(homeCss.includes("[data-tone='event-rose']"), 'homepage must expose the controlled special rose tone');
assert(homeCss.includes('border-left-color: var(--home-blue)'), 'broadcast color must be expressed as ink, not a filled card surface');
assert(homeCss.includes('border-top: 2px solid var(--home-sage)'), 'Index color must be expressed as a restrained top rule');
assert(homeCss.includes('.home-scene--people { min-height: calc(84svh'), 'People scene must use a flexible chapter height');
assert(homeCss.includes('grid-template-columns: repeat(2'), 'homepage People teaser must use a two-column ledger');
assert(!homeCss.includes('background: #eaf1f4'), 'broadcast cards must not use a blue filled surface');
assert(!homeCss.includes('background: #eff3eb'), 'Index scene must not use a green filled surface');
assert(!homepageSource.includes("addEventListener('wheel'"), 'homepage must not intercept wheel events');
assert(!homepageSource.includes('preventDefault()'), 'homepage must not prevent native scroll behavior');
for (const requiredClass of ['home-masthead', 'home-featured', 'home-people', 'home-recent', 'home-indexes', 'home-legacy']) {
  assert(homepageSource.includes(requiredClass), `homepage component boundary is missing: ${requiredClass}`);
}

const projectIds = await readdir(projectsRoot);
const projects = await Promise.all(projectIds.map(async (id) => readJson(path.join(projectsRoot, id, 'project.json'))));
for (const project of projects) {
  const publication = project.publication;
  assert(publication && ['special', 'episode'].includes(publication.kind), `${project.slug}: missing publication kind`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(publication?.date || ''), `${project.slug}: publication date must be YYYY-MM-DD`);
  assert(/^[a-z0-9][a-z0-9-]*$/.test(publication?.seriesKey || ''), `${project.slug}: invalid publication seriesKey`);
  assert(typeof publication?.homeDeck === 'string' && publication.homeDeck.length > 0, `${project.slug}: missing homeDeck`);
}

const postFiles = (await readdir(postsRoot).catch((error) => {
  if (error?.code === 'ENOENT') return [];
  throw error;
})).filter((name) => name.endsWith('.md') || name.endsWith('.mdx'));
const posts = await Promise.all(postFiles.map(async (name) => ({ name, data: await readPost(path.join(postsRoot, name)) })));
const expectedSections = new Map();
assert(posts.length === expectedSections.size, `expected ${expectedSections.size} Posts, found ${posts.length}`);
for (const post of posts) {
  assert(expectedSections.get(post.name) === post.data?.section, `${post.name}: explicit section metadata mismatch`);
}

const homeHtml = await readFile(path.join(root, 'dist/index.html'), 'utf8');
for (const project of projects.filter((project) => project.status === 'published')) {
  assert(homeHtml.includes(`href="/projects/${project.slug}/"`), `${project.slug}: published Project missing from built homepage`);
  assert(homeHtml.includes(project.publication.homeDeck), `${project.slug}: homepage must render publication.homeDeck`);
}
assert((homeHtml.match(/class="featured-card(?: featured-card--special)?"/g) || []).length === projects.filter((project) => project.status === 'published').length,
  'built homepage Project card count does not match published Projects');
const projectOrder = [...homeHtml.matchAll(/href="\/projects\/([^/]+)\/"/g)].map((match) => match[1]);
assert(projectOrder[0] === 'komatsu36', 'featured special Project must lead the homepage projection');
assert((homeHtml.match(/class="legacy-card"[^>]*data-category="(interview|archive|radio|note)"/g) || []).length === 0,
  'built homepage must not expose empty legacy collections');
assert(!homeHtml.includes('class="home-section home-legacy"'), 'built homepage must omit the empty Legacy Post section');
assert(!homeHtml.includes('小红书排版自动化'), 'personal XHS tooling must not remain in the public homepage');
assert(homeHtml.includes('data-feed-kind="project"') && !homeHtml.includes('data-feed-kind="post"'),
  'built homepage recent feed must omit Post when the legacy collection is empty');
assert(homeHtml.includes('data-feed-kind="index"'), 'built homepage recent feed must include Index entries');
assert((homeHtml.match(/data-home-scene="(cover|archives|people|indexes)"/g) || []).length === 4,
  'built homepage must contain exactly four chapter scenes');
assert((homeHtml.match(/data-tone="broadcast-blue"/g) || []).length === 2,
  'built homepage must render two broadcast-blue archive cards');
assert(homeHtml.includes('近期条目') && !homeHtml.includes('最近更新'),
  'date-based tail feed must use the qualified 近期条目 label');
assert(homeHtml.includes('data-person-teaser="ito-tomohiro"'), 'built homepage People teaser must expose a high-relevance fixture');
assert(homeHtml.includes('电话连线 · 预投稿 · 被提及'), 'homepage People teaser must use stable semantic presence order');
assert(!homeHtml.includes('class="index-title"'), 'built homepage still uses the old Magazine masthead');

if (errors.length) {
  console.error('Home Projection verification failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Home Projection verified (${projects.length} Projects, ${posts.length} Posts, explicit publication metadata and homepage boundaries stable).`);
