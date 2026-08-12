import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) {
  throw new Error('Playwright is not installed. Run npm install in scripts/xhs-exporter before this verifier.');
}

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = {};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};

const readEvent = async (page, eventId) => page.locator(`[data-event-card="${eventId}"]`).evaluate((card) => ({
  active: card.classList.contains('is-active'),
  title: card.querySelector('h3')?.textContent?.trim(),
  summary: card.querySelector('.event-summary')?.textContent?.trim(),
  readerNote: card.querySelector('.event-reader-note')?.textContent?.trim() || null,
  people: [...card.querySelectorAll('[data-open-person]')].map((button) => button.textContent.trim()),
  threads: [...card.querySelectorAll('[data-open-thread]')].map((button) => button.dataset.openThread),
}));

try {
  const desktopLogs = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(page, desktopLogs);

  await page.goto(`${projectUrl}?view=timeline&event=yt-040405-amazon-hama`, { waitUntil: 'networkidle' });
  const amazon = await readEvent(page, 'yt-040405-amazon-hama');
  assert(amazon.active, 'legacy Amazon Event deep link did not restore');
  assert(amazon.title === 'Amazon 5000 円×2：寺島与堀金同时 Bingo', `unexpected Amazon title: ${amazon.title}`);
  assert(JSON.stringify(amazon.people) === JSON.stringify(['寺島惇太', '堀金蒼平']), `unexpected Amazon people: ${JSON.stringify(amazon.people)}`);
  assert(amazon.summary === '23 番一出，两个人同时 Bingo，正好撞上两份 Amazon 5000 円礼券。', `unexpected Amazon summary: ${amazon.summary}`);
  assert(amazon.readerNote === null, 'Amazon reader layer must not expose the second-winner inference note');
  assert(!amazon.summary.includes('濱'), 'Amazon winner summary still presents 濱 in the winner Event');
  if (outputDir) {
    await page.locator('[data-event-card="yt-040405-amazon-hama"]').screenshot({ path: path.join(outputDir, '1440-amazon-event.png') });
  }

  await page.goto(`${projectUrl}?view=timeline&event=yt-040524-hama-grabs-amazon-card`, { waitUntil: 'networkidle' });
  const grab = await readEvent(page, 'yt-040524-hama-grabs-amazon-card');
  assert(grab.active, 'new card-grab Event deep link did not restore');
  assert(grab.title === '濱去抢寺島的 Amazon 卡', `unexpected card-grab title: ${grab.title}`);
  assert(JSON.stringify(grab.people) === JSON.stringify(['濱健人', '寺島惇太']), `unexpected card-grab people: ${JSON.stringify(grab.people)}`);
  assert(grab.threads.includes('bingo-payback') && grab.threads.includes('hama-paid-drinking'), `card-grab thread links are incomplete: ${JSON.stringify(grab.threads)}`);
  if (outputDir) {
    await page.locator('[data-event-card="yt-040524-hama-grabs-amazon-card"]').screenshot({ path: path.join(outputDir, '1440-card-grab-event.png') });
  }

  const grabThreadChooser = page.locator('[data-event-card="yt-040524-hama-grabs-amazon-card"] .event-thread-chooser');
  await grabThreadChooser.locator('summary').click();
  await grabThreadChooser.locator('[data-open-thread="hama-paid-drinking"]').click();
  const hamaThread = await page.locator('[data-thread-detail="hama-paid-drinking"]').evaluate((detail) => ({
    hidden: detail.hidden,
    text: detail.textContent.replace(/\s+/g, ' ').trim(),
  }));
  assert(!hamaThread.hidden, '濱 thread did not open from the new Event');
  assert(hamaThread.text.includes('自己没中还伸手去抢寺島的卡') && hamaThread.text.includes('ギャラ＋1000円'), '濱 thread still has the superseded winner causality');

  await page.goto(`${projectUrl}?view=people&person=shioya-fumiyasu`, { waitUntil: 'networkidle' });
  const shioya = await page.locator('[data-person-detail="shioya-fumiyasu"]').evaluate((detail) => ({
    hidden: detail.hidden,
    name: detail.querySelector('h2')?.textContent?.trim(),
    reading: detail.querySelector('.person-reading')?.textContent?.trim(),
  }));
  assert(!shioya.hidden && shioya.name === '汐谷文康', '汐谷 person deep link did not restore');
  assert(shioya.reading === 'しおや ふみよし', `wrong rendered 汐谷 reading: ${shioya.reading}`);

  await page.goto(`${projectUrl}?view=overview`, { waitUntil: 'networkidle' });
  const input = page.locator('[data-archive-search]');
  await input.fill('堀金');
  await page.locator('[data-search-item]').first().waitFor({ state: 'visible' });
  const horikaneSearch = await page.locator('[data-search-list]').evaluate((list) => [...list.querySelectorAll('[data-search-item]')].map((button) => ({
    id: button.dataset.searchEvent || button.dataset.searchThread || button.dataset.searchPerson,
    kind: button.dataset.searchKind,
    text: button.textContent.replace(/\s+/g, ' ').trim(),
  })));
  assert(horikaneSearch.some((item) => item.id === 'yt-040405-amazon-hama' && item.text.includes('寺島与堀金')), `corrected Amazon search result missing: ${JSON.stringify(horikaneSearch)}`);
  assert(!horikaneSearch.some((item) => item.id === 'yt-040405-amazon-hama' && item.text.includes('濱与寺島')), 'search still exposes the superseded Amazon title');
  await input.fill('濱');
  await page.waitForTimeout(100);
  const hamaSearch = await page.locator('[data-search-list]').evaluate((list) => [...list.querySelectorAll('[data-search-item]')].map((button) => ({
    id: button.dataset.searchEvent || button.dataset.searchThread || button.dataset.searchPerson,
    kind: button.dataset.searchKind,
    text: button.textContent.replace(/\s+/g, ' ').trim(),
  })));
  assert(hamaSearch.some((item) => item.id === 'yt-040524-hama-grabs-amazon-card'), `card-grab search result missing: ${JSON.stringify(hamaSearch)}`);
  assert(!hamaSearch.some((item) => item.id === 'yt-040405-amazon-hama'), '濱 search still matches the Amazon winner Event');

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow === 0, `desktop overflow: ${desktopOverflow}`);
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  if (outputDir) await page.screenshot({ path: path.join(outputDir, '1440x900-semantic-p0.png'), fullPage: false });

  const mobileLogs = [];
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(mobile, mobileLogs);
  await mobile.goto(`${projectUrl}?view=timeline&event=yt-040405-amazon-hama`, { waitUntil: 'networkidle' });
  const mobileAmazon = await readEvent(mobile, 'yt-040405-amazon-hama');
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileAmazon.active && mobileAmazon.summary === '23 番一出，两个人同时 Bingo，正好撞上两份 Amazon 5000 円礼券。' && mobileAmazon.readerNote === null, 'mobile did not render the simplified Amazon Event copy');
  assert(mobileOverflow === 0, `mobile overflow: ${mobileOverflow}`);
  assert(mobileLogs.length === 0, `mobile console errors: ${mobileLogs.join(' | ')}`);
  if (outputDir) await mobile.screenshot({ path: path.join(outputDir, '390x844-semantic-p0.png'), fullPage: false });
  if (outputDir) {
    await mobile.locator('[data-event-card="yt-040405-amazon-hama"]').screenshot({ path: path.join(outputDir, '390-amazon-event.png') });
  }

  evidence.amazon = amazon;
  evidence.grab = grab;
  evidence.hamaThread = hamaThread;
  evidence.shioya = shioya;
  evidence.search = { horikane: horikaneSearch, hama: hamaSearch };
  evidence.desktop = { overflow: desktopOverflow, console: desktopLogs };
  evidence.mobile = { event: mobileAmazon, overflow: mobileOverflow, console: mobileLogs };
  evidence.outputDir = outputDir;
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
