import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const projectId = 'komatsu36';
const projectRoot = path.resolve('src/content/projects', projectId);
const outputFile = path.resolve('dist/projects', projectId, 'index.html');
const searchOutputFile = path.resolve('dist/projects', projectId, 'search.json');
const homeOutputFile = path.resolve('dist/index.html');
const errors = [];

const listFiles = async (folder, extension) => (await readdir(path.join(projectRoot, folder)))
  .filter((name) => name.endsWith(extension));
const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const trackFiles = await listFiles('tracks', '.json');
const eventFiles = await listFiles('events', '.json');
const eventEntries = await Promise.all(eventFiles.map(async (name) => ({
  id: name.replace(/\.json$/, ''),
  data: await readJson(path.join(projectRoot, 'events', name)),
})));
const publicEventEntries = eventEntries.filter(({ data }) => data.publicationStatus !== 'withheld');
const publicEvents = publicEventEntries.map(({ data }) => data);
const threadFiles = await listFiles('threads', '.md');
const threadEntries = await Promise.all(threadFiles.map(async (name) => {
  const source = await readFile(path.join(projectRoot, 'threads', name), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const body = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)?.[1]?.trim() || '';
  return { id: name.replace(/\.md$/, ''), data: YAML.parse(frontmatter), body };
}));
const peopleFiles = await listFiles('people', '.json');
const peopleEntries = await Promise.all(peopleFiles.map(async (name) => ({
  id: name.replace(/\.json$/, ''),
  data: await readJson(path.join(projectRoot, 'people', name)),
})));
const threadCount = threadEntries.length;
const peopleCount = peopleEntries.length;
const expectedSearchItems = publicEvents.length + threadCount + peopleCount;
const expectedTrackIds = new Set(trackFiles.map((name) => name.replace(/\.json$/, '')));

let html;
let homeHtml;
try {
  html = await readFile(outputFile, 'utf8');
  homeHtml = await readFile(homeOutputFile, 'utf8');
} catch (error) {
  console.error(`Publication validation failed: build output is missing (${outputFile}).`);
  console.error(error.message);
  process.exit(1);
}

const project = await readJson(path.join(projectRoot, 'project.json'));
const semanticPatch = await readFile(path.resolve('docs/komatsu36_semantic_patch_20260810.md'), 'utf8');
const newEventCopyReview = await readFile(path.resolve('docs/editorial/komatsu36-new-event-copy-review-20260812.md'), 'utf8');
const semanticEventById = new Map(eventEntries.map((entry) => [entry.id, entry.data]));
const semanticThreadById = new Map(threadEntries.map((entry) => [entry.id, entry]));
const semanticPersonById = new Map(peopleEntries.map((entry) => [entry.id, entry.data]));
const amazonEvent = semanticEventById.get('yt-040405-amazon-hama');
const amazonGrabEvent = semanticEventById.get('yt-040524-hama-grabs-amazon-card');
const amazonPeople = new Set(amazonEvent?.people || []);
if (!project.editorialRevision.startsWith('2026-08-10-semantic-')
  && project.editorialRevision !== '2026-08-11-reader-copy-reviewed-final'
  && project.editorialRevision !== '2026-08-12-new-event-copy-reviewed-final-v2') {
  errors.push(`semantic passes require the semantic baseline or reviewed-final editorialRevision; found ${project.editorialRevision}`);
}
if (!semanticPatch.includes('OVERRIDE：Amazonギフトカード 5000円分 × 2')
  || !semanticPatch.includes('本文件第 1～2 节对 Amazon / 濱线的结论覆盖上述旧条目')) {
  errors.push('semantic override authority is missing the Amazon/濱 precedence contract');
}
if (!amazonEvent
  || amazonEvent.title !== 'Amazon 5000 円×2：寺島与堀金同时 Bingo'
  || amazonEvent.summary !== '23 番一出，两个人同时 Bingo，正好撞上两份 Amazon 5000 円礼券。'
  || amazonEvent.publicationStatus !== 'qualified'
  || amazonEvent.readerNote
  || amazonPeople.size !== 2
  || !amazonPeople.has('komatsu36/terashima-junta')
  || !amazonPeople.has('komatsu36/horikane-sohei')
  || amazonPeople.has('komatsu36/hama-kento')) {
  errors.push('semantic P0 Amazon Event must identify 寺島+堀金, exclude 濱 as winner, and keep uncertainty internal');
}
if (!amazonGrabEvent
  || amazonGrabEvent.startMs !== 14724000
  || amazonGrabEvent.endMs !== 14739000
  || !amazonGrabEvent.people.includes('komatsu36/hama-kento')
  || !amazonGrabEvent.people.includes('komatsu36/terashima-junta')) {
  errors.push('semantic P0 must publish the separate 04:05:24 濱-grabs-寺島-card Event');
}
const bingoThread = semanticThreadById.get('bingo-payback');
const hamaThread = semanticThreadById.get('hama-paid-drinking');
const bingoNodeIds = new Set((bingoThread?.data.nodes || []).map((node) => String(node.event)));
const hamaNodeIds = new Set((hamaThread?.data.nodes || []).map((node) => String(node.event)));
if (!bingoNodeIds.has('komatsu36/yt-040405-amazon-hama')
  || !bingoNodeIds.has('komatsu36/yt-040524-hama-grabs-amazon-card')) {
  errors.push('semantic P0 Bingo thread must retain the winner Event and add the separate card-grab Event');
}
if (!hamaNodeIds.has('komatsu36/yt-040524-hama-grabs-amazon-card')
  || hamaNodeIds.has('komatsu36/yt-040405-amazon-hama')
  || !hamaThread?.body.includes('自己没中还伸手去抢寺島的卡')) {
  errors.push('semantic P0 濱 thread must use the card-grab Event and must not present 濱 as an Amazon winner');
}
if (semanticPersonById.get('shioya-fumiyasu')?.reading !== 'しおや ふみよし') {
  errors.push('semantic P0 requires 汐谷文康 reading しおや ふみよし');
}

const semanticTimelineEventChecks = [
  ['yt-025449-kano-haiku', (event) => event?.startMs === 10484000
    && event.narrativeMode === 'threaded'],
  ['yt-025755-kumagai-haiku', (event) => event?.startMs === 10642000
    && event.endMs === 10692000
    && event.timingStatus === 'approximate'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/kumagai-toshiki',
      'komatsu36/kano-sho',
      'komatsu36/terashima-junta',
    ])],
  ['yt-013730-hama-j-coupon', (event) => event?.startMs === 5850600
    && event.endMs === 5862000
    && event.timingStatus === 'exact'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/hama-kento',
      'komatsu36/terashima-junta',
    ])],
  ['yt-013800-thirty-four-yen', (event) => event?.startMs === 5862000
    && event.endMs === 5872000
    && event.timingStatus === 'exact'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/hama-kento',
      'komatsu36/terashima-junta',
      'komatsu36/komatsu-shohei',
    ])],
  ['yt-013827-hama-moet-budget', (event) => event?.startMs === 5907800
    && event.endMs === 5943000
    && event.timingStatus === 'exact'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/hama-kento',
      'komatsu36/komatsu-shohei',
    ])],
  ['yt-013917-kano-spice-sensor', (event) => event?.startMs === 5957580
    && event.endMs === 5995000
    && event.timingStatus === 'exact'
    && event.narrativeMode === 'timeline-only'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/komatsu-shohei',
      'komatsu36/kano-sho',
      'komatsu36/terashima-junta',
    ])],
  ['yt-013840-great-payback', (event) => event?.startMs === 6058000
    && event.endMs === 6090000
    && event.timingStatus === 'exact'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify(['komatsu36/komatsu-shohei'])],
  ['yt-014246-hama-spicy-chicken', (event) => event?.startMs === 6166000
    && event.endMs === 6174000
    && event.timingStatus === 'approximate'
    && event.publicationStatus === 'qualified'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify(['komatsu36/hama-kento'])],
  ['yt-014321-kano-ojisan', (event) => event?.startMs === 6201000
    && event.endMs === 6233000
    && event.timingStatus === 'exact'
    && event.publicationStatus === 'qualified'
    && event.narrativeMode === 'threaded'
    && JSON.stringify(event.people) === JSON.stringify([
      'komatsu36/kano-sho',
      'komatsu36/hama-kento',
    ])],
  ['yt-024207-controlled-adlib', (event) => event?.narrativeMode === 'threaded'],
  ['yt-040820-kotetsu-kano', (event) => event?.startMs === 14904000
    && event.timingStatus === 'approximate'],
  ['yt-035421-bingo-starts', (event) => event?.narrativeMode === 'threaded'],
];
for (const [eventId, passes] of semanticTimelineEventChecks) {
  if (!passes(semanticEventById.get(eventId))) {
    errors.push(`semantic timeline audit metadata mismatch for ${eventId}`);
  }
}
const reviewedFinalV2Copy = new Map([
  ['yt-013730-hama-j-coupon', {
    title: '濱掏出没选的 J 券：这个我能领吗？',
    summary: '小松没选的お小遣い券不知什么时候已经进了濱口袋。濱直接问能不能兑现，寺島转头先问了他一句：你今年几岁？',
  }],
  ['yt-013827-hama-moet-budget', {
    title: '八千万还没影，濱已经开始按大奖预算点酒',
    summary: 'Big Dream 还只存在于想象里，濱已经从十瓶 Moët Rosé 开始算，最后退到四瓶、八万日元。小松只能一边听一边求他手下留情。',
  }],
  ['yt-013917-kano-spice-sensor', {
    title: '狩野临时接班“辛さセンサー”，一口判定アウト',
    summary: '小松先发现炸鸡发辣，狩野这个同样怕辣的人接过试吃。只咬一口就给出「辛い、アウト」，于是现场重新点了不辣的炸鸡。',
  }],
  ['yt-013840-great-payback', {
    title: '频道攒了一年的收入，生日会被说成「大還元祭」',
    summary: '小松说，频道这一年收到的广告收入和 Super Chat 一直没找到合适的回馈方式。话题顺势把这场生日会说成了「大還元祭」，后面又开始拿收入和税金继续起哄。',
  }],
  ['yt-014246-hama-spicy-chicken', {
    title: '濱接盘辣味炸鸡：好吃，但是真的辣',
    summary: '小松和狩野都嫌辣的炸鸡最后到了濱手里。濱说自己本来就爱吃辣，尝完的结论也很简单：好吃，是真的辣。',
  }],
  ['yt-014321-kano-ojisan', {
    title: '濱总结狩野这四年：越来越おじさん',
    summary: '濱开始盘点狩野这四年的变化：以前觉得只有大叔会做的事，如今几乎一个个都做上了。吐槽到最后，又补了一句——还好脸长得好看。',
  }],
]);
for (const [eventId, expectedCopy] of reviewedFinalV2Copy) {
  const event = semanticEventById.get(eventId);
  for (const field of ['title', 'summary']) {
    const copyKey = `event:komatsu36/${eventId}#${field}`;
    const heading = `### \`${copyKey}\``;
    const sectionStart = newEventCopyReview.indexOf(heading);
    const sectionEnd = newEventCopyReview.indexOf('\n### ', sectionStart + heading.length);
    const section = sectionStart >= 0
      ? newEventCopyReview.slice(sectionStart, sectionEnd >= 0 ? sectionEnd : undefined)
      : '';
    if (!section) {
      errors.push(`new Event copy review is missing stable key ${copyKey}`);
    } else if (!section.includes('- [x] reviewed')) {
      errors.push(`new Event copy review is not approved for ${copyKey}`);
    }
    if (event?.[field] !== expectedCopy[field]) {
      errors.push(`reviewed-final-v2 source mismatch for ${copyKey}`);
    }
  }
}

const semanticTimelineThreadNodes = new Map([
  ['popular-space-haiku', [
    'komatsu36/yt-025057-birthday-haiku-formed',
    'komatsu36/yt-025353-popular-haiku',
    'komatsu36/yt-025449-kano-haiku',
    'komatsu36/yt-025755-kumagai-haiku',
    'komatsu36/yt-030823-sunglasses-haiku',
    'komatsu36/yt-045552-space-ambition',
  ]],
  ['terashima-big-dream', [
    'komatsu36/yt-013730-hama-j-coupon',
    'komatsu36/yt-013800-thirty-four-yen',
    'komatsu36/yt-013827-hama-moet-budget',
  ]],
  ['hama-paid-drinking', [
    'komatsu36/yt-013730-hama-j-coupon',
    'komatsu36/yt-013800-thirty-four-yen',
    'komatsu36/yt-013827-hama-moet-budget',
    'komatsu36/yt-013840-great-payback',
    'komatsu36/yt-014246-hama-spicy-chicken',
  ]],
  ['kano-ojisan', [
    'komatsu36/yt-014321-kano-ojisan',
    'komatsu36/yt-025037-kano-toilet',
    'komatsu36/yt-041453-kano-tbolan',
  ]],
  ['uchida-line-call', ['komatsu36/yt-020644-eight-trip']],
  ['ore-shiri-making-of', ['komatsu36/yt-024207-controlled-adlib']],
  ['bingo-payback', ['komatsu36/yt-035421-bingo-starts']],
  ['yano-sunglasses', ['komatsu36/yt-030823-sunglasses-haiku']],
]);
for (const [threadId, expectedNodes] of semanticTimelineThreadNodes) {
  const actualNodes = (semanticThreadById.get(threadId)?.data.nodes || [])
    .map((node) => String(node.event));
  const passes = threadId === 'popular-space-haiku'
    ? JSON.stringify(actualNodes) === JSON.stringify(expectedNodes)
    : expectedNodes.every((nodeId) => actualNodes.includes(nodeId));
  if (!passes) errors.push(`semantic timeline audit thread mismatch for ${threadId}`);
}
const semanticTimelineNodeRoles = new Map([
  ['popular-space-haiku', new Map([
    ['komatsu36/yt-025057-birthday-haiku-formed', 'setup'],
    ['komatsu36/yt-025353-popular-haiku', 'development'],
    ['komatsu36/yt-025449-kano-haiku', 'development'],
    ['komatsu36/yt-025755-kumagai-haiku', 'development'],
    ['komatsu36/yt-030823-sunglasses-haiku', 'development'],
    ['komatsu36/yt-045552-space-ambition', 'payoff'],
  ])],
  ['terashima-big-dream', new Map([
    ['komatsu36/yt-013730-hama-j-coupon', 'development'],
    ['komatsu36/yt-013800-thirty-four-yen', 'development'],
    ['komatsu36/yt-013827-hama-moet-budget', 'development'],
  ])],
  ['hama-paid-drinking', new Map([
    ['komatsu36/yt-013730-hama-j-coupon', 'development'],
    ['komatsu36/yt-013800-thirty-four-yen', 'development'],
    ['komatsu36/yt-013827-hama-moet-budget', 'development'],
    ['komatsu36/yt-013840-great-payback', 'development'],
    ['komatsu36/yt-014246-hama-spicy-chicken', 'development'],
  ])],
  ['kano-ojisan', new Map([
    ['komatsu36/yt-014321-kano-ojisan', 'setup'],
    ['komatsu36/yt-025037-kano-toilet', 'development'],
    ['komatsu36/yt-041453-kano-tbolan', 'payoff'],
  ])],
  ['ore-shiri-making-of', new Map([['komatsu36/yt-024207-controlled-adlib', 'development']])],
  ['bingo-payback', new Map([['komatsu36/yt-035421-bingo-starts', 'development']])],
]);
for (const [threadId, expectedRoles] of semanticTimelineNodeRoles) {
  const actualRoles = new Map((semanticThreadById.get(threadId)?.data.nodes || [])
    .map((node) => [String(node.event), node.role]));
  for (const [eventId, role] of expectedRoles) {
    if (actualRoles.get(eventId) !== role) {
      errors.push(`semantic timeline audit role mismatch for ${threadId} -> ${eventId}`);
    }
  }
}
const uchidaBranchNode = semanticThreadById.get('uchida-line-call')?.data.nodes
  .find((node) => String(node.event) === 'komatsu36/yt-020644-eight-trip');
if (uchidaBranchNode?.role !== 'development'
  || uchidaBranchNode.transition !== '小松离席接内田电话后，主直播一侧因为18TRIP成员聚集又自行长出支线。') {
  errors.push('semantic timeline audit requires the 18TRIP branch transition in the Uchida thread');
}

const expectedCallNames = new Map([
  ['komatsu-shohei', ['コマッチ']],
  ['hama-kento', ['濱ちゃん', 'ハマ']],
  ['kano-sho', []],
  ['terashima-junta', ['惇太']],
  ['shioya-fumiyasu', ['ふーみん']],
  ['inoue-yuki', []],
  ['yano-shogo', []],
  ['horikane-sohei', ['蒼平']],
  ['mitsutomi-takao', ['タカオ']],
  ['kumagai-toshiki', ['トシピ']],
  ['sato-yugo', ['祐吾']],
  ['ito-tomohiro', []],
  ['kanze-tomoaki', []],
  ['muro-genki', []],
  ['nakamura-shugo', ['宗悟']],
  ['seiten', []],
  ['yamamoto-masahiro', []],
  ['uchida-shuichi', ['修']],
]);
for (const [personId, expected] of expectedCallNames) {
  const person = semanticPersonById.get(personId);
  if (!person
    || JSON.stringify(person.callNames || []) !== JSON.stringify(expected)
    || !Array.isArray(person.searchAliases)
    || person.searchAliases.length !== 0
    || 'aliases' in person) {
    errors.push(`semantic P1 callNames mismatch for ${personId}`);
  }
}
if (expectedCallNames.size !== peopleEntries.length) {
  errors.push(`semantic P1 callNames ledger covers ${expectedCallNames.size} people; expected ${peopleEntries.length}`);
}
const expectedAccountContextEvents = new Set([
  'sp1-004324-space-restart',
  'sp2-000131-muro-account',
  'sp2-000311-account-hijack',
]);
for (const eventId of expectedAccountContextEvents) {
  const event = semanticEventById.get(eventId);
  const relations = event?.personRelations || [];
  if (relations.length !== 1
    || String(relations[0].person) !== 'komatsu36/muro-genki'
    || relations[0].kind !== 'account-context') {
    errors.push(`semantic P1 account-context relation mismatch for ${eventId}`);
  }
}
const accountHijackEvent = semanticEventById.get('sp2-000311-account-hijack');
if (accountHijackEvent?.readerNote !== '这段只能确认使用的是室元気的账号，实际说话者未确认。') {
  errors.push('semantic P1 account speaker uncertainty requires the natural reader note');
}
if ((semanticEventById.get('sp2-000509-hokkaido')?.personRelations || []).length !== 0) {
  errors.push('semantic P1 Hokkaido payoff must keep 室元気 as a person, not an account-context relation');
}
const publicOfferEvent = semanticEventById.get('sp2-025404-public-offer');
if (!publicOfferEvent
  || publicOfferEvent.startMs !== 10444000
  || publicOfferEvent.endMs !== 10481000
  || publicOfferEvent.title !== '续报还没公布，清典先收到“公开 offer”'
  || JSON.stringify(publicOfferEvent.people) !== JSON.stringify(['komatsu36/komatsu-shohei', 'komatsu36/seiten'])) {
  errors.push('semantic P1 public-offer Event must preserve the verified SP2 window, title, and people');
}
const makingOfThread = semanticThreadById.get('ore-shiri-making-of');
const makingOfNodes = (makingOfThread?.data.nodes || []).map((node) => String(node.event));
const reflectionIndex = makingOfNodes.indexOf('komatsu36/sp2-025254-seiten-reflection');
const offerIndex = makingOfNodes.indexOf('komatsu36/sp2-025404-public-offer');
const announcementIndex = makingOfNodes.indexOf('komatsu36/yt-042730-mini-event-announced');
if (!(reflectionIndex >= 0 && offerIndex === reflectionIndex + 1 && announcementIndex === offerIndex + 1)) {
  errors.push('semantic P1 making-of Thread must close 清典 reflection -> public offer -> YT announcement');
}
const announcementEvent = semanticEventById.get('yt-042730-mini-event-announced');
if (!announcementEvent?.summary.includes('声优活动加约 10～15 分钟的 mini 朗读剧')
  || !announcementEvent.summary.includes('面向来年启动制作')
  || !announcementEvent.summary.includes('主题是“ヒーローショー”')) {
  errors.push('semantic P1 announcement Event must explain the 11/15 mini event and formal fourth installment separately');
}
const bookSymbolismEvent = semanticEventById.get('yt-032708-book-symbolism');
const scriptLanguageEvent = semanticEventById.get('yt-033944-script-language');
if (!bookSymbolismEvent?.summary.includes('仍希望演员保持与台本的关系')
  || bookSymbolismEvent.summary.includes('不是防忘词工具')
  || !scriptLanguageEvent?.summary.includes('缩小版的 straight play')
  || scriptLanguageEvent.summary.includes('不是防忘词工具')) {
  errors.push('semantic P1 script-language Events must separate observed speech from the editorial interpretation');
}
const expectedThreadStoryMarkers = new Map([
  ['birthday-payback', '规则是自己立的，先被绊住的也是自己'],
  ['broken-sword', '自然得让不少观众以为本来就是演出'],
  ['ending-wont-end', '轮番把散场往后拖'],
  ['kano-ojisan', '一路累积的吐槽终于直接落在歌单上'],
  ['muro-account', '而不是“室元気本人终于来了”'],
  ['ore-shiri-making-of', '整段复盘也因此不只是“选一个最喜欢的场面”'],
  ['russian-takoyaki', '完全不知道前情的堀金蒼平一口踩雷'],
  ['shugo-yakiniku', '把一条信息极少的留言硬凑成完整祝福'],
  ['space-technical-hell', '被 2026 年的手机方向和 Space UI 折腾得够呛'],
  ['terashima-big-dream', '再认真一算——其实什么都没中'],
  ['uchida-line-call', '主直播、Space 和 LINE 电话就这样在同一通对话里碰到了一起'],
  ['yano-sunglasses', '最后干脆问能不能把它拿回来'],
]);
for (const [threadId, marker] of expectedThreadStoryMarkers) {
  if (!semanticThreadById.get(threadId)?.body.includes(marker)) {
    errors.push(`semantic P1 Thread reader-language marker is missing for ${threadId}`);
  }
}
const allThreadBodies = threadEntries.map((thread) => thread.body).join('\n');
for (const forbiddenThreadCopy of [
  '人名说法仍保留谨慎表述',
  '这里记录的是直播回顾的位置',
  '中间过程没有足够连续记录',
  '节点顺序是编辑因果顺序',
  '这条 Thread 的顺序是编辑顺序',
  '适合作为物品流转型 Thread',
  '不必再替这句话添加复杂背景',
  '事件线保留这个区别',
  '现场原声也真的出现',
  '这里不把它写成确定因果',
  '这条线把演员研究',
]) {
  if (allThreadBodies.includes(forbiddenThreadCopy)) {
    errors.push(`semantic P1 Thread prose contains editorial-desk copy: ${forbiddenThreadCopy}`);
  }
}
if (project.status === 'published') {
  const expectedProjectHref = `/projects/${project.slug}/`;
  if (!homeHtml.includes(`href="${expectedProjectHref}"`)) {
    errors.push(`homepage is missing published project link: ${expectedProjectHref}`);
  }
  if (!homeHtml.includes(project.title)) {
    errors.push(`homepage is missing published project title: ${project.title}`);
  }
}

const outputBytes = (await stat(outputFile)).size;
// RC12-N1 adds the player recovery surface; the reviewed-final editorial pass
// replaces 123 public fields with human copy, and the 2026-08-11 semantic
// first timeline audit adds nine visible Thread nodes. The 2026-08-12 event
// granularity pass adds five public Events plus their storyline projections.
// Keep an explicit ceiling rather than silently accepting arbitrary growth.
const maxOutputBytes = 377 * 1024;
if (outputBytes > maxOutputBytes) {
  errors.push(`project HTML is ${outputBytes} bytes; budget is ${maxOutputBytes} bytes`);
}

const actualSearchItems = (html.match(/\bdata-search-item(?:[=>\s])/g) || []).length;
if (actualSearchItems !== 0) {
  errors.push(`initial HTML contains ${actualSearchItems} search items; expected 0 for lazy generation`);
}

let searchPayload;
try {
  searchPayload = JSON.parse(await readFile(searchOutputFile, 'utf8'));
} catch (error) {
  errors.push(`search JSON is missing or invalid: ${searchOutputFile} (${error.message})`);
}
const searchJsonText = searchPayload ? JSON.stringify(searchPayload) : '';

const expectedSearchOrder = [
  ...publicEventEntries
    .slice()
    .sort((left, right) => String(left.data.track).localeCompare(String(right.data.track), 'en')
      || left.data.startMs - right.data.startMs
      || left.id.localeCompare(right.id, 'en'))
    .map(({ id }) => ({ kind: 'event', id })),
  ...threadEntries
    .slice()
    .sort((left, right) => Number(right.data.featured) - Number(left.data.featured)
      || left.data.title.localeCompare(right.data.title, 'zh-CN'))
    .map(({ id }) => ({ kind: 'thread', id })),
  ...peopleEntries
    .slice()
    .sort((left, right) => left.data.displayName.localeCompare(right.data.displayName, 'zh-CN'))
    .map(({ id }) => ({ kind: 'person', id })),
];

if (!searchPayload || searchPayload.schemaVersion !== 1 || searchPayload.project !== projectId || !Array.isArray(searchPayload.items)) {
  errors.push('search JSON must expose schemaVersion 1, project komatsu36, and an items array');
} else {
  const searchItems = searchPayload.items;
  if (searchItems.length !== expectedSearchItems) {
    errors.push(`search JSON contains ${searchItems.length} items; expected ${expectedSearchItems} public Event/Thread/Person items`);
  }
  const actualSearchOrder = searchItems.map((item) => ({ kind: item.kind, id: item.id }));
  if (JSON.stringify(actualSearchOrder) !== JSON.stringify(expectedSearchOrder)) {
    errors.push('search JSON order or public Event/Thread/Person membership is not stable');
  }
  for (const [index, item] of searchItems.entries()) {
    const itemKind = item?.kind;
    const allowedKeys = itemKind === 'event'
      ? new Set(['kind', 'id', 'label', 'title', 'searchText', 'trackId', 'startMs', 'preferredThreadId'])
      : new Set(['kind', 'id', 'label', 'title', 'searchText']);
    if (!item || !['event', 'thread', 'person'].includes(itemKind) || Object.keys(item).some((key) => !allowedKeys.has(key))) {
      errors.push(`search JSON item ${index} has an unexpected public field`);
    }
    if (!item || typeof item.id !== 'string' || typeof item.label !== 'string' || typeof item.title !== 'string'
      || typeof item.searchText !== 'string' || item.searchText !== item.searchText.toLocaleLowerCase('ja-JP')) {
      errors.push(`search JSON item ${index} has invalid searchable fields`);
    }
    if (item?.kind === 'event' && (typeof item.trackId !== 'string' || typeof item.startMs !== 'number')) {
      errors.push(`search JSON Event item ${index} is missing trackId/startMs`);
    }
    const expectedReaderPrefix = itemKind === 'event' ? '事件 · '
      : itemKind === 'thread' ? '故事线 · '
        : itemKind === 'person' ? '人物 · '
          : '';
    if (expectedReaderPrefix && !item.label.startsWith(expectedReaderPrefix)) {
      errors.push(`search JSON item ${index} exposes a schema label instead of reader language`);
    }
  }
  const amazonSearchItem = searchItems.find((item) => item.kind === 'event' && item.id === 'yt-040405-amazon-hama');
  const grabSearchItem = searchItems.find((item) => item.kind === 'event' && item.id === 'yt-040524-hama-grabs-amazon-card');
  const shioyaSearchItem = searchItems.find((item) => item.kind === 'person' && item.id === 'shioya-fumiyasu');
  if (!amazonSearchItem?.searchText.includes('堀金蒼平') || amazonSearchItem.searchText.includes('濱健人')) {
    errors.push('semantic P0 search index must identify 堀金, not 濱, as the Amazon winner');
  }
  if (!grabSearchItem?.searchText.includes('濱健人') || !grabSearchItem.searchText.includes('寺島惇太')) {
    errors.push('semantic P0 search index is missing the separate 濱/寺島 card-grab Event');
  }
  if (!shioyaSearchItem?.searchText.includes('しおや ふみよし') || shioyaSearchItem.searchText.includes('しおや ふみやす')) {
    errors.push('semantic P0 search index contains the wrong 汐谷 reading');
  }
}

for (const forbidden of [
  '濱与寺島同时拿到 Amazon 5000 円',
  '没带礼物的濱反而获得高价值返礼',
  '第二位中奖者在当秒没有被清晰点名',
  '此前中奖者与最后两名参加赏的排除关系',
  'しおや ふみやす',
]) {
  if (html.includes(forbidden)) errors.push(`semantic P0 published HTML contains superseded copy: ${forbidden}`);
}
for (const required of [
  'Amazon 5000 円×2：寺島与堀金同时 Bingo',
  '23 番一出，两个人同时 Bingo，正好撞上两份 Amazon 5000 円礼券。',
  '濱去抢寺島的 Amazon 卡',
  'しおや ふみよし',
]) {
  if (!html.includes(required)) errors.push(`semantic P0 published HTML is missing corrected copy: ${required}`);
}
if (!html.includes('本场常用称呼') || html.includes('本场别名')) {
  errors.push('semantic P1 Person UI must label visible callNames as 本场常用称呼');
}
for (const removedHonorific of ['狩野さん', '井上君', '矢野さん', '光富さん', '熊谷君', '伊藤さん', '観世君', 'むろさん', '清典さん', '山本さん']) {
  if (html.includes(removedHonorific) || searchJsonText.includes(removedHonorific)) {
    errors.push(`semantic P1 published output contains removed honorific alias: ${removedHonorific}`);
  }
}
if (!html.includes('トシピ') || !searchJsonText.includes('トシピ')
  || !html.includes('タカオ') || !searchJsonText.includes('タカオ')) {
  errors.push('semantic P1 must publish and index the verified call names トシピ and タカオ');
}
const accountChipCount = (html.match(/>室元気账号<\/button>/g) || []).length;
if (accountChipCount !== expectedAccountContextEvents.size
  || !html.includes('这段只能确认使用的是室元気的账号，实际说话者未确认。')) {
  errors.push(`semantic P1 account identity projection is incomplete: ${accountChipCount} account chips`);
}
for (const requiredStoryCopy of [
  '续报还没公布，清典先收到“公开 offer”',
  '声优活动加约 10～15 分钟的 mini 朗读剧',
  '面向来年启动制作',
  '缩小版的 straight play',
]) {
  if (!html.includes(requiredStoryCopy)) errors.push(`semantic P1 story completion is missing: ${requiredStoryCopy}`);
}
if (html.includes('土岐隼一') || searchJsonText.includes('土岐隼一')) {
  errors.push('semantic P1 published output must not restore the rejected 土岐隼一 reading');
}

const actualSourceEventButtons = (html.match(/data-source-event="/g) || []).length;
if (actualSourceEventButtons !== 0) {
  errors.push(`source event index contains ${actualSourceEventButtons} initial buttons; expected 0 for lazy generation`);
}

const actualSourceBrowseButtons = (html.match(/data-source-browse="/g) || []).length;
if (actualSourceBrowseButtons !== expectedTrackIds.size) {
  errors.push(`source browse shell contains ${actualSourceBrowseButtons} buttons; expected ${expectedTrackIds.size} tracks`);
}

const actualSourceLists = [...html.matchAll(/data-source-event-list="([^"]+)"/g)].map((match) => match[1]);
if (actualSourceLists.length !== expectedTrackIds.size || actualSourceLists.some((trackId) => !expectedTrackIds.has(trackId))) {
  errors.push(`source event list hosts are ${actualSourceLists.join(', ')}; expected one host for each public track`);
}

// RC12-B2 publication contract: every reader-facing expandable title must have
// exactly one hidden inline control wired to a real DOM target. This is a
// structural check for the built artifact; overflow and click behavior remain
// Browser consumer checks because they depend on the rendered viewport.
const readAttribute = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? null;
const expandableTags = [...html.matchAll(/<[^>]*data-inline-expandable="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const expandableEntries = expandableTags.map((tag) => ({
  id: readAttribute(tag, 'id'),
  key: readAttribute(tag, 'data-inline-expandable'),
}));
const expandableIds = new Set(expandableEntries.map(({ id }) => id).filter(Boolean));
const expandableKeys = new Set(expandableEntries.map(({ key }) => key).filter(Boolean));
const toggleTags = [...html.matchAll(/<button[^>]*data-inline-text-toggle="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const toggleEntries = toggleTags.map((tag) => ({
  key: readAttribute(tag, 'data-inline-text-toggle'),
  controls: readAttribute(tag, 'aria-controls'),
  expanded: readAttribute(tag, 'aria-expanded'),
  hidden: /\bhidden(?:\s|=|>)/.test(tag),
}));

const expectedInlineKeys = [
  'source-title-yt-main',
  'source-title-space-1',
  'source-title-space-2',
  'timeline-current-title',
  ...Array.from({ length: 8 }, (_, index) => `act-title-act-${String(index + 1).padStart(2, '0')}`),
];
if (expandableEntries.some(({ id, key }) => !id || !key)) {
  errors.push('inline expandable title is missing id or data-inline-expandable');
}
if (new Set(expandableEntries.map(({ id }) => id)).size !== expandableEntries.length) {
  errors.push('inline expandable titles contain duplicate DOM ids');
}
if (expandableKeys.size !== expectedInlineKeys.length
  || expectedInlineKeys.some((key) => !expandableKeys.has(key))) {
  errors.push(`inline expandable title keys are ${[...expandableKeys].join(', ')}; expected RC12-B2 Act/Timeline/Source coverage`);
}
if (toggleEntries.length !== expandableEntries.length) {
  errors.push(`inline text toggle count is ${toggleEntries.length}; expected one toggle per expandable title (${expandableEntries.length})`);
}
for (const { key, controls, expanded, hidden } of toggleEntries) {
  if (!key || !expandableKeys.has(key)) errors.push(`inline text toggle targets unknown expandable key: ${key || '(missing)'}`);
  if (!controls || !expandableIds.has(controls)) errors.push(`inline text toggle ${key || '(missing)'} targets missing DOM id: ${controls || '(missing)'}`);
  if (expanded !== 'false') errors.push(`inline text toggle ${key || '(missing)'} must initialize aria-expanded="false"`);
  if (!hidden) errors.push(`inline text toggle ${key || '(missing)'} must initialize hidden`);
}
const toggleKeys = new Set(toggleEntries.map(({ key }) => key).filter(Boolean));
if (toggleKeys.size !== toggleEntries.length) errors.push('inline text toggles contain duplicate data-inline-text-toggle keys');
for (const key of expandableKeys) {
  if (!toggleKeys.has(key)) errors.push(`expandable title ${key} is missing its inline text toggle`);
}

const controllerMatch = html.match(
  /<script type="application\/json" data-archive-controller-data[^>]*>([\s\S]*?)<\/script>/,
);
if (!controllerMatch) {
  errors.push('archive controller JSON is missing');
} else {
  try {
    const controller = JSON.parse(controllerMatch[1]);
    const controllerEvents = controller.events || {};
    const expectedEventIds = new Set(publicEventEntries.map(({ id }) => id));
    const actualEventIds = Object.keys(controllerEvents);
    if (actualEventIds.length !== expectedEventIds.size) {
      errors.push(`controller contains ${actualEventIds.length} events; expected ${expectedEventIds.size} public events`);
    }
    for (const { id, data } of publicEventEntries) {
      const event = controllerEvents[id];
      if (!event) {
        errors.push(`controller is missing public Event ${id}`);
        continue;
      }
      const expectedTrackId = data.track.split('/').at(-1) || data.track;
      if (event.trackId !== expectedTrackId || typeof event.startMs !== 'number' || typeof event.title !== 'string') {
        errors.push(`controller Event ${id} is missing stable trackId/startMs/title fields`);
      }
    }
    for (const id of actualEventIds) {
      if (!expectedEventIds.has(id)) errors.push(`controller exposes unexpected or withheld Event ${id}`);
    }
  } catch (error) {
    errors.push(`archive controller JSON is invalid: ${error.message}`);
  }
}

const expectedEventsByTrack = new Map();
for (const { id, data } of publicEventEntries) {
  const trackId = String(data.track).split('/').at(-1) || String(data.track);
  const list = expectedEventsByTrack.get(trackId) || [];
  list.push({ id, startMs: data.startMs });
  expectedEventsByTrack.set(trackId, list);
}
for (const [trackId, entries] of expectedEventsByTrack) {
  entries.sort((left, right) => left.startMs - right.startMs || left.id.localeCompare(right.id, 'en'));
}
const expectedTimelineTrackIds = ['yt-main', 'space-1', 'space-2'];
if (!controllerMatch) {
  errors.push('RC12-E controller track projection cannot be checked without controller JSON');
} else {
  try {
    const controller = JSON.parse(controllerMatch[1]);
    if (/["'](?:offset|offsetMs|offsetSeconds|globalOffset|globalStartMs)["']\s*:/i.test(JSON.stringify(controller))) {
      errors.push('RC12-E controller must not publish cross-source offset fields');
    }
    const controllerTracks = controller.tracks || {};
    for (const trackId of expectedTimelineTrackIds) {
      const track = controllerTracks[trackId];
      if (!track) {
        errors.push(`RC12-E controller is missing track projection ${trackId}`);
        continue;
      }
      if (track.clock !== 'native') errors.push(`RC12-E track ${trackId} must declare native clock`);
      const expectedIds = (expectedEventsByTrack.get(trackId) || []).map(({ id }) => id);
      const actualIds = Object.values(controller.events || {})
        .filter((event) => event.trackId === trackId)
        .sort((left, right) => left.startMs - right.startMs || left.id.localeCompare(right.id, 'en'))
        .map((event) => event.id);
      if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
        errors.push(`RC12-E event projection for ${trackId} is not complete or stably ordered`);
      }
    }
    const unexpectedTrackIds = [...expectedEventsByTrack.keys()].filter((trackId) => !expectedTimelineTrackIds.includes(trackId));
    if (unexpectedTrackIds.length) errors.push(`RC12-E found unexpected event track ids: ${unexpectedTrackIds.join(', ')}`);
  } catch (error) {
    errors.push(`RC12-E controller track projection is invalid: ${error.message}`);
  }
}

const actualTimelineScopeButtons = (html.match(/data-timeline-scope-button="/g) || []).length;
const actualTimelineScopePanels = (html.match(/data-timeline-scope-panel="/g) || []).length;
if (actualTimelineScopeButtons !== expectedTimelineTrackIds.length) {
  errors.push(`RC12-E timeline scope has ${actualTimelineScopeButtons} buttons; expected ${expectedTimelineTrackIds.length}`);
}
if (actualTimelineScopePanels !== expectedTimelineTrackIds.length) {
  errors.push(`RC12-E timeline scope has ${actualTimelineScopePanels} panels; expected ${expectedTimelineTrackIds.length}`);
}
const timelineScopePanelIds = new Set(
  [...html.matchAll(/<[^>]*data-timeline-scope-panel="[^"]+"[^>]*>/g)]
    .map((match) => readAttribute(match[0], 'id'))
    .filter(Boolean),
);
const timelineScopePanelTags = [...html.matchAll(/<[^>]*data-timeline-scope-panel="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
for (const tag of timelineScopePanelTags) {
  const key = readAttribute(tag, 'data-timeline-scope-panel');
  const labelledBy = readAttribute(tag, 'aria-labelledby');
  const hidden = readAttribute(tag, 'aria-hidden');
  const expectedHidden = key === expectedTimelineTrackIds[0] ? 'false' : 'true';
  if (!['true', 'false'].includes(hidden || '')) errors.push(`RC12-E panel ${key || '(missing)'} must expose aria-hidden`);
  else if (hidden !== expectedHidden) errors.push(`RC12-E panel ${key || '(missing)'} has unexpected initial aria-hidden=${hidden}`);
  if (!labelledBy || !htmlIds.has(labelledBy)) errors.push(`RC12-E panel ${key || '(missing)'} has invalid aria-labelledby`);
}
const timelineScopeButtonTags = [...html.matchAll(/<button[^>]*data-timeline-scope-button="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
for (const tag of timelineScopeButtonTags) {
  const key = readAttribute(tag, 'data-timeline-scope-button');
  const controls = readAttribute(tag, 'aria-controls');
  if (readAttribute(tag, 'type') !== 'button') errors.push(`RC12-E scope ${key || '(missing)'} must be a button`);
  if (!['true', 'false'].includes(readAttribute(tag, 'aria-pressed') || '')) errors.push(`RC12-E scope ${key || '(missing)'} must expose aria-pressed`);
  if (!controls || !timelineScopePanelIds.has(controls)) errors.push(`RC12-E scope ${key || '(missing)'} has invalid aria-controls`);
  if (!readAttribute(tag, 'aria-label')) errors.push(`RC12-E scope ${key || '(missing)'} is missing an accessible label`);
}
const timelineScopeDescriptionTag = html.match(/<p[^>]*data-timeline-scope-description[^>]*>/)?.[0];
if (!timelineScopeDescriptionTag || readAttribute(timelineScopeDescriptionTag, 'aria-live') !== 'polite') {
  errors.push('RC12-E scope description must expose aria-live=polite');
}

// RC12-T1 static contract: the YT 8-Act Navigator keeps one duration-ratio
// segment per Act and exposes a complete visible tooltip payload for each
// segment. Geometry, hover/focus visibility and narrow-container projection
// remain rendered Browser checks.
const timelineSegmentTags = [...html.matchAll(/<button[^>]*data-timeline-navigator-segment="[^"]+"[^>]*>/g)]
  .map((match) => match[0]);
const timelineTooltipCount = (html.match(/data-timeline-navigator-tooltip/g) || []).length;
if (timelineSegmentTags.length !== 8) {
  errors.push(`RC12-T1 Navigator has ${timelineSegmentTags.length} segment buttons; expected 8`);
}
if (timelineTooltipCount !== 8) {
  errors.push(`RC12-T1 Navigator has ${timelineTooltipCount} tooltip markers; expected 8`);
}
for (const tag of timelineSegmentTags) {
  if (!readAttribute(tag, 'aria-label')?.startsWith('跳转到 ACT ')) {
    errors.push('RC12-T1 Navigator segment is missing its complete accessible label');
  }
}
if ((html.match(/data-timeline-navigator-tooltip[^>]*role="tooltip"/g) || []).length !== 8) {
  errors.push('RC12-T1 Navigator tooltips must expose role="tooltip"');
}

// RC12-MT1 static contract: mobile keeps a single current-Act locator and an
// eight-item directory, while every public Event receives a separate reading
// trigger. The desktop T1 segments remain exactly eight and are not reused for
// the mobile directory.
const mobileActToggleCount = (html.match(/data-mobile-act-toggle/g) || []).length;
const mobileActMenuCount = (html.match(/data-mobile-act-menu/g) || []).length;
const mobileActOptionCount = (html.match(/data-mobile-act-option="[^"]+"/g) || []).length;
const mobileEventDetailCount = (html.match(/data-event-detail="[^"]+"/g) || []).length;
const mobileActEventCount = (html.match(/class="act-event-count"/g) || []).length;
if (mobileActToggleCount !== 1 || mobileActMenuCount !== 1) {
  errors.push(`RC12-MT1 mobile Act Locator has ${mobileActToggleCount} toggles and ${mobileActMenuCount} menus; expected 1 each`);
}
if (mobileActOptionCount !== 8) {
  errors.push(`RC12-MT1 mobile Act directory has ${mobileActOptionCount} options; expected 8`);
}
if (mobileEventDetailCount !== publicEventEntries.length) {
  errors.push(`RC12-MT1 has ${mobileEventDetailCount} Event reading triggers; expected ${publicEventEntries.length}`);
}
if (mobileActEventCount !== 8) {
  errors.push(`RC12-MT1 has ${mobileActEventCount} Act Event counts; expected 8`);
}

// RC12-T1.1 product correction: Navigator remains an inline child of the
// Timeline content column. Guard against reintroducing the rejected JS/CSS
// shell breakout or coupling Player sticky geometry to Navigator height.
const timelineShellSource = await readFile(path.resolve('src/components/project/ProjectArchiveShell.astro'), 'utf8');
const timelineNavigatorSource = await readFile(path.resolve('src/components/project/TimelineNavigator.astro'), 'utf8');
const timelineCssSource = await readFile(path.resolve('src/styles/project.css'), 'utf8');
const rejectedTimelineGeometryTokens = [
  'applyTimelineNavigatorGeometry',
  '--timeline-navigator-margin-start',
  '--timeline-navigator-margin-end',
  '--timeline-player-sticky-top',
  'data-timeline-geometry',
];
const timelineGeometrySources = `${timelineShellSource}\n${timelineNavigatorSource}\n${timelineCssSource}`;
for (const token of rejectedTimelineGeometryTokens) {
  if (timelineGeometrySources.includes(token)) {
    errors.push(`RC12-T1.1 rejected shell-breakout token is present: ${token}`);
  }
}
if (!/\.timeline-navigator\s*\{[\s\S]*?padding:\s*14px 14px 12px;/.test(timelineCssSource)) {
  errors.push('RC12-T1.1 Navigator must keep the 14px horizontal safe inset');
}
if (!/\.project-player-column\s*\{[\s\S]*?top:\s*96px;/.test(timelineCssSource)) {
  errors.push('RC12-T1.1 expanded Player must keep its independent 96px sticky top');
}
if (!/\.timeline-navigator__mobile-toggle\s*\{[\s\S]*?min-height:\s*46px;/.test(timelineCssSource)) {
  errors.push('RC12-MT1 mobile Act Locator must keep its 46px tap/readability target');
}
if (!/@media \(max-width:\s*600px\)[\s\S]*?\.timeline-event\s*\{[\s\S]*?grid-template-columns:\s*76px minmax\(0, 1fr\);/.test(timelineCssSource)) {
  errors.push('RC12-MT1 mobile Event must keep the 76px time rail and content column');
}
if (!timelineShellSource.includes("closest<HTMLElement>('[data-mobile-act-option]')")
  || !timelineShellSource.includes("else this.selectEvent(eventId, true, false)")) {
  errors.push('RC12-MT1 controller must preserve Act-directory navigation and title-as-reading selection');
}

// RC12 final interaction cleanup: the Player must not publish the obsolete
// YouTube Act duplicate, while Space context remains explicitly relational.
if (html.includes('这一段在讲什么')) {
  errors.push('RC12 final cleanup found obsolete YouTube Player Act Context copy');
}
if (!html.includes('data-player-context-label') || !html.includes('READING CONTEXT')) {
  errors.push('RC12 final cleanup is missing the relational Space context label');
}
if (!timelineShellSource.includes('dismissPersonForTransition()')
  || !timelineShellSource.includes('dismissThreadForTransition()')
  || !timelineShellSource.includes("else if (personId) this.openPerson(personId, null, false)")) {
  errors.push('RC12 final cleanup overlay transition invariant is missing');
}

// RC12-P1-C/D final polish: reader-facing Chinese taxonomy labels use the
// small serif taxonomy token, while source detail remains a native disclosure.
const archiveLabelCount = (html.match(/archive-taxonomy/g) || []).length;
if (archiveLabelCount < 8) {
  errors.push(`RC12-P1-C has ${archiveLabelCount} Chinese label tokens; expected at least 8`);
}
if (!timelineCssSource.includes('.archive-taxonomy')) {
  errors.push('RC12-P1-C CSS is missing the archive-taxonomy typography token');
}
if (html.includes('archive-label-zh') || timelineCssSource.includes('.archive-label-zh')) {
  errors.push('RC12-P1-C obsolete archive-label-zh token is still published');
}
if (!timelineShellSource.includes('navigateEventToTimeline(')
  || !timelineShellSource.includes("button.addEventListener('click', () => this.navigateEventToTimeline")) {
  errors.push('RC12-PA1 Thread nodes and Player action must share the source-scoped Timeline navigation path');
}
if (!html.includes('event-thread-chooser')) {
  errors.push('RC12-P0 multi-thread Event CTA chooser is missing');
}
const mediaDisclosureTags = [...html.matchAll(/<details[^>]*class="media-sources__disclosure"[^>]*>/g)];
if (mediaDisclosureTags.length !== 1) {
  errors.push(`RC12-P1-D has ${mediaDisclosureTags.length} Media Sources disclosures; expected 1`);
}
if (!html.includes('查看 3 个媒体来源、时长与来源证明')) {
  errors.push('RC12-P1-D disclosure summary is missing the reader-facing source scope');
}
if (!html.includes('data-source-event-index')) {
  errors.push('RC12-P1-D must retain the Source Event Index hook inside the disclosure');
}

// RC12-Y1 static contract: both the visible player fallback and the player
// context rail must use the managed pause-before-handoff hook. The hook is
// intentionally independent from the external link's noopener default.
const externalHandoffCount = (html.match(/data-external-youtube-handoff/g) || []).length;
if (externalHandoffCount !== 2) {
  errors.push(`RC12-Y1 external handoff hooks are ${externalHandoffCount}; expected player fallback + context rail`);
}

// The built HTML proves that both reader-facing links carry the handoff hook,
// while this source contract protects the runtime side of Y1 from being
// reduced to a marker-only implementation during later refactors.
const archiveShellSource = await readFile(path.resolve('src/components/project/ProjectArchiveShell.astro'), 'utf8');
const handoffStart = archiveShellSource.indexOf('\n    pauseEmbeddedForExternalHandoff()');
const handoffEnd = handoffStart >= 0
  ? archiveShellSource.indexOf('\n    syncFromPlayer()', handoffStart)
  : -1;
const handoffSource = handoffStart >= 0 && handoffEnd > handoffStart
  ? archiveShellSource.slice(handoffStart, handoffEnd)
  : '';
if (!handoffSource) errors.push('RC12-Y1 pause-before-handoff method is missing or cannot be scoped');
if (!/this\.pendingSeekMs\s*=\s*null/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must clear pendingSeekMs before external navigation');
}
if (!/this\.stopPlaybackSync\(\)/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must stop playback sync before external navigation');
}
if (!/this\.player\.pauseVideo\(\)/.test(handoffSource)) {
  errors.push('RC12-Y1 handoff must call pauseVideo when the player is ready');
}

// RC12-M1 static contract: mobile uses an out-of-flow Bubble launcher and a
// compliant floating panel. Bubble is presentation state, never a hidden
// background-audio player, and desktop keeps its expanded/docked contract.
const archivePlayerSource = await readFile(path.resolve('src/components/project/ArchivePlayer.astro'), 'utf8');
const playerActionSource = await readFile(path.resolve('src/components/project/PlayerContextRail.astro'), 'utf8');
if (playerActionSource.includes('data-player-rail-act')
  || playerActionSource.includes('>节点<')
  || playerActionSource.includes('>线索<')
  || playerActionSource.includes('>原链<')) {
  errors.push('RC12-PA1 Player Action Bar still exposes an obsolete archive-entity action');
}
for (const token of ['data-player-rail-timeline-label', 'data-player-rail-thread-label', 'data-player-rail-source-label']) {
  if (!playerActionSource.includes(token)) errors.push(`RC12-PA1 Player Action Bar is missing ${token}`);
}
if (!timelineShellSource.includes("this.navigateEventToTimeline(this.selectedEventId)")
  || !timelineShellSource.includes("this.activeView === 'timeline' ? '定位此处' : '查看时间线'")
  || !timelineShellSource.includes("track?.playback.provider === 'external' ? 'X 回放 ↗' : 'YouTube ↗'")) {
  errors.push('RC12-PA1 controller is missing reader-facing Timeline or provider-aware Source actions');
}
if (timelineShellSource.includes('is-current-destination') || timelineCssSource.includes('.is-current-destination')) {
  errors.push('RC12-PA1 Player actions must not publish persistent tab-like destination state');
}
if (!/\.player-context-rail\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/.test(timelineCssSource)
  || !/data-player-mode='docked'[\s\S]*?grid-template-columns:\s*repeat\(3, 64px\);/.test(timelineCssSource)
  || timelineCssSource.includes('@container player-column (max-width: 379px)')) {
  errors.push('RC12-PA1 CSS must keep a 3-column expanded footer and 3x64px docked action area without the old rail branch');
}
if (!archivePlayerSource.includes('<PlayerContextRail />\n  <section class="archive-player__context"')) {
  errors.push('RC12-PA1 Player Action Bar must sit immediately after TARGET inside the Player');
}
const playerBubbleTags = [...html.matchAll(/<button[^>]*data-player-bubble[^>]*>/g)].map((match) => match[0]);
if (playerBubbleTags.length !== 1) errors.push(`RC12-M1 has ${playerBubbleTags.length} Bubble launchers; expected 1`);
else {
  const bubbleTag = playerBubbleTags[0];
  if (readAttribute(bubbleTag, 'aria-controls') !== 'archive-player-panel'
    || readAttribute(bubbleTag, 'aria-expanded') !== 'false') {
    errors.push('RC12-M1 Bubble launcher must control archive-player-panel and expose collapsed aria state');
  }
}
if (!archivePlayerSource.includes('id="archive-player-panel"')) {
  errors.push('RC12-M1 floating panel is missing its stable aria-controls target');
}
if ((html.match(/data-player-mount/g) || []).length !== 1) {
  errors.push('RC12-M1 must retain exactly one player mount');
}
for (const [label, pattern] of [
  ['rejected sticky mini-player top', /has-active-event\s+\.project-player-column\s*\{[\s\S]*?top:\s*59px/],
  ['rejected 132px mini-player media width', /has-active-event[\s\S]{0,900}?width:\s*132px/],
  ['rejected 84px mini-player media height', /has-active-event[\s\S]{0,900}?height:\s*84px/],
]) {
  if (pattern.test(timelineCssSource)) errors.push(`RC12-M1 CSS contains ${label}`);
}
for (const [label, pattern] of [
  ['mobile Bubble fixed placement', /data-player-mode='bubble'[\s\S]*?width:\s*56px/],
  ['mobile safe-area placement', /bottom:\s*calc\(18px \+ env\(safe-area-inset-bottom\)\)/],
  ['mobile compliant viewport minimum', /data-player-mode='expanded'[\s\S]*?min-height:\s*200px/],
  ['mobile floating panel viewport cap', /max-height:\s*calc\(100dvh - 32px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)\)/],
]) {
  if (!pattern.test(timelineCssSource)) errors.push(`RC12-M1 CSS is missing ${label}`);
}
const mobileCollapseStart = archiveShellSource.indexOf('\n    pauseForMobileBubble()');
const mobileCollapseEnd = mobileCollapseStart >= 0
  ? archiveShellSource.indexOf('\n    restoreMobileResumePosition()', mobileCollapseStart)
  : -1;
const mobileCollapseSource = mobileCollapseStart >= 0 && mobileCollapseEnd > mobileCollapseStart
  ? archiveShellSource.slice(mobileCollapseStart, mobileCollapseEnd)
  : '';
if (!mobileCollapseSource) errors.push('RC12-M1 pauseForMobileBubble method is missing or cannot be scoped');
for (const [label, pattern] of [
  ['clear pending seek', /this\.pendingSeekMs\s*=\s*null/],
  ['capture current time', /this\.player\.getCurrentTime\(\)/],
  ['stop playback sync', /this\.stopPlaybackSync\(\)/],
  ['pause embedded video', /this\.player\.pauseVideo\(\)/],
]) {
  if (mobileCollapseSource && !pattern.test(mobileCollapseSource)) errors.push(`RC12-M1 collapse must ${label}`);
}
if (!/PlayerPresentationMode\s*=\s*'expanded'\s*\|\s*'docked'\s*\|\s*'bubble'/.test(archiveShellSource)) {
  errors.push('RC12-M1 controller must expose the three bounded presentation modes');
}
if (!/playerEvent\.data === YT\.PlayerState\.PLAYING && this\.playerPresentationMode === 'bubble'/.test(archiveShellSource)) {
  errors.push('RC12-M1 must reject provider playback while collapsed to Bubble');
}

const forbiddenPublicationMarkers = [
  ['raw ASR file marker', /external_asr_raw/i],
  ['X author identifier', /author_id/i],
  ['private source root', /E:\\AI_Subtitle_Studio/i],
  ['private source root with forward slashes', /E:\/AI_Subtitle_Studio/i],
  ['process archive filename', /小松昌平生日会流程-所有对话存档/i],
  ['subtitle filename', /(?:^|[\s"'=\/\\])[^\s"'=<>]*\.(?:srt|vtt)(?:[\s"'<>]|$)/i],
  ['internal publication status label', /(?:已复核|有限定)/],
  ['internal transcript policy', /transcriptPolicy\s*:/i],
];

for (const [label, pattern] of forbiddenPublicationMarkers) {
  if (pattern.test(html)) errors.push(`published HTML contains ${label}`);
}

for (const [label, pattern] of forbiddenPublicationMarkers) {
  if (pattern.test(searchJsonText)) errors.push(`search JSON contains ${label}`);
}

const publishedReaderText = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ');

for (const forbidden of [
  'PROJECT ARCHIVE · EDITORIAL BUILD',
  'EVENTS · NATIVE CLOCK',
  '仅索引已公开的 Event、Thread 与 Person',
  'ACCOUNT APPEARANCE',
  'REMOTE CALL',
  'SUBMISSION',
  '规则边玩边修补，口令也现场改变',
  '规则不断 patch',
  '并不是早先误听成的“挂毯”',
]) {
  if (publishedReaderText.includes(forbidden)) {
    errors.push(`semantic P1 published UI contains superseded reader-facing label: ${forbidden}`);
  }
}

for (const required of [
  '36TH BIRTHDAY · LIVE ARCHIVE',
  'CHRONOLOGICAL CANON · SOURCE-LOCAL CLOCKS',
  'TIMELINE SCOPE',
  'CONTEXT RECONSTRUCTION',
  'CURRENT SOURCE',
  'SOURCE',
  'READING CONTEXT',
  '此来源的事件',
  'STORY THREAD ·',
  '主直播时长',
  '独立媒体',
  '故事线',
  '只搜索已经公开的事件、故事线和人物',
  '每个人物页都会汇总他在主直播、Space 与《俺知》复盘中出现的相关片段。',
  'Bingo 规则越玩越多，口令也临时改掉',
  '一开始每人一张卡，同一时刻多人 Bingo 的单份奖品会流局；玩到后面又临时加入“double Bingo 优先”。',
  '第二轮 64 号由光富崇雄中奖，奖品是新選組／瀬戸焼き“誠”杯类物件。',
]) {
  if (!publishedReaderText.includes(required)) {
    errors.push(`semantic P1 published UI is missing reader-facing label: ${required}`);
  }
}

for (const event of publicEvents) {
  if (event.qualification && html.includes(event.qualification)) {
    errors.push(`published HTML contains internal qualification for event ${event.title}`);
  }
  if (event.qualification && searchJsonText.includes(event.qualification)) {
    errors.push(`search JSON contains internal qualification for event ${event.title}`);
  }
}

for (const required of [
  'https://x.com/i/status/2043996150802592097',
  'https://x.com/i/status/2044007616284897782',
  'https://x.com/i/spaces/1dKrPEwrAoQJX',
  'https://x.com/i/spaces/1OxwblPnkDDJB',
  '媒体来源',
  '查看 3 个媒体来源、时长与来源证明',
  'data-source-track="yt-main"',
  'data-source-track="space-1"',
  'data-source-track="space-2"',
  'data-source-browse="yt-main"',
  'data-source-browse="space-1"',
  'data-source-browse="space-2"',
  'data-source-event-index',
  'data-player-current',
  '逐字稿暂不公开',
]) {
  if (!html.includes(required)) errors.push(`published HTML is missing required public marker: ${required}`);
}

if (errors.length) {
  console.error('Publication validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Publication validation passed (${outputBytes} bytes, ${searchPayload?.items?.length || 0} search JSON items, ${actualSourceEventButtons} initial source event buttons, ${expandableEntries.length} RC12-B2 expandable title contracts, ${actualTimelineScopeButtons} RC12-E timeline scopes, controller coverage verified, no private source markers).`,
);
