import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`global search verification failed: ${message}`);
};

const source = read('src/lib/globalSearch.ts');
assert(source.includes("GlobalSearchKind = 'project' | 'event' | 'person' | 'post'"), 'global kinds must remain publication-scoped');
assert(source.includes("GLOBAL_SEARCH_LOCAL_ONLY = ['work', 'context']"), 'Work/Context boundary must remain explicit');
assert(source.includes('publishedProjects'), 'search must filter to published Projects');
assert(source.includes("publicationStatus !== 'withheld'"), 'search must exclude withheld Events');

const page = read('src/pages/search/index.astro');
for (const contract of ['global-search-input', '/search.json', 'Project、Event、Person', 'Work / Context']) {
  assert(page.includes(contract), `/search/ is missing ${contract}`);
}

const payload = JSON.parse(read('dist/search.json'));
assert(payload.schemaVersion === 1, 'search payload schema must be version 1');
assert(JSON.stringify(payload.scope) === JSON.stringify(['project', 'event', 'person', 'post']), 'search payload scope changed');
assert(JSON.stringify(payload.localOnly) === JSON.stringify(['work', 'context']), 'local-only boundary changed');
assert(Array.isArray(payload.items) && payload.items.length > 0, 'search payload must contain items');
for (const kind of payload.scope) {
  assert(payload.items.some((item) => item.kind === kind), `search payload has no ${kind} items`);
}
assert(payload.items.every((item) => payload.scope.includes(item.kind)), 'search payload contains an unapproved kind');
assert(payload.items.every((item) => typeof item.href === 'string' && item.href.startsWith('/')), 'search items must have internal hrefs');
assert(payload.items.some((item) => item.kind === 'event' && item.href.includes('view=timeline&event=')), 'Event results must deep-link to Project timeline');

const searchHtml = read('dist/search/index.html');
for (const contract of ['<title>全局搜索 — 前情帖</title>', 'noindex, nofollow', 'global-search-input']) {
  assert(searchHtml.includes(contract), `/search/ built output is missing ${contract}`);
}
for (const route of ['dist/index.html', 'dist/people/index.html', 'dist/projects/komatsu36/index.html']) {
  assert(read(route).includes('href="/search/"'), `${route} must expose the global search entry`);
}

console.log(`global search verified: ${payload.items.length} publication items, 4 kinds, Work/Context kept Project-local`);
