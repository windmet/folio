import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

const projectId = process.argv[2];
const outputLabel = process.argv.find((arg) => arg.startsWith('--output-label='))?.slice('--output-label='.length) || '';
if (!projectId || projectId.startsWith('-')) {
  console.error('Usage: npm run editorial:export-copy -- <project-slug> [--output-label=<label>]');
  process.exit(1);
}
if (outputLabel && !/^[a-z0-9][a-z0-9-]*$/.test(outputLabel)) {
  throw new Error(`Invalid output label: ${outputLabel}`);
}

const projectRoot = path.resolve('src/content/projects', projectId);
if (!fs.existsSync(projectRoot)) throw new Error(`Unknown project: ${projectId}`);

const relative = (filePath) => path.relative(process.cwd(), filePath).replaceAll(path.sep, '/');
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const readThread = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid thread frontmatter: ${filePath}`);
  return { data: YAML.parse(match[1]), body: match[2].trim() };
};
const idFromFile = (filePath, extension) => path.basename(filePath, extension);
const entityId = (id) => `${projectId}/${id}`;
const hash = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const copyValue = (value) => typeof value === 'string' ? value.trim() : String(value);

const projectFile = path.join(projectRoot, 'project.json');
const project = readJson(projectFile);
const tracks = new Map();
const acts = new Map();
const events = new Map();
const threads = new Map();
const people = new Map();
const sources = new Map();

function readJsonDirectory(name, target, extension = '.json') {
  const directory = path.join(projectRoot, name);
  if (!fs.existsSync(directory)) return;
  fs.readdirSync(directory).filter((file) => file.endsWith(extension)).sort().forEach((file) => {
    const id = idFromFile(file, extension);
    target.set(id, { id, file, data: readJson(path.join(directory, file)) });
  });
}

readJsonDirectory('tracks', tracks);
readJsonDirectory('acts', acts);
readJsonDirectory('events', events);
readJsonDirectory('people', people);
readJsonDirectory('sources', sources);
const threadDirectory = path.join(projectRoot, 'threads');
if (fs.existsSync(threadDirectory)) {
  fs.readdirSync(threadDirectory).filter((file) => file.endsWith('.md')).sort().forEach((file) => {
    const id = idFromFile(file, '.md');
    threads.set(id, { id, file, ...readThread(path.join(threadDirectory, file)) });
  });
}

const entries = [];
const markdownEntries = [];
function addEntry({ scope, id, field, value, source, context }) {
  if (value === undefined || value === null || value === '') return;
  const normalizedValue = copyValue(value);
  if (!normalizedValue) return;
  const copyKey = scope === 'system/ui' ? `ui:${id}#${field}` : `${scope}:${id}#${field}`;
  const entry = {
    copyKey,
    scope,
    entityId: id,
    source,
    field,
    originalHash: hash(normalizedValue),
    value: normalizedValue,
  };
  entries.push(entry);
  markdownEntries.push({ ...entry, context });
}

const projectSource = relative(projectFile);
addEntry({ scope: 'project', id: projectId, field: 'eyebrow', value: project.eyebrow, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'title', value: project.title, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'summary', value: project.summary, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'sourceNote', value: project.sourceNote, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'playerNote', value: project.playerNote, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'searchPlaceholder', value: project.searchPlaceholder, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'overview.kicker', value: project.overview?.kicker, source: projectSource });
addEntry({ scope: 'project', id: projectId, field: 'overview.title', value: project.overview?.title, source: projectSource });
(project.overview?.paragraphs || []).forEach((value, index) => addEntry({
  scope: 'project', id: projectId, field: `overview.paragraphs[${index}]`, value, source: projectSource,
}));
(project.overview?.cards || []).forEach((card, index) => {
  addEntry({ scope: 'project', id: projectId, field: `overview.cards[${index}].label`, value: card.label, source: projectSource });
  addEntry({ scope: 'project', id: projectId, field: `overview.cards[${index}].title`, value: card.title, source: projectSource });
  addEntry({ scope: 'project', id: projectId, field: `overview.cards[${index}].summary`, value: card.summary, source: projectSource });
});
(project.mentions || []).forEach((mention, index) => {
  addEntry({ scope: 'project', id: projectId, field: `mentions[${index}].label`, value: mention.label, source: projectSource });
  addEntry({ scope: 'project', id: projectId, field: `mentions[${index}].summary`, value: mention.summary, source: projectSource });
  addEntry({ scope: 'project', id: projectId, field: `mentions[${index}].urlLabel`, value: mention.urlLabel, source: projectSource });
});

for (const item of tracks.values()) {
  const source = relative(path.join(projectRoot, 'tracks', item.file));
  addEntry({ scope: 'track', id: entityId(item.id), field: 'label', value: item.data.label, source });
  addEntry({ scope: 'track', id: entityId(item.id), field: 'shortLabel', value: item.data.shortLabel, source });
}

for (const item of acts.values()) {
  const source = relative(path.join(projectRoot, 'acts', item.file));
  const context = `ACT ${item.data.order}`;
  addEntry({ scope: 'act', id: entityId(item.id), field: 'title', value: item.data.title, source, context });
  addEntry({ scope: 'act', id: entityId(item.id), field: 'summary', value: item.data.summary, source, context });
}

for (const item of events.values()) {
  if (item.data.publicationStatus === 'withheld') continue;
  const source = relative(path.join(projectRoot, 'events', item.file));
  const trackId = String(item.data.track || '').split('/').at(-1) || '—';
  const context = `${trackId} · ${item.data.startMs}ms · ${item.data.publicationStatus}`;
  addEntry({ scope: 'event', id: entityId(item.id), field: 'title', value: item.data.title, source, context });
  addEntry({ scope: 'event', id: entityId(item.id), field: 'summary', value: item.data.summary, source, context });
  addEntry({ scope: 'event', id: entityId(item.id), field: 'readerNote', value: item.data.readerNote, source, context });
  (item.data.laneAnnotations || []).forEach((lane, index) => {
    addEntry({ scope: 'event', id: entityId(item.id), field: `laneAnnotations[${index}].label`, value: lane.label, source, context: `${context} · ${lane.lane}` });
  });
}

for (const item of threads.values()) {
  const source = relative(path.join(projectRoot, 'threads', item.file));
  addEntry({ scope: 'thread', id: entityId(item.id), field: 'title', value: item.data.title, source, context: item.data.category });
  addEntry({ scope: 'thread', id: entityId(item.id), field: 'deck', value: item.data.deck, source, context: item.data.category });
  addEntry({ scope: 'thread', id: entityId(item.id), field: 'body', value: item.body, source, context: item.data.category });
  (item.data.nodes || []).forEach((node, index) => {
    addEntry({ scope: 'thread', id: entityId(item.id), field: `nodes[${index}].transition`, value: node.transition, source, context: `${item.data.category} · ${node.event}` });
  });
  (item.data.relatedSources || []).forEach((related, index) => {
    addEntry({ scope: 'thread', id: entityId(item.id), field: `relatedSources[${index}].context`, value: related.context, source, context: `${item.data.category} · ${related.source}` });
  });
}

for (const item of people.values()) {
  const source = relative(path.join(projectRoot, 'people', item.file));
  addEntry({ scope: 'person', id: entityId(item.id), field: 'displayName', value: item.data.displayName, source });
  addEntry({ scope: 'person', id: entityId(item.id), field: 'reading', value: item.data.reading, source });
  addEntry({ scope: 'person', id: entityId(item.id), field: 'projectContext', value: item.data.projectContext, source });
  (item.data.callNames || []).forEach((value, index) => addEntry({ scope: 'person', id: entityId(item.id), field: `callNames[${index}]`, value, source }));
  (item.data.participation || []).forEach((participation, index) => {
    addEntry({ scope: 'person', id: entityId(item.id), field: `participation[${index}].character`, value: participation.character, source });
    addEntry({ scope: 'person', id: entityId(item.id), field: `participation[${index}].credit`, value: participation.credit, source });
  });
  (item.data.links || []).forEach((link, index) => addEntry({ scope: 'person', id: entityId(item.id), field: `links[${index}].label`, value: link.label, source }));
}

for (const item of sources.values()) {
  const source = relative(path.join(projectRoot, 'sources', item.file));
  addEntry({ scope: 'source', id: entityId(item.id), field: 'label', value: item.data.label, source });
  addEntry({ scope: 'source', id: entityId(item.id), field: 'author.name', value: item.data.author?.name, source });
  addEntry({ scope: 'source', id: entityId(item.id), field: 'author.handle', value: item.data.author?.handle, source });
}

const komatsuUiCopy = [
  ['project-archive.hero', 'eyebrow', '36TH BIRTHDAY · LIVE ARCHIVE', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.hero', 'sourceNote', '本档案整理自 YouTube 主直播与两段 X Space；三份媒体保留各自原视频时间，不强行换算为统一时钟。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.hero', 'stamp', 'BIRTHDAY|SPECIAL', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.facts', 'labels', '主直播时长|独立媒体|故事线', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.nav', 'overview', '快速了解', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.nav', 'timeline', '按时间浏览', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.nav', 'storylines', '精彩事件', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.nav', 'people', '人物', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.nav', 'transcript', '完整资料', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'heading', '不知道从哪里开始的话，可以先看看这些', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'kicker', 'FIVE-MINUTE ORIENTATION', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'opening', '前半程还在为设备和流程焦头烂额，人到齐以后又被礼物、赛马、Space 和各种临时事故不断带跑；随后认真复盘《俺知》，真正准备结束以后，还拖出了公告、圆阵、Super Chat、约好的歌和青春 Amigo。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'host', '这是刚步入 36 岁的小松昌平——生日主角、主持人，也是《俺知》的主创。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'cast', '然后你会陆续遇到：“空手套礼品卡”的濱健人；把 20:50 变成赛马现场的寺島惇太；从一句“想吃俄罗斯章鱼烧”开始，约 80 分钟后真的炸到后辈嘴里的芥末章鱼烧；突然跑进 Space、只留下“今晚吃烤肉”的仲村宗悟；还有那个一直声称“不是本人”的室元气账号。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'continue', '如果想继续了解这场以《俺を知ってくれ！》为主题的生日会，看看小松和这些来宾在五个小时里到底发生了些什么，就继续往下看吧。→', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'birthday', '生日会', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'birthdaySummary', '礼物、赛马、俳句、Bingo 与最后的 36 岁抱负。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'makingOf', '《俺知》打ち上げ', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'makingOfSummary', '名场面、动作、方言与朗读形式的现场复盘。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'space', 'Space 技术线', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'spaceSummary', '主播反复离席，另一平台的事件又回流到主桌。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'featuredKicker', '精彩回收 · 03:09:23', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.overview', 'featuredCta', '定位并进入时间线 →', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'heading', 'Timeline', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'kicker', 'CHRONOLOGICAL CANON · SOURCE-LOCAL CLOCKS', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'description', '选择一个来源查看其独立本地时钟。YouTube 保留八个 Act 主线，X Space 使用各自的事件列表，不把现场时钟硬拼在一起。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'scopeKicker', 'TIMELINE SCOPE', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'scopeDescription', '按来源切换；所有时间均使用各自原视频的时间。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.storylines', 'heading', 'Storylines', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.storylines', 'kicker', 'CONTEXT RECONSTRUCTION', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.storylines', 'description', '事件线按故事发展顺序排列；跨平台段落保留各自时间，不强行合并成一个时钟。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.people', 'heading', 'People / Cast', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.people', 'description', '每个人物页都会汇总他在主直播、Space 与《俺知》复盘中出现的相关片段。', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.people', 'groups', 'HOST / BIRTHDAY|ORE-SHIRI CAST|PRODUCTION / ACTION|BIRTHDAY LIVE PARTICIPANTS|X SPACE / REMOTE', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.transcript', 'heading', 'Transcript 暂不公开', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.transcript', 'kicker', 'RIGHTS GATE', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.transcript', 'description', '逐字稿暂不公开；本档案先提供时间线、事件摘要和事件线，保留原始媒体入口。', 'src/components/project/ProjectArchiveShell.astro'],
  ['media-source', 'heading', '媒体来源', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'summary', '查看 3 个媒体来源、时长与来源证明', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'clock', '三路媒体 · 各自原视频时间', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'inlinePlayback', '站内播放', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'openSource', '打开原来源 ↗', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'browseEvents', '浏览事件 →', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'provenance', '来源证明', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'state', 'INLINE PLAYBACK|EXTERNAL SOURCE', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'kind', 'VIDEO|AUDIO|360°', 'src/components/project/MediaSourceNavigator.astro'],
  ['media-source', 'eventIndex', '此来源的事件|选择来源以浏览事件', 'src/components/project/MediaSourceNavigator.astro'],
  ['timeline', 'acts', 'Timeline Acts', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'expand', '展开', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'act', 'ACT', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'jump', '跳转到 ACT', 'src/components/project/TimelineNavigator.astro'],
  ['act', 'draft', '编辑草案', 'src/components/project/ActSection.astro'],
  ['act', 'events', 'EVENTS', 'src/components/project/ActSection.astro'],
  ['source-timeline', 'clock', '本来源使用独立本地时钟；以下时间不会换算到 YouTube 主直播轴。', 'src/components/project/SourceTimeline.astro'],
  ['archive-player', 'currentSource', 'CURRENT SOURCE', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'source', 'SOURCE', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'switchSource', '播放器来源切换', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'load', '载入播放器', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'posterFallback', 'YouTube 预览图暂时无法连接', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'posterFallbackNote', '播放器仍可在网络恢复后重新尝试载入。', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'error', 'YouTube 无法连接', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'errorDescription', '播放器与预览图未能从 YouTube 加载。若当前网络无法访问 YouTube，请调整网络环境后重试。', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'retry', '重新尝试', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'openSource', '打开 YouTube ↗', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'noTarget', '选择时间节点开始定位', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'contextCta', '在 Timeline 查看此节点 →', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'sourceNote', '使用 YouTube 原生 360°能力；移动设备的视角支持取决于 YouTube 与设备。', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'targetEmpty', 'NO TARGET SELECTED|选择一个此来源事件以获得定位时间', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'externalNote', 'X SPACE REPLAY · EXTERNAL SOURCE|本站提供原来源入口，不重托管媒体，也不伪造时间定位。', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'unavailableNote', '当前未登记公开播放源。', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'readingContext', 'READING CONTEXT|关联上下文|选择一条相关事件线|暂无相关事件线', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'contextLinks', '在来源事件索引中查看 →|在 Storyline 选择上下文 →|在 Storyline 查看上下文 →', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'mode', '展开完整播放器|切换为底部播放栏|展开播放器|收起为底部播放栏|最小化|收起', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-search', 'label', '搜索事件、事件线或人物', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'placeholder', '例如：章鱼烧、内田、Bingo', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'status', '首次输入时加载公开索引。', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'error', '搜索索引暂时无法载入，专题其余内容仍可继续浏览。', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'scope', '只搜索已经公开的事件、故事线和人物', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'empty', '没有找到公开索引中的匹配项。', 'src/components/project/ProjectSearch.astro'],
  ['thread-panel', 'label', '完整事件线', 'src/components/project/ThreadPanel.astro'],
  ['thread-panel', 'close', '关闭事件线', 'src/components/project/ThreadPanel.astro'],
  ['person-panel', 'label', '人物资料', 'src/components/project/PersonPopover.astro'],
  ['person-panel', 'participation', '本项目参与方式', 'src/components/project/PersonPopover.astro'],
  ['person-panel', 'aliases', '本场常用称呼', 'src/components/project/PersonPopover.astro'],
  ['person-panel', 'relatedThreads', '相关事件线', 'src/components/project/PersonPopover.astro'],
  ['person-panel', 'relatedEvents', '本切片相关节点', 'src/components/project/PersonPopover.astro'],
  ['person-card', 'readingFallback', '人物资料', 'src/components/project/PersonCard.astro'],
  ['person-card', 'participation', '当前分组中的参与方式', 'src/components/project/PersonCard.astro'],
  ['person-card', 'count', '个相关节点 →', 'src/components/project/PersonCard.astro'],
  ['person-card', 'groups', 'PRODUCTION / ACTION|BIRTHDAY LIVE|X SPACE / REMOTE', 'src/components/project/PersonCard.astro'],
  ['lead-person-card', 'host', 'HOST / BIRTHDAY', 'src/components/project/LeadPersonCard.astro'],
  ['lead-person-card', 'rolePrefix', 'BIRTHDAY HOST ·', 'src/components/project/LeadPersonCard.astro'],
  ['cast-matrix', 'caption', '《俺を知ってくれ！》2026 昼夜 Cast', 'src/components/project/CastMatrix.astro'],
  ['cast-matrix', 'columns', '角色|昼|夜', 'src/components/project/CastMatrix.astro'],
  ['concurrent-lanes', 'kicker', 'HAPPENING IN PARALLEL', 'src/components/project/ConcurrentLanes.astro'],
  ['concurrent-lanes', 'note', '这里表示两个现场在同一段时间发生，不把它们的时钟强行对齐。', 'src/components/project/ConcurrentLanes.astro'],
  ['player-action-bar', 'timeline', '查看时间线|定位此处', 'src/components/project/ProjectArchiveShell.astro'],
  ['player-action-bar', 'storylines', '故事线 · —|RELATED STORYLINES', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'source', 'YouTube ↗|X 回放 ↗', 'src/components/project/ProjectArchiveShell.astro'],
  ['source-post', 'openPost', '在 X 查看原帖 ↗', 'src/components/project/SourcePost.astro'],
  ['source-post', 'unavailable', '来源曾用于本次编辑，原帖当前不可直达。', 'src/components/project/SourcePost.astro'],
  ['source-post', 'kicker', 'OUTSIDE THE STREAM · X', 'src/components/project/SourcePost.astro'],
  ['source-timeline', 'facts', '来源时间线摘要|个事件', 'src/components/project/SourceTimeline.astro'],
  ['event', 'people', '相关人物', 'src/components/project/TimelineEvent.astro'],
  ['event', 'storyline', '查看「」|条相关事件线', 'src/components/project/TimelineEvent.astro'],
  ['reader-labels', 'threadCategories', '连续笑点|前后回收|跨平台|制作幕后', 'src/lib/projectReaderLabels.ts'],
  ['reader-labels', 'threadRoles', '起点|发展|回收', 'src/lib/projectReaderLabels.ts'],
  ['reader-labels', 'participationKinds', '《俺知》出演|制作|Ensemble|生日会来宾|Space 来宾|LINE 电话|账号出现|事前投稿', 'src/lib/projectReaderLabels.ts'],
];

const komachoeUiCopy = [
  ['project-archive.hero', 'statsLabel[0]', '节目时长', 'src/lib/projectPresentation.mjs'],
  ['project-archive.hero', 'statsLabel[1]', '环节', 'src/lib/projectPresentation.mjs'],
  ['project-archive.hero', 'statsLabel[2]', '精选节点', 'src/lib/projectPresentation.mjs'],
  ['project-archive.hero', 'statsAria', '档案统计', 'src/components/project/ProjectHero.astro'],
  ['project-archive.nav', 'overview', '快速了解', 'src/lib/projectPresentation.mjs'],
  ['project-archive.nav', 'sections', '节目环节', 'src/lib/projectPresentation.mjs'],
  ['project-archive.nav', 'timeline', '按时间浏览', 'src/lib/projectPresentation.mjs'],
  ['project-search', 'ariaLabel', '搜索专题档案', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'label', '搜索事件', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'clear', '清除搜索', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'status', '首次输入时加载公开索引。', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'error', '搜索索引暂时无法载入，专题其余内容仍可继续浏览。', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'count', '0 条结果', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'scope', '只搜索已经公开的事件', 'src/components/project/ProjectSearch.astro'],
  ['project-search', 'empty', '没有找到公开索引中的匹配项。', 'src/components/project/ProjectSearch.astro'],
  ['project-archive.overview', 'featuredCta', '定位并进入时间线 →', 'src/components/project/ProjectOverview.astro'],
  ['project-archive.sections', 'kicker', 'PROGRAM STRUCTURE', 'src/components/project/ProjectSectionsView.astro'],
  ['project-archive.sections', 'heading', 'Sections', 'src/components/project/ProjectSectionsView.astro'],
  ['project-archive.sections', 'description', '按节目环节浏览完整结构，再进入 Timeline 查看值得直接跳听的具体节点。', 'src/components/project/ProjectSectionsView.astro'],
  ['project-archive.sections', 'eventCountSuffix', '个精选节点 →', 'src/components/project/ProjectSectionsView.astro'],
  ['project-archive.sections', 'sectionLabels', 'SPECIAL TALK|MAIL|MONTHLY FEATURE|FUTSUOTA|SUPER CHAT|ENDING', 'src/components/project/ProjectSectionsView.astro'],
  ['project-archive.timeline', 'kicker', 'CHRONOLOGICAL CANON · NATIVE CLOCK', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'heading', 'Timeline', 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.timeline', 'description', `按节目原始时钟浏览 ${acts.size} 个 Section 与精选节点。`, 'src/components/project/ProjectArchiveShell.astro'],
  ['project-archive.mentions', 'kicker', 'MENTION INDEX', 'src/components/project/ProjectMentionsView.astro'],
  ['project-archive.mentions', 'heading', 'Mentions', 'src/components/project/ProjectMentionsView.astro'],
  ['project-archive.mentions', 'description', '本期提及的人物、作品与背景信息。点击时间直接回到 Timeline；外部链接只用于补充公开资料。', 'src/components/project/ProjectMentionsView.astro'],
  ['project-archive.mentions', 'groups', 'WORKS|PEOPLE|CONTEXT|作品 / 企划|人物|背景 / 词条', 'src/components/project/ProjectMentionsView.astro'],
  ['project-archive.mentions', 'sourceCta', '查看官方网站|查看官方资料|查看背景资料', 'src/components/project/ProjectMentionsView.astro'],
  ['timeline', 'acts', 'Timeline Acts', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'expand', '展开', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'act', 'ACT', 'src/components/project/TimelineNavigator.astro'],
  ['timeline', 'jump', '跳转到 ACT', 'src/components/project/TimelineNavigator.astro'],
  ['act', 'draft', '编辑草案', 'src/components/project/ActSection.astro'],
  ['act', 'events', 'EVENTS', 'src/components/project/ActSection.astro'],
  ['event', 'people', '相关人物', 'src/components/project/TimelineEvent.astro'],
  ['archive-player', 'mobileExpand', '展开移动播放器', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'currentSource', 'CURRENT SOURCE', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'switchMode', '切换播放器显示方式', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'dockMode', '收起为底部播放栏', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'loadYoutubeAria', '载入 YouTube 播放器', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'load', '载入播放器', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'posterFallback', 'YouTube 预览图暂时无法连接', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'posterFallbackNote', '播放器仍可在网络恢复后重新尝试载入。', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'error', 'YouTube 无法连接', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'errorDescription', '播放器与预览图未能从 YouTube 加载。若当前网络无法访问 YouTube，请调整网络环境后重试。', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'retry', '重新尝试', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'openSource', '打开 YouTube ↗', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'noTarget', '选择时间节点开始定位', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'contextLabel', '当前节点上下文', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'readingContext', 'READING CONTEXT', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'contextCta', '在 Timeline 查看此节点 →', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'threadEmpty', '选择一条相关事件线|暂无相关事件线', 'src/components/project/ProjectArchiveShell.astro'],
  ['archive-player', 'fallback', '在 YouTube 打开原来源 ↗', 'src/components/project/ArchivePlayer.astro'],
  ['archive-player', 'mode', '展开完整播放器|切换为底部播放栏|展开播放器|收起为底部播放栏|最小化|收起', 'src/components/project/ProjectArchiveShell.astro'],
  ['player-action-bar', 'ariaLabel', '当前节点操作', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'timeline', '查看时间线|定位此处', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'noStoryline', '当前节点没有故事线', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'storyline', '故事线 · —', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'relatedStorylines', '相关事件线', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'kicker', 'RELATED STORYLINES', 'src/components/project/PlayerContextRail.astro'],
  ['player-action-bar', 'source', 'YouTube ↗', 'src/components/project/PlayerContextRail.astro'],
];

const uiCopy = projectId === 'komachoe-20260425' ? komachoeUiCopy : komatsuUiCopy;
uiCopy.forEach(([group, field, value, source]) => {
  const values = value.split('|');
  values.forEach((copy, index) => addEntry({
    scope: 'system/ui',
    id: group,
    field: values.length > 1 ? `${field}[${index}]` : field,
    value: copy,
    source,
  }));
});

const scopeOrder = ['project', 'track', 'act', 'event', 'thread', 'person', 'source', 'system/ui'];
entries.sort((a, b) => scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope) || a.copyKey.localeCompare(b.copyKey));
markdownEntries.sort((a, b) => scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope) || a.copyKey.localeCompare(b.copyKey));

const markdownValue = (value) => {
  const fenceLength = Math.max(3, ...[...value.matchAll(/`+/g)].map((match) => match[0].length + 1));
  const fence = '`'.repeat(fenceLength);
  return `${fence}text\n${value}\n${fence}`;
};
const markdown = [
  `# ${project.title} · Reader Copy Review`,
  '',
  `- Project: \`${projectId}\``,
  `- Editorial revision: \`${project.editorialRevision}\``,
  `- Generated by: \`npm run editorial:export-copy -- ${projectId}${outputLabel ? ` --output-label=${outputLabel}` : ''}\``,
  '- This is an editable review surface. Keep each `copy-key` stable; the manifest is the machine-readable snapshot for a later dry-run apply step.',
  '- Scope includes public Project / Track / Act / Event / Thread / Person / Source fields and SYSTEM/UI copy. Private Transcript / Evidence / Chat / qualification / internal source notes are intentionally excluded.',
  ...(projectId === 'komachoe-20260425' ? [
    '- This project is a single-track broadcast archive. The page exposes Project / Track / Act / Event and SYSTEM/UI copy; Thread / Person / Source directories are intentionally absent and therefore produce no entries.',
    '- Overview copy is exported from `project.json`; the timeline contains the published 30-event narrative layer. Event evidence, qualifications, transcripts and raw source notes remain excluded.',
  ] : []),
  '',
];
let currentScope = '';
for (const entry of markdownEntries) {
  if (entry.scope !== currentScope) {
    currentScope = entry.scope;
    markdown.push(`## ${currentScope === 'system/ui' ? 'SYSTEM / UI COPY' : currentScope.toUpperCase()}`, '');
  }
  markdown.push(
    `### \`${entry.copyKey}\``,
    '',
    '- [ ] reviewed',
    `- Source: \`${entry.source}\``,
    `- Field: \`${entry.field}\``,
    `- Original hash: \`${entry.originalHash}\``,
    ...(entry.context ? [`- Context: ${entry.context}`] : []),
    '',
    markdownValue(entry.value),
    '',
  );
}

const outputDirectory = path.resolve('docs/editorial');
fs.mkdirSync(outputDirectory, { recursive: true });
const outputStem = outputLabel ? `${projectId}-reader-copy-review-${outputLabel}` : `${projectId}-reader-copy-review`;
const manifestStem = outputLabel ? `${projectId}-reader-copy-manifest-${outputLabel}` : `${projectId}-reader-copy-manifest`;
const markdownPath = path.join(outputDirectory, `${outputStem}.md`);
const manifestPath = path.join(outputDirectory, `${manifestStem}.json`);
fs.writeFileSync(markdownPath, `${markdown.join('\n').trimEnd()}\n`, 'utf8');
fs.writeFileSync(manifestPath, `${JSON.stringify({
  schemaVersion: 1,
  projectId,
  projectTitle: project.title,
  editorialRevision: project.editorialRevision,
  generatedBy: 'editorial:export-copy',
  entries,
}, null, 2)}\n`, 'utf8');
console.log(`Wrote ${relative(markdownPath)} and ${relative(manifestPath)} (${entries.length} copy entries).`);
