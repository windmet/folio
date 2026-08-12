import { deriveProjectPresentation } from '../src/lib/projectPresentation.mjs';

const entry = (id, data) => ({ id, data });
const komatsu = deriveProjectPresentation({
  project: {
    views: ['overview', 'timeline', 'storylines', 'people', 'transcript'],
    defaultTrack: { id: 'komatsu36/yt-main' },
  },
  tracks: [
    entry('komatsu36/space-2', { order: 3, durationMs: 30 }),
    entry('komatsu36/yt-main', { order: 1, durationMs: 17846000 }),
    entry('komatsu36/space-1', { order: 2, durationMs: 20 }),
  ],
  acts: Array.from({ length: 8 }, (_, index) => entry(`komatsu36/act-${index + 1}`, { track: { id: 'komatsu36/yt-main' } })),
  events: [entry('komatsu36/event', { publicationStatus: 'verified' })],
  threads: Array.from({ length: 16 }, (_, index) => entry(`komatsu36/thread-${index}`, {})),
  people: Array.from({ length: 18 }, (_, index) => entry(`komatsu36/person-${index}`, {})),
});

const broadcast = deriveProjectPresentation({
  project: {
    views: ['overview', 'sections', 'timeline'],
    defaultTrack: { id: 'broadcast/yt-main' },
  },
  tracks: [entry('broadcast/yt-main', { order: 1, durationMs: 7926041 })],
  acts: Array.from({ length: 6 }, (_, index) => entry(`broadcast/act-${index + 1}`, { track: { id: 'broadcast/yt-main' } })),
  events: Array.from({ length: 12 }, (_, index) => entry(`broadcast/event-${index + 1}`, { publicationStatus: 'verified' })),
  threads: [],
  people: [],
});

const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(komatsu.views.length === 5, 'Komatsu36 must retain five declared views');
assert(komatsu.hasMultipleTracks && komatsu.showMediaSources && komatsu.showTimelineScope && komatsu.showPlayerSourceTabs,
  'Komatsu36 must retain all multi-source presentation capabilities');
assert(komatsu.showStorylines && komatsu.showPeople && komatsu.showTranscript,
  'Komatsu36 must retain storyline, people, and transcript views');
assert(komatsu.orderedTracks.map((track) => track.data.order).join(',') === '1,2,3',
  'tracks must be ordered by required Track.order');

assert(broadcast.views.join(',') === 'overview,sections,timeline', 'broadcast must expose only its three declared views');
assert(!broadcast.hasMultipleTracks && !broadcast.showMediaSources && !broadcast.showTimelineScope && !broadcast.showPlayerSourceTabs,
  'single-track presentation must not instantiate source selectors');
assert(broadcast.showSections && !broadcast.showStorylines && !broadcast.showPeople && !broadcast.showTranscript,
  'broadcast optional views must derive from capabilities');
assert(broadcast.stats[1][0] === '6' && broadcast.stats[2][0] === '12',
  'single-track stats must derive Section and public Event counts');

if (failures.length) {
  console.error('Project presentation verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Project presentation verification passed (Komatsu36 + single-track synthetic fixture).');
