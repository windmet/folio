import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const expected = new Map([
  ['birthday-payback', '最早立规则的人，最后正好被自己的规则绊住'],
  ['broken-sword', '自然得让不少观众以为本来就是演出'],
  ['ending-wont-end', '节目反而进入最长的尾声'],
  ['kano-ojisan', '这条不断累积的おじさん线才终于落到歌单上'],
  ['muro-account', '连说话的人究竟是谁都不能完全确定'],
  ['ore-shiri-making-of', '最后拼出了《俺知》动作与朗读形式是怎样一起被做出来的'],
  ['russian-takoyaki', '这颗章鱼烧终于走完了整条回收线'],
  ['shugo-yakiniku', '把一条信息极少的留言硬凑成完整祝福'],
  ['space-technical-hell', '最后被 2026 年的手机方向和 Space UI 打败'],
  ['terashima-big-dream', 'Big Dream 从八千万妄想一路回到零'],
  ['uchida-line-call', '主直播、Space 和电话三条线在这一刻真的汇到一起'],
  ['yano-sunglasses', '又顺势问能不能把它拿回来'],
]);
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readThread = async (page, threadId) => page.locator(`[data-thread-detail="${threadId}"]`).evaluate((detail) => ({
  hidden: detail.hidden,
  title: detail.querySelector('h2')?.textContent?.trim(),
  body: detail.querySelector('.thread-prose')?.textContent?.replace(/\s+/g, ' ').trim(),
  nodeCount: detail.querySelectorAll('[data-thread-event-id]').length,
}));

try {
  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  const desktopEvidence = {};
  let maxDesktopOverflow = 0;

  for (const [threadId, marker] of expected) {
    await desktop.goto(`${projectUrl}?view=storylines&thread=${threadId}`, { waitUntil: 'networkidle' });
    const detail = await readThread(desktop, threadId);
    const overflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(!detail.hidden && detail.body.includes(marker), `${threadId} did not restore its approved reader story: ${JSON.stringify(detail)}`);
    assert(detail.nodeCount >= 2, `${threadId} lost its Event nodes`);
    assert(overflow === 0, `${threadId} desktop overflow: ${overflow}`);
    maxDesktopOverflow = Math.max(maxDesktopOverflow, overflow);
    desktopEvidence[threadId] = { title: detail.title, nodeCount: detail.nodeCount, marker };
  }

  await desktop.goto(`${projectUrl}?view=storylines&thread=uchida-line-call`, { waitUntil: 'networkidle' });
  await desktop.locator('[data-thread-detail="uchida-line-call"] [data-thread-event-id="sp2-011242-uchida-connected"]').click();
  assert(new URL(desktop.url()).searchParams.get('event') === 'sp2-011242-uchida-connected', 'Thread Event interaction did not navigate to the SP2 Event');
  const interactionUrl = desktop.url();
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  if (outputDir) {
    await desktop.goto(`${projectUrl}?view=storylines&thread=ending-wont-end`, { waitUntil: 'networkidle' });
    await desktop.screenshot({ path: path.join(outputDir, '1440x900-ending-thread.png'), fullPage: false });
  }

  const mobileLogs = [];
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(mobile, mobileLogs);
  const mobileEvidence = {};
  for (const threadId of ['birthday-payback', 'russian-takoyaki', 'uchida-line-call']) {
    await mobile.goto(`${projectUrl}?view=storylines&thread=${threadId}`, { waitUntil: 'networkidle' });
    const detail = await readThread(mobile, threadId);
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(!detail.hidden && detail.body.includes(expected.get(threadId)), `${threadId} mobile story failed`);
    assert(overflow === 0, `${threadId} mobile overflow: ${overflow}`);
    mobileEvidence[threadId] = { nodeCount: detail.nodeCount, overflow };
  }
  assert(mobileLogs.length === 0, `mobile console errors: ${mobileLogs.join(' | ')}`);
  if (outputDir) {
    await mobile.goto(`${projectUrl}?view=storylines&thread=birthday-payback`, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(outputDir, '390-birthday-thread.png'), fullPage: false });
  }

  console.log(JSON.stringify({
    desktop: { threads: desktopEvidence, maxOverflow: maxDesktopOverflow, console: desktopLogs },
    interactionUrl,
    mobile: { threads: mobileEvidence, console: mobileLogs },
    outputDir,
  }, null, 2));
} finally {
  await browser.close();
}
