import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4321';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readActionBar = (page) => page.evaluate(() => {
  const bar = document.querySelector('[data-player-context-rail]');
  const buttons = [...bar.querySelectorAll(':scope > button, :scope > a, :scope > .player-context-rail__thread-slot > button')];
  const rect = bar.getBoundingClientRect();
  return {
    display: getComputedStyle(bar).display,
    width: rect.width,
    height: rect.height,
    columns: getComputedStyle(bar).gridTemplateColumns.split(' ').length,
    labels: buttons.map((item) => item.textContent.trim()),
    buttonWidths: buttons.map((item) => item.getBoundingClientRect().width),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    targetBottom: document.querySelector('[data-player-current]').getBoundingClientRect().bottom,
    barTop: rect.top,
  };
});

const browser = await chromium.launch({ headless: true });
try {
  const evidence = { expanded: {}, navigation: {}, storylines: {}, docked: {}, mobile: {}, logs: [] };

  for (const width of [1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    attachLogChecks(page, evidence.logs);
    await page.goto(`${projectUrl}?view=timeline&event=yt-014321-kano-ojisan`, { waitUntil: 'networkidle' });
    const state = await readActionBar(page);
    assert(state.display === 'grid' && state.columns === 3, `${width}px expanded action bar is not a 3-column grid`);
    assert(state.labels.join('|') === '定位此处|故事线 · 1|YouTube ↗', `${width}px expanded labels mismatch: ${state.labels.join('|')}`);
    assert(Math.abs(state.barTop - state.targetBottom) < 2, `${width}px action bar is not immediately below TARGET`);
    assert(state.overflow <= 1, `${width}px expanded page overflows by ${state.overflow}px`);
    evidence.expanded[width] = state;
    if (outputDir && width === 1440) await page.screenshot({ path: path.join(outputDir, 'expanded-1440.png'), fullPage: false });
    await page.close();
  }

  const navigationPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(navigationPage, evidence.logs);
  await navigationPage.goto(`${projectUrl}?view=timeline&event=yt-014321-kano-ojisan`, { waitUntil: 'networkidle' });
  await navigationPage.evaluate(() => window.scrollTo(0, 0));
  await navigationPage.locator('[data-player-rail-node]').click();
  evidence.navigation.timeline = await navigationPage.evaluate(() => ({
    event: document.activeElement?.getAttribute('data-timeline-event'),
    view: document.querySelector('[data-view-button][aria-pressed="true"]')?.getAttribute('data-view-button'),
  }));
  assert(evidence.navigation.timeline.event === 'yt-014321-kano-ojisan', 'Timeline action did not refocus the selected YT Event');

  await navigationPage.locator('[data-view-button="people"]').click();
  assert(await navigationPage.locator('[data-player-rail-timeline-label]').textContent() === '查看时间线', 'non-Timeline label is not 查看时间线');
  await navigationPage.locator('[data-player-rail-node]').click();
  assert(await navigationPage.evaluate(() => document.activeElement?.getAttribute('data-timeline-event')) === 'yt-014321-kano-ojisan', 'People action did not return to the exact YT Event');

  for (const [eventId, trackId] of [
    ['sp1-000240-audio-finally-live', 'space-1'],
    ['sp2-000003-finally-vertical', 'space-2'],
  ]) {
    await navigationPage.goto(`${projectUrl}?view=people&event=${eventId}`, { waitUntil: 'networkidle' });
    assert(await navigationPage.locator('[data-player-rail-source-label]').textContent() === 'X 回放 ↗', `${eventId} source label is not X 回放 ↗`);
    await navigationPage.locator('[data-player-rail-node]').click();
    const result = await navigationPage.evaluate(() => ({
      event: document.activeElement?.getAttribute('data-timeline-event'),
      scope: document.querySelector('[data-timeline-scope-panel]:not([hidden])')?.getAttribute('data-timeline-scope-panel'),
      view: document.querySelector('[data-view-button][aria-pressed="true"]')?.getAttribute('data-view-button'),
    }));
    assert(result.event === eventId && result.scope === trackId && result.view === 'timeline', `${eventId} did not reach its source-scoped Timeline: ${JSON.stringify(result)}`);
    evidence.navigation[eventId] = result;
  }

  for (const [eventId, expectedCount] of [
    ['yt-013917-kano-spice-sensor', 0],
    ['yt-014321-kano-ojisan', 1],
    ['yt-013730-hama-j-coupon', 2],
  ]) {
    await navigationPage.goto(`${projectUrl}?view=timeline&event=${eventId}`, { waitUntil: 'networkidle' });
    const button = navigationPage.locator('[data-player-rail-thread]');
    const state = await button.evaluate((item) => ({ disabled: item.disabled, label: item.textContent.trim() }));
    assert(state.label === `故事线 · ${expectedCount || '—'}`, `${eventId} Storyline count mismatch: ${state.label}`);
    assert(state.disabled === (expectedCount === 0), `${eventId} Storyline disabled state mismatch`);
    if (expectedCount === 0) continue;
    await button.click();
    if (expectedCount === 1) {
      assert(await navigationPage.locator('[data-thread-overlay]').isVisible(), `${eventId} single Storyline did not open directly`);
      await navigationPage.locator('[data-close-thread]').first().click();
    } else {
      assert(await button.getAttribute('aria-expanded') === 'true', `${eventId} multi Storyline chooser did not expand`);
      assert(await navigationPage.locator('[data-player-rail-thread-option]').count() === expectedCount, `${eventId} chooser option count mismatch`);
      await navigationPage.locator('[data-player-rail-thread-option]').first().click();
      assert(await navigationPage.locator('[data-thread-overlay]').isVisible(), `${eventId} chooser did not open Thread overlay`);
      await navigationPage.locator('[data-close-thread]').first().click();
    }
    evidence.storylines[eventId] = expectedCount;
  }

  await navigationPage.goto(`${projectUrl}?view=timeline&event=yt-014321-kano-ojisan`, { waitUntil: 'networkidle' });
  await navigationPage.locator('[data-player-mode-toggle]').click();
  const docked = await readActionBar(navigationPage);
  assert(docked.width <= 192.5, `Docked action area grew beyond 192px: ${docked.width}`);
  assert(docked.buttonWidths.every((width) => Math.abs(width - 64) < 1), `Docked action widths are not 64px: ${docked.buttonWidths.join(', ')}`);
  assert(docked.overflow <= 1, `Docked page overflows by ${docked.overflow}px`);
  evidence.docked = docked;
  if (outputDir) await navigationPage.screenshot({ path: path.join(outputDir, 'docked-1440.png'), fullPage: false });
  await navigationPage.close();

  for (const width of [390, 900]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    attachLogChecks(page, evidence.logs);
    await page.goto(`${projectUrl}?view=timeline&event=yt-014321-kano-ojisan`, { waitUntil: 'networkidle' });
    const state = await page.locator('[data-player-context-rail]').evaluate((bar) => ({
      display: getComputedStyle(bar).display,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(state.display === 'none', `${width}px must hide the desktop Player Action Bar`);
    assert(state.overflow <= 1, `${width}px mobile page overflows by ${state.overflow}px`);
    evidence.mobile[width] = state;
    await page.close();
  }

  const meaningfulLogs = evidence.logs.filter((entry) => !entry.includes('Failed to load resource'));
  assert(meaningfulLogs.length === 0, `Browser console errors: ${meaningfulLogs.join(' | ')}`);
  console.log(JSON.stringify(evidence, null, 2));
  console.log('RC12-PA1 browser verification passed.');
} finally {
  await browser.close();
}
