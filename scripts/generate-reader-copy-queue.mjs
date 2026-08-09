import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const projectRoot = path.resolve('src/content/projects/komatsu36');
const outputPath = path.resolve('docs/editorial/komatsu36-reader-copy-candidates.generated.md');
const decisionsPath = path.resolve('docs/editorial/komatsu36-reader-copy-decisions.yml');

const termGroups = {
  'evidence-language': [
    '复核', 'ASR', 'Whisper', 'SRT', 'Live Chat', '高精度', '低置信度',
    'A级', 'B级', 'A-', 'B+', '封板', '锁回', '裁决', '母本', '反向支持',
  ],
  'editorial-meta-language': [
    '当前采用', '当前判断', '不强认', '短窗', '页面', '本文', '本条线', '资料', '发布',
  ],
  'technical-language': ['定位', '逐句', '并发标注', '轨道', 'offset', 'canonical'],
};

const trackOrder = new Map([
  ['komatsu36/yt-main', 0],
  ['komatsu36/space-1', 1],
  ['komatsu36/space-2', 2],
]);
const trackLabels = new Map([
  ['komatsu36/yt-main', 'YT'],
  ['komatsu36/space-1', 'SP1'],
  ['komatsu36/space-2', 'SP2'],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readThread(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid frontmatter: ${filePath}`);
  return { data: YAML.parse(match[1]), body: match[2].trim() };
}

function matchesByGroup(text) {
  return Object.entries(termGroups)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([group]) => group);
}

function formatTime(milliseconds) {
  const total = Math.floor(milliseconds / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function block(value) {
  return value ? value.trim() : '—';
}

const eventDir = path.join(projectRoot, 'events');
const eventItems = fs.readdirSync(eventDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => {
    const data = readJson(path.join(eventDir, name));
    const searchable = [data.title, data.summary, data.qualification].filter(Boolean).join('\n');
    const flags = matchesByGroup(searchable);
    if (data.qualification) flags.unshift('has-internal-qualification');
    return { id: path.basename(name, '.json'), name, data, flags: [...new Set(flags)] };
  })
  .sort((a, b) => (
    (trackOrder.get(a.data.track) ?? 99) - (trackOrder.get(b.data.track) ?? 99)
    || a.data.startMs - b.data.startMs
    || a.id.localeCompare(b.id)
  ));
const threadDir = path.join(projectRoot, 'threads');
const threadItems = fs.readdirSync(threadDir)
  .filter((name) => name.endsWith('.md'))
  .sort()
  .map((name) => {
    const parsed = readThread(path.join(threadDir, name));
    const transitions = (parsed.data.nodes || []).map((node) => node.transition).filter(Boolean);
    const searchable = [parsed.data.title, parsed.data.deck, parsed.body, ...transitions].filter(Boolean).join('\n');
    return {
      id: path.basename(name, '.md'),
      name,
      ...parsed,
      transitions,
      flags: matchesByGroup(searchable),
    };
  });
const decisionDocument = fs.existsSync(decisionsPath)
  ? YAML.parse(fs.readFileSync(decisionsPath, 'utf8'))
  : { version: 1, decisions: {} };
if (decisionDocument?.version !== 1 || !decisionDocument?.decisions || typeof decisionDocument.decisions !== 'object') {
  throw new Error(`Invalid decisions document: ${decisionsPath}`);
}
const decisions = decisionDocument.decisions || {};
const knownIds = new Set([...eventItems, ...threadItems].map((item) => item.id));
const unknownDecisionIds = Object.keys(decisions).filter((id) => !knownIds.has(id));
if (unknownDecisionIds.length > 0) {
  throw new Error(`Decisions reference non-candidates: ${unknownDecisionIds.join(', ')}`);
}
const copyActions = new Set(['keep', 'rewrite', 'listen']);
const readerNoteActions = new Set(['none', 'add']);
for (const [id, decision] of Object.entries(decisions)) {
  if (decision.copyAction && !copyActions.has(decision.copyAction)) {
    throw new Error(`${id}: invalid copyAction ${decision.copyAction}`);
  }
  if (decision.readerNoteAction && !readerNoteActions.has(decision.readerNoteAction)) {
    throw new Error(`${id}: invalid readerNoteAction ${decision.readerNoteAction}`);
  }
}

// Keep a resolved candidate in the generated ledger even when its approved
// copy no longer matches the scanner. This makes decisions durable across a
// successful rewrite while still rejecting IDs that do not exist in content.
const eventCandidates = eventItems.filter((item) => item.flags.length > 0 || Object.hasOwn(decisions, item.id));
const threadCandidates = threadItems.filter((item) => item.flags.length > 0 || Object.hasOwn(decisions, item.id));

const project = readJson(path.join(projectRoot, 'project.json'));
const lines = [
  '# Komatsu36 Reader Copy Candidates (Generated)',
  '',
  `内容快照：${project.editorialRevision}`,
  '',
  '> 本文件完全由脚本生成，禁止在这里填写人工决定。命中词只表示需要人工判断，不代表事实错误。所有决定只写入 `komatsu36-reader-copy-decisions.yml`。',
  '',
  '## 使用合同',
  '',
  `- 范围：${eventItems.length} 个 Event 与 ${threadItems.length} 条 Thread 的当前发布文案。`,
  '- Event 只要存在 `qualification` 就进入候选，因为当前组件会把它直接显示给读者；其余项目按工程词、证据词和编辑元语言命中。',
  '- 不确定性不改变读者理解时，保留内部 `qualification`，读者侧不显示。',
  '- 不确定性改变人物归属、事件结果或叙事因果时，才新增自然语言 `readerNote`。',
  '- 本候选集不处理 Transcript、Evidence、Chat 原文，也不增加 Event。',
  '- `copyAction` 与 `readerNoteAction` 是两个独立维度；正文需要改写不代表必须增加 reader note。',
  '',
  '## 快照',
  '',
  `- Event candidates: ${eventCandidates.length}`,
  `- Thread candidates: ${threadCandidates.length}`,
  `- Recorded decisions: ${Object.keys(decisions).length}`,
  '- 扫描词组：`evidence-language`、`editorial-meta-language`、`technical-language`；完整词表以生成脚本为准。',
  '',
  '## Event candidates',
  '',
];

eventCandidates.forEach((item, index) => {
  const number = String(index + 1).padStart(3, '0');
  const decision = decisions[item.id] || {};
  lines.push(
    `### RCOPY-${number} · ${item.id}`,
    '',
    `- Track / Time: ${trackLabels.get(item.data.track) || item.data.track} ${item.data.timingStatus === 'approximate' ? '≈' : ''}${formatTime(item.data.startMs)}`,
    `- Status: \`${item.data.publicationStatus}\``,
    `- Flags: ${(item.flags.length > 0 ? item.flags : ['resolved-decision']).map((flag) => `\`${flag}\``).join(', ')}`,
    `- Source pointer: \`src/content/projects/komatsu36/events/${item.name}\``,
    '',
    '**CURRENT TITLE**',
    '',
    block(item.data.title),
    '',
    '**CURRENT SUMMARY**',
    '',
    block(item.data.summary),
    '',
    '**CURRENT QUALIFICATION**',
    '',
    block(item.data.qualification),
    '',
    '**RECORDED DECISION**',
    '',
    `- Copy action: \`${decision.copyAction || 'pending'}\``,
    `- Reader note action: \`${decision.readerNoteAction || 'pending'}\``,
    `- Editorial note: ${block(decision.note)}`,
    '',
    '**APPROVED REPLACEMENT**',
    '',
    `- New title: ${block(decision.newTitle)}`,
    `- New summary: ${block(decision.newSummary)}`,
    `- Reader note: ${block(decision.readerNote)}`,
    '',
  );
});

lines.push('## Thread candidates', '');

threadCandidates.forEach((item, index) => {
  const number = String(eventCandidates.length + index + 1).padStart(3, '0');
  const decision = decisions[item.id] || {};
  lines.push(
    `### RCOPY-${number} · ${item.id}`,
    '',
    `- Flags: ${(item.flags.length > 0 ? item.flags : ['resolved-decision']).map((flag) => `\`${flag}\``).join(', ')}`,
    `- Source pointer: \`src/content/projects/komatsu36/threads/${item.name}\``,
    '',
    '**CURRENT DECK**',
    '',
    block(item.data.deck),
    '',
    '**CURRENT BODY**',
    '',
    block(item.body),
    '',
    '**CURRENT TRANSITIONS**',
    '',
    item.transitions.length > 0 ? item.transitions.map((value) => `- ${value}`).join('\n') : '—',
    '',
    '**RECORDED DECISION**',
    '',
    `- Copy action: \`${decision.copyAction || 'pending'}\``,
    `- Editorial note: ${block(decision.note)}`,
    '',
    '**APPROVED REPLACEMENT**',
    '',
    `- New deck: ${block(decision.newDeck)}`,
    `- New body: ${block(decision.newBody)}`,
    '',
  );
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} (${eventCandidates.length} events, ${threadCandidates.length} threads).`);
