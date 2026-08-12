const viewLabels = {
  overview: ['Overview', '快速了解'],
  sections: ['Sections', '节目环节'],
  timeline: ['Timeline', '按时间浏览'],
  storylines: ['Storylines', '精彩事件'],
  people: ['People', '人物'],
  transcript: ['Transcript', '完整资料'],
};

const formatDuration = (milliseconds) => {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const parts = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
  return parts.map((part) => String(part).padStart(2, '0')).join(':');
};

export const deriveProjectPresentation = ({ project, tracks, acts, events, threads, people }) => {
  const views = [...project.views];
  const orderedTracks = [...tracks].sort((left, right) => left.data.order - right.data.order);
  const hasMultipleTracks = orderedTracks.length > 1;
  const publicEventCount = events.filter((event) => event.data.publicationStatus !== 'withheld').length;
  const defaultTrackId = project.defaultTrack?.id || project.defaultTrack;
  const defaultTrack = orderedTracks.find((track) => track.id === defaultTrackId) || orderedTracks[0];
  const defaultTrackActs = acts.filter((act) => (act.data.track?.id || act.data.track) === defaultTrack?.id);

  return {
    views,
    viewDefinitions: views.map((id) => ({ id, labels: viewLabels[id] })),
    orderedTracks,
    hasMultipleTracks,
    showMediaSources: hasMultipleTracks,
    showTimelineScope: hasMultipleTracks,
    showPlayerSourceTabs: hasMultipleTracks,
    showOverview: views.includes('overview'),
    showSections: views.includes('sections'),
    showTimeline: views.includes('timeline'),
    showStorylines: views.includes('storylines'),
    showPeople: views.includes('people'),
    showTranscript: views.includes('transcript'),
    stats: hasMultipleTracks
      ? [
          [formatDuration(defaultTrack?.data.durationMs || 0), '主直播时长'],
          [String(orderedTracks.length), '独立媒体'],
          [String(threads.length), '故事线'],
        ]
      : [
          [formatDuration(defaultTrack?.data.durationMs || 0), '节目时长'],
          [String(defaultTrackActs.length), '环节'],
          [String(publicEventCount), '精选节点'],
        ],
  };
};
