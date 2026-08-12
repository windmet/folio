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
  ['yt-035520-bingo-rules-patched', {
    title: 'Bingo 规则越玩越多，口令也临时改掉',
    summary: '一开始每人一张卡，同一时刻多人 Bingo 的单份奖品会流局；玩到后面又临时加入“double Bingo 优先”。连中奖口令也从普通“Bingo”改成了“俺を知ってくれ”。',
  }],
  ['yt-040000-tumbler-mitsutomi', {
    title: '新選組“誠”杯落到光富手中',
    summary: '第二轮 64 号由光富崇雄中奖，奖品是新選組／瀬戸焼き“誠”杯类物件。',
  }],
]);
const forbidden = ['规则边玩边修补，口令也现场改变', '规则不断 patch', '并不是早先误听成的“挂毯”'];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readEvent = (page, eventId) => page.locator(`[data-event-card="${eventId}"]`).evaluate((card) => ({
  active: card.classList.contains('is-active'),
  title: card.querySelector('h3')?.textContent?.trim(),
  summary: card.querySelector('.event-summary')?.textContent?.trim(),
}));

const browser = await chromium.launch({ headless: true });
try {
  const evidence = {};
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const label = `${viewport.width}x${viewport.height}`;
    const logs = [];
    const page = await browser.newPage({ viewport });
    attachLogChecks(page, logs);
    evidence[label] = {};
    for (const [eventId, copy] of expected) {
      await page.goto(`${projectUrl}?view=timeline&event=${eventId}`, { waitUntil: 'networkidle' });
      const event = await readEvent(page, eventId);
      assert(event.active && event.title === copy.title && event.summary === copy.summary, `${label} ${eventId} copy mismatch: ${JSON.stringify(event)}`);
      const bodyText = await page.locator('body').innerText();
      for (const phrase of forbidden) assert(!bodyText.includes(phrase), `${label} still exposes ${phrase}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow === 0, `${label} ${eventId} horizontal overflow: ${overflow}`);
      if (viewport.width === 390) {
        const mode = await page.locator('[data-player-frame]').getAttribute('data-player-mode');
        assert(mode === 'bubble', `${label} Event deep link did not retain M1 Bubble: ${mode}`);
      }
      evidence[label][eventId] = { ...event, overflow };
    }

    await page.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
    const search = page.locator('[data-archive-search]');
    await search.fill('double Bingo');
    const result = page.locator('[data-search-item][data-search-event="yt-035520-bingo-rules-patched"]');
    await result.waitFor();
    await result.click();
    assert(new URL(page.url()).searchParams.get('event') === 'yt-035520-bingo-rules-patched', `${label} search result did not navigate to the rewritten Event`);
    const selectedCard = page.locator('[data-event-card="yt-035520-bingo-rules-patched"]');
    assert((await readEvent(page, 'yt-035520-bingo-rules-patched')).active, `${label} rewritten Event was not selected after search`);
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    if (outputDir) {
      await selectedCard.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(outputDir, `${label}-event-language.png`), fullPage: false });
    }
    evidence[label].searchInteraction = { url: page.url(), console: logs };
    await page.close();
  }

  console.log(JSON.stringify({ evidence, outputDir }, null, 2));
} finally {
  await browser.close();
}
