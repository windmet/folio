import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(`source contract verification failed: ${message}`); };
const sourceRoot = path.join(root, 'src/content/sources');
const sources = fs.readdirSync(sourceRoot).filter((name) => name.endsWith('.json')).map((name) => JSON.parse(read(`src/content/sources/${name}`)));

assert(sources.length === 10, `expected 10 migrated SourcePost fixtures, found ${sources.length}`);
for (const source of sources) {
  assert(source.kind === 'external-post', 'fixture kind must be external-post');
  assert(['public', 'public-external', 'private-reference', 'paid-reference'].includes(source.accessClass), 'invalid accessClass');
  assert(['metadata-only', 'short-excerpt', 'summary-link'].includes(source.publicationMode), 'invalid publicationMode');
  assert(['verified', 'unresolved'].includes(source.sourceStatus), 'invalid sourceStatus');
  assert(source.sourceStatus !== 'verified' || source.publicUrl, 'verified source must have publicUrl');
  assert(!source.publicUrl || /^https:\/\//.test(source.publicUrl), 'publicUrl must be absolute HTTPS');
  assert(!['private-reference', 'paid-reference'].includes(source.accessClass) || source.publicationMode === 'metadata-only', 'private/paid source must be metadata-only');
}

const record = JSON.parse(read('src/content/indexes/2016-x-family-record.json'));
assert(record.kind === 'public-record' && record.entries.length === sources.length, 'public record must consume every migrated source');
assert(record.entries.every((entry) => entry.source && entry.links.length === 0), 'social fixtures must use Source refs instead of duplicate or guessed Index links');
const verified = sources.filter((source) => source.sourceStatus === 'verified');
assert(verified.length === 1 && verified[0].publicUrl === 'https://x.com/juntaterashima3/status/739445176276373505', 'provided root Post URL must remain the only verified fixture');
for (const removed of [
  'src/content/posts/ancient-tweets.mdx',
  'src/components/Tweet.astro',
  'src/components/Reply.astro',
  'src/components/QuoteTweet.astro',
  'public/uploads/炸鸡.jpg',
]) assert(!fs.existsSync(path.join(root, removed)), `${removed} must be retired from current tree`);

const component = read('src/components/sources/SourcePost.astro');
assert(component.includes('不提供推定链接'), 'SourcePost must explain unresolved URLs');
assert(!component.includes('widgets.js') && !component.includes('platform.twitter'), 'SourcePost must not load X widgets');
const html = read('dist/indexes/2016-x-family-record/index.html');
assert((html.match(/class="source-post"/g) || []).length === sources.length, 'built public record must render every SourcePost');
assert((html.match(/data-source-status="unresolved"/g) || []).length === sources.length - verified.length, 'unresolved status must remain visible in build');
assert(html.includes('href="https://x.com/juntaterashima3/status/739445176276373505"'), 'verified root Post link missing from build');
assert(!html.includes('/uploads/炸鸡.jpg') && !html.includes('platform.twitter.com'), 'build must not mirror the social image or load X widgets');
console.log(`Source contract verified (${sources.length} external posts, ${verified.length} verified URL, unresolved URLs explicit, no platform widget or mirrored image).`);
