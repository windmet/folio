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
  summary: card.querySelector('.event-body > p')?.textContent?.trim(),
  people: [...card.querySelectorAll('[data-open-person]')].map((button) => button.textContent.trim()),
  threads: [...card.querySelectorAll('[data-open-thread]')].map((button) => button.dataset.openThread),
}));

try {
  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  await desktop.goto(`${projectUrl}?view=timeline&event=sp2-025404-public-offer`, { waitUntil: 'networkidle' });

  const offer = await readEvent(desktop, 'sp2-025404-public-offer');
  assert(offer.active && offer.title === '续报还没公布，清典先收到“公开 offer”', `public-offer deep link failed: ${JSON.stringify(offer)}`);
  assert(offer.summary.includes('让他把那天行程空出来') && !offer.summary.includes('正式确定参加'), 'public-offer boundary is wrong');
  assert(JSON.stringify(offer.people) === JSON.stringify(['小松昌平', '清典']), `public-offer people mismatch: ${JSON.stringify(offer.people)}`);
  assert(offer.threads.includes('ore-shiri-making-of'), 'public-offer Event is not connected to the making-of Thread');

  await desktop.locator('[data-event-card="sp2-025404-public-offer"] [data-open-thread="ore-shiri-making-of"]').click();
  const makingOf = await desktop.locator('[data-thread-detail="ore-shiri-making-of"]').evaluate((detail) => ({
    hidden: detail.hidden,
    eventIds: [...detail.querySelectorAll('[data-thread-event-id]')].map((button) => button.dataset.threadEventId),
  }));
  const reflectionIndex = makingOf.eventIds.indexOf('sp2-025254-seiten-reflection');
  assert(!makingOf.hidden
    && makingOf.eventIds[reflectionIndex + 1] === 'sp2-025404-public-offer'
    && makingOf.eventIds[reflectionIndex + 2] === 'yt-042730-mini-event-announced', `making-of closeout order failed: ${JSON.stringify(makingOf)}`);

  await desktop.goto(`${projectUrl}?view=timeline&event=yt-042730-mini-event-announced`, { waitUntil: 'networkidle' });
  const announcement = await readEvent(desktop, 'yt-042730-mini-event-announced');
  const symbolism = await readEvent(desktop, 'yt-032708-book-symbolism');
  const scriptLanguage = await readEvent(desktop, 'yt-033944-script-language');
  assert(announcement.active && announcement.summary.includes('声优活动加约 10～15 分钟的 mini 朗读剧'), 'mini event format is missing');
  assert(announcement.summary.includes('面向来年启动制作') && announcement.summary.includes('主题是“ヒーローショー”'), 'formal fourth installment remains under-explained');
  assert(symbolism.summary.includes('仍希望演员保持与台本的关系') && !symbolism.summary.includes('防忘词工具'), 'book-symbolism inference is still too strong');
  assert(scriptLanguage.summary.includes('缩小版的 straight play') && !scriptLanguage.summary.includes('防忘词工具'), 'script-language principle is still flattened into an official definition');

  const searchInput = desktop.locator('[data-archive-search]');
  await searchInput.fill('公开 offer');
  await desktop.locator('[data-search-item]').first().waitFor({ state: 'visible' });
  const searchResultIds = await desktop.locator('[data-search-list]').evaluate((list) => [...list.querySelectorAll('[data-search-item]')].map((button) => button.dataset.searchEvent));
  assert(searchResultIds.includes('sp2-025404-public-offer'), `public-offer search result missing: ${JSON.stringify(searchResultIds)}`);

  const desktopOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow === 0, `desktop overflow: ${desktopOverflow}`);
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  if (outputDir) await desktop.screenshot({ path: path.join(outputDir, '1440x900-announcement.png'), fullPage: false });

  const mobileLogs = [];
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(mobile, mobileLogs);
  await mobile.goto(`${projectUrl}?view=timeline&event=sp2-025404-public-offer`, { waitUntil: 'networkidle' });
  const mobileOffer = await readEvent(mobile, 'sp2-025404-public-offer');
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(mobileOffer.active && mobileOffer.title.includes('公开 offer'), 'mobile public-offer Event did not restore');
  assert(mobileOverflow === 0, `mobile overflow: ${mobileOverflow}`);
  assert(mobileLogs.length === 0, `mobile console errors: ${mobileLogs.join(' | ')}`);
  if (outputDir) await mobile.locator('[data-event-card="sp2-025404-public-offer"]').screenshot({ path: path.join(outputDir, '390-public-offer.png') });

  console.log(JSON.stringify({
    offer,
    makingOf,
    announcement,
    symbolism,
    scriptLanguage,
    searchResultIds,
    desktop: { overflow: desktopOverflow, console: desktopLogs },
    mobile: { event: mobileOffer, overflow: mobileOverflow, console: mobileLogs },
    outputDir,
  }, null, 2));
} finally {
  await browser.close();
}
