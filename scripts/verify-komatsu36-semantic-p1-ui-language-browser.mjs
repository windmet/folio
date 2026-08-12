import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const forbiddenReaderLabels = [
  'PROJECT ARCHIVE · EDITORIAL BUILD',
  'ACCOUNT APPEARANCE',
  'REMOTE CALL',
  'SUBMISSION',
];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const visibleText = (page) => page.locator('body').innerText();
const domText = (page) => page.locator('body').textContent();
const assertNoForbidden = async (page, label) => {
  const body = await domText(page);
  for (const forbidden of forbiddenReaderLabels) {
    assert(!body.includes(forbidden), `${label} still exposes ${forbidden}`);
  }
};
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const browser = await chromium.launch({ headless: true });
try {
  const evidence = {};
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const label = `${viewport.width}x${viewport.height}`;
    const logs = [];
    const page = await browser.newPage({ viewport });
    attachLogChecks(page, logs);

    await page.goto(`${projectUrl}?view=overview`, { waitUntil: 'networkidle' });
    let body = await domText(page);
    assert(body.includes('36TH BIRTHDAY · LIVE ARCHIVE'), `${label} missing archive eyebrow`);
    assert(body.includes('这场近五小时直播最有趣的地方'), `${label} missing reader-facing Overview introduction`);
    assert(body.includes('CURRENT SOURCE') && body.includes('SOURCE'), `${label} missing player structural labels`);
    assert(body.includes('此来源的事件'), `${label} missing source index reader label`);

    await page.goto(`${projectUrl}?view=timeline&track=space-1`, { waitUntil: 'networkidle' });
    body = await visibleText(page);
    assert(body.includes('CHRONOLOGICAL CANON · SOURCE-LOCAL CLOCKS'), `${label} missing Timeline structural heading`);
    assert(body.includes('TIMELINE SCOPE'), `${label} missing Timeline source chooser`);
    assert(body.includes('8 个事件 · 原视频时间'), `${label} missing source-local reader clock label`);

    await page.goto(`${projectUrl}?view=storylines&thread=bingo-payback`, { waitUntil: 'networkidle' });
    const threadText = await page.locator('[data-thread-detail="bingo-payback"]').innerText();
    assert(threadText.includes('STORY THREAD ·') && threadText.includes('前后回收'), `${label} missing mapped Thread category`);
    assert(threadText.includes('起点') && threadText.includes('发展') && threadText.includes('回收'), `${label} missing mapped Thread roles`);

    await page.goto(`${projectUrl}?view=people&person=uchida-shuichi`, { waitUntil: 'networkidle' });
    const participationText = await page.locator('[data-person-detail="uchida-shuichi"] .person-participation').innerText();
    assert(participationText.includes('LINE 电话'), `${label} missing mapped participation label`);
    assert(!participationText.includes('remote call'), `${label} exposes raw participation enum`);

    await page.goto(projectUrl, { waitUntil: 'networkidle' });
    const search = page.locator('[data-archive-search]');
    await search.fill('章鱼烧');
    await page.locator('[data-search-item]').first().waitFor();
    const eventAndThreadLabels = await page.locator('[data-search-item] > span').allTextContents();
    assert(eventAndThreadLabels.some((value) => value.startsWith('事件 · ')), `${label} search lacks Event reader label`);
    assert(eventAndThreadLabels.some((value) => value.startsWith('故事线 · ')), `${label} search lacks Thread reader label`);
    await search.fill('ふーみん');
    await page.locator('[data-search-item]').first().waitFor();
    const personLabels = await page.locator('[data-search-item] > span').allTextContents();
    assert(personLabels.some((value) => value.startsWith('人物 · ')), `${label} search lacks Person reader label`);

    await assertNoForbidden(page, label);
    const pageOverflow = await overflow(page);
    assert(pageOverflow === 0, `${label} horizontal overflow: ${pageOverflow}`);
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    if (outputDir) await page.screenshot({ path: path.join(outputDir, `${label}-ui-language.png`), fullPage: false });
    evidence[label] = {
      overflow: pageOverflow,
      console: logs,
      searchLabels: [
        eventAndThreadLabels.find((value) => value.startsWith('事件 · ')),
        eventAndThreadLabels.find((value) => value.startsWith('故事线 · ')),
        personLabels.find((value) => value.startsWith('人物 · ')),
      ],
    };
    await page.close();
  }

  console.log(JSON.stringify({ evidence, outputDir }, null, 2));
} finally {
  await browser.close();
}
