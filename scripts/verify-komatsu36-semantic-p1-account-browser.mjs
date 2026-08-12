import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

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
const readEvent = async (page, eventId) => page.locator(`[data-event-card="${eventId}"]`).evaluate((card) => ({
  active: card.classList.contains('is-active'),
  title: card.querySelector('h3')?.textContent?.trim(),
  readerNote: card.querySelector('.event-reader-note')?.textContent?.trim() || null,
  people: [...card.querySelectorAll('[data-open-person]')].map((button) => button.textContent.trim()),
}));

try {
  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  await desktop.goto(`${projectUrl}?view=timeline&event=sp2-000311-account-hijack`, { waitUntil: 'networkidle' });

  const hijack = await readEvent(desktop, 'sp2-000311-account-hijack');
  const setup = await readEvent(desktop, 'sp2-000131-muro-account');
  const hokkaido = await readEvent(desktop, 'sp2-000509-hokkaido');
  assert(hijack.active, 'account-hijack deep link did not restore');
  assert(JSON.stringify(hijack.people) === JSON.stringify(['室元気账号']), `unexpected account-hijack chip: ${JSON.stringify(hijack.people)}`);
  assert(hijack.readerNote === '这段只能确认使用的是室元気的账号，实际说话者未确认。', `missing account speaker reader note: ${hijack.readerNote}`);
  assert(setup.people.includes('室元気账号') && !setup.people.includes('室元気'), `setup event conflates account and person: ${JSON.stringify(setup.people)}`);
  assert(hokkaido.people.includes('室元気') && !hokkaido.people.includes('室元気账号'), `Hokkaido payoff no longer identifies the person: ${JSON.stringify(hokkaido.people)}`);

  await desktop.locator('[data-event-card="sp2-000311-account-hijack"] [data-open-person="muro-genki"]').click();
  const person = await desktop.locator('[data-person-detail="muro-genki"]').evaluate((detail) => ({
    hidden: detail.hidden,
    name: detail.querySelector('h2')?.textContent?.trim(),
    text: detail.textContent.replace(/\s+/g, ' ').trim(),
  }));
  assert(!person.hidden && person.name === '室元気', 'account chip did not open the canonical 室元気 Person');
  assert(person.text.includes('因此不把那段发言归给室元気本人'), 'Person panel lost the account/speaker boundary');

  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow === 0, `desktop overflow: ${desktopOverflow}`);
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  if (outputDir) await desktop.screenshot({ path: path.join(outputDir, '1440x900-account-person.png'), fullPage: false });

  const mobileLogs = [];
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(mobile, mobileLogs);
  await mobile.goto(`${projectUrl}?view=timeline&event=sp2-000311-account-hijack`, { waitUntil: 'networkidle' });
  const mobileHijack = await readEvent(mobile, 'sp2-000311-account-hijack');
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileHijack.active && mobileHijack.people[0] === '室元気账号' && Boolean(mobileHijack.readerNote), 'mobile account identity projection failed');
  assert(mobileOverflow === 0, `mobile overflow: ${mobileOverflow}`);
  assert(mobileLogs.length === 0, `mobile console errors: ${mobileLogs.join(' | ')}`);
  if (outputDir) await mobile.locator('[data-event-card="sp2-000311-account-hijack"]').screenshot({ path: path.join(outputDir, '390-account-event.png') });

  console.log(JSON.stringify({
    hijack,
    setup,
    hokkaido,
    person,
    desktop: { overflow: desktopOverflow, console: desktopLogs },
    mobile: { event: mobileHijack, overflow: mobileOverflow, console: mobileLogs },
    outputDir,
  }, null, 2));
} finally {
  await browser.close();
}
