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
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readPerson = async (page, personId) => page.locator(`[data-person-detail="${personId}"]`).evaluate((detail) => ({
  hidden: detail.hidden,
  name: detail.querySelector('h2')?.textContent?.trim(),
  callNameLabel: detail.querySelector('.person-aliases span')?.textContent?.trim() || null,
  callNames: detail.querySelector('.person-aliases')?.childNodes[1]?.textContent?.trim() || null,
  text: detail.textContent.replace(/\s+/g, ' ').trim(),
}));
const searchPeople = async (page, query) => {
  const input = page.locator('[data-archive-search]');
  await input.fill(query);
  await page.locator('[data-search-item]').first().waitFor({ state: 'visible' });
  return page.locator('[data-search-list]').evaluate((list) => [...list.querySelectorAll('[data-search-kind="person"]')].map((button) => ({
    id: button.dataset.searchPerson,
    text: button.textContent.replace(/\s+/g, ' ').trim(),
  })));
};

try {
  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  await desktop.goto(`${projectUrl}?view=people&person=kumagai-toshiki`, { waitUntil: 'networkidle' });

  const kumagai = await readPerson(desktop, 'kumagai-toshiki');
  assert(!kumagai.hidden && kumagai.name === '熊谷俊輝', '熊谷 deep link did not restore');
  assert(kumagai.callNameLabel === '本场常用称呼' && kumagai.callNames === 'トシピ', `unexpected 熊谷 call names: ${JSON.stringify(kumagai)}`);
  assert(!kumagai.text.includes('熊谷君') && !kumagai.text.includes('本场别名'), '熊谷 panel still exposes the legacy alias contract');

  await desktop.goto(`${projectUrl}?view=people&person=kano-sho`, { waitUntil: 'networkidle' });
  const kano = await readPerson(desktop, 'kano-sho');
  assert(!kano.hidden && kano.callNameLabel === null, `敬称-only 狩野 unexpectedly renders a call-name row: ${JSON.stringify(kano)}`);

  await desktop.goto(`${projectUrl}?view=people&person=mitsutomi-takao`, { waitUntil: 'networkidle' });
  const mitsutomi = await readPerson(desktop, 'mitsutomi-takao');
  assert(!mitsutomi.hidden && mitsutomi.name === '光富崇雄', '光富 deep link did not restore');
  assert(mitsutomi.callNameLabel === '本场常用称呼' && mitsutomi.callNames === 'タカオ', `unexpected 光富 call names: ${JSON.stringify(mitsutomi)}`);
  assert(!mitsutomi.text.includes('光富さん'), '光富 panel restored the removed honorific alias');

  const searchCases = new Map([
    ['熊谷君', 'kumagai-toshiki'],
    ['狩野さん', 'kano-sho'],
    ['伊藤さん', 'ito-tomohiro'],
    ['井上君', 'inoue-yuki'],
    ['トシピ', 'kumagai-toshiki'],
    ['タカオ', 'mitsutomi-takao'],
    ['濱ちゃん', 'hama-kento'],
  ]);
  const searchEvidence = {};
  await desktop.goto(`${projectUrl}?view=overview`, { waitUntil: 'networkidle' });
  for (const [query, personId] of searchCases) {
    const people = await searchPeople(desktop, query);
    searchEvidence[query] = people;
    assert(people.some((person) => person.id === personId), `${query} did not find ${personId}: ${JSON.stringify(people)}`);
  }

  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow === 0, `desktop overflow: ${desktopOverflow}`);
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  if (outputDir) {
    await desktop.goto(`${projectUrl}?view=people&person=kumagai-toshiki`, { waitUntil: 'networkidle' });
    await desktop.screenshot({ path: path.join(outputDir, '1440x900-person-toshipi.png'), fullPage: false });
  }

  const mobileLogs = [];
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(mobile, mobileLogs);
  await mobile.goto(`${projectUrl}?view=people&person=mitsutomi-takao`, { waitUntil: 'networkidle' });
  const mobileMitsutomi = await readPerson(mobile, 'mitsutomi-takao');
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(!mobileMitsutomi.hidden && mobileMitsutomi.callNames === 'タカオ', 'mobile did not restore the verified 光富 call name');
  assert(mobileOverflow === 0, `mobile overflow: ${mobileOverflow}`);
  assert(mobileLogs.length === 0, `mobile console errors: ${mobileLogs.join(' | ')}`);
  if (outputDir) await mobile.screenshot({ path: path.join(outputDir, '390x844-person-takao.png'), fullPage: false });

  console.log(JSON.stringify({
    kumagai,
    kano,
    mitsutomi,
    search: searchEvidence,
    desktop: { overflow: desktopOverflow, console: desktopLogs },
    mobile: { person: mobileMitsutomi, overflow: mobileOverflow, console: mobileLogs },
    outputDir,
  }, null, 2));
} finally {
  await browser.close();
}
