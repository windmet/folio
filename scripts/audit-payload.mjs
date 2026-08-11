import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brotliCompressSync,
  constants as zlibConstants,
  gzipSync,
} from 'node:zlib';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
// Keep this in sync with validate-publication.mjs. The 2026-08-11
// reviewed-final pass replaces 123 public fields with human-edited copy.
const rawLimitBytes = 357 * 1024;

const fail = (message) => {
  console.error(`Payload audit failed: ${message}`);
  process.exit(1);
};

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail('usage: npm run audit:payload -- <project-slug>');
}

const outputFile = path.join(repoRoot, 'dist', 'projects', slug, 'index.html');
const sourceRoots = [
  path.join(repoRoot, 'src'),
  path.join(repoRoot, 'astro.config.mjs'),
  path.join(repoRoot, 'package.json'),
  path.join(repoRoot, 'tailwind.config.mjs'),
  path.join(repoRoot, 'postcss.config.mjs'),
];

const latestMtime = async (target) => {
  const info = await stat(target);
  if (!info.isDirectory()) return info.mtimeMs;

  const entries = await readdir(target, { withFileTypes: true });
  let latest = info.mtimeMs;
  for (const entry of entries) {
    latest = Math.max(latest, await latestMtime(path.join(target, entry.name)));
  }
  return latest;
};

let outputInfo;
try {
  outputInfo = await stat(outputFile);
} catch (error) {
  fail(`build output is missing: ${outputFile}. Run npm run build first. (${error.message})`);
}

let sourceLatestMtime = 0;
for (const sourceRoot of sourceRoots) {
  try {
    sourceLatestMtime = Math.max(sourceLatestMtime, await latestMtime(sourceRoot));
  } catch (error) {
    fail(`source input cannot be inspected: ${sourceRoot}. Run npm run build first or repair the input. (${error.message})`);
  }
}

if (sourceLatestMtime > outputInfo.mtimeMs) {
  fail(
    `build output is stale: ${outputFile} is older than source inputs. `
      + 'Run npm run build first; the audit never reads a stale dist silently.',
  );
}

const html = await readFile(outputFile, 'utf8');
const htmlBytes = Buffer.from(html, 'utf8');

const count = (pattern) => (html.match(pattern) || []).length;
const bytes = (value) => Buffer.byteLength(value, 'utf8');

const sliceBetween = (startMarker, endMarker, includeEnd = true) => {
  const start = html.indexOf(startMarker);
  if (start < 0) fail(`required payload marker is missing: ${startMarker}`);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (end < 0) fail(`payload section end marker is missing: ${endMarker}`);
  return html.slice(start, includeEnd ? end + endMarker.length : end);
};

const timelineHtml = sliceBetween(
  '<section class="project-view timeline-view"',
  '<section class="project-view storylines-view"',
  false,
);
const sourceIndexHtml = sliceBetween('<section class="source-event-index"', '</section>');
const searchHtml = sliceBetween('<section class="project-search"', '</section>');
const threadHtml = sliceBetween(
  '<div class="archive-overlay" data-thread-overlay',
  '<div class="archive-overlay" data-person-overlay',
  false,
);
const personHtml = sliceBetween(
  '<div class="archive-overlay" data-person-overlay',
  '<script type="application/json" data-archive-controller-data',
  false,
);

const controllerMatch = html.match(
  /<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/,
);
if (!controllerMatch) fail('archive controller JSON marker is missing');
let controller;
try {
  controller = JSON.parse(controllerMatch[1]);
} catch (error) {
  fail(`archive controller JSON is invalid: ${error.message}`);
}

const gzipBytes = gzipSync(htmlBytes, { level: 9 }).byteLength;
const brotliBytes = brotliCompressSync(htmlBytes, {
  params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
}).byteLength;

const report = {
  schema_version: 1,
  project: slug,
  output_file: path.relative(repoRoot, outputFile).split(path.sep).join('/'),
  freshness: {
    output_mtime: new Date(outputInfo.mtimeMs).toISOString(),
    latest_source_mtime: new Date(sourceLatestMtime).toISOString(),
    stale: false,
  },
  compression: {
    raw_bytes: htmlBytes.byteLength,
    gzip_level_9_bytes: gzipBytes,
    brotli_quality_11_bytes: brotliBytes,
  },
  gate: {
    raw_limit_bytes: rawLimitBytes,
    raw_remaining_bytes: rawLimitBytes - htmlBytes.byteLength,
    raw_within_limit: htmlBytes.byteLength <= rawLimitBytes,
  },
  projections: {
    timeline: {
      event_cards: count(/data-timeline-event="/g),
      bytes: bytes(timelineHtml),
    },
    source_event_index: {
      buttons: count(/data-source-event="/g),
      track_lists: count(/data-source-event-list=/g),
      bytes: bytes(sourceIndexHtml),
    },
    search: {
      items: count(/\bdata-search-item(?:[=>\s])/g),
      bytes: bytes(searchHtml),
    },
    threads: {
      details: count(/data-thread-detail="/g),
      node_buttons: count(/data-thread-event-id="/g),
      bytes: bytes(threadHtml),
    },
    people: {
      details: count(/data-person-detail="/g),
      event_rows: count(/data-person-event-id="/g),
      bytes: bytes(personHtml),
    },
    controller_json: {
      event_records: Object.keys(controller.events || {}).length,
      bytes: bytes(controllerMatch[1]),
    },
  },
};

console.log(JSON.stringify(report, null, 2));
