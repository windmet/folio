import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const detailEventId = 'yt-011522-takoyaki-proposed';
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readMobileState = (page) => page.evaluate(() => {
  const navigator = document.querySelector('[data-timeline-navigator]');
  const toggle = document.querySelector('[data-mobile-act-toggle]');
  const visiblePanel = document.querySelector('[data-timeline-scope-panel]:not([hidden])');
  const cards = [...visiblePanel.querySelectorAll('.timeline-event:not(.is-active)')].slice(0, 5);
  return {
    scope: visiblePanel?.getAttribute('data-timeline-scope-panel'),
    navigatorHidden: navigator?.hidden,
    navigatorDisplay: navigator ? getComputedStyle(navigator).display : null,
    desktopSegmentsVisible: [...document.querySelectorAll('[data-timeline-navigator-segment]')]
      .filter((item) => item.getBoundingClientRect().height > 0).length,
    mobileDisplay: getComputedStyle(document.querySelector('.timeline-navigator__mobile')).display,
    toggleHeight: toggle?.getBoundingClientRect().height,
    optionCount: document.querySelectorAll('[data-mobile-act-option]').length,
    cardHeights: cards.map((card) => card.getBoundingClientRect().height),
    eventColumns: getComputedStyle(cards[0]).gridTemplateColumns,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});

const browser = await chromium.launch({ headless: true });
try {
  const evidence = { mobile: {}, interaction: {}, sourceBoundary: {}, desktop: {} };
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 414, height: 896 },
  ]) {
    const label = `${viewport.width}x${viewport.height}`;
    const logs = [];
    const page = await browser.newPage({ viewport });
    attachLogChecks(page, logs);
    await page.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
    const state = await readMobileState(page);
    assert(state.scope === 'yt-main' && !state.navigatorHidden, `${label} YT Act Locator is not available`);
    assert(state.desktopSegmentsVisible === 0 && state.mobileDisplay !== 'none', `${label} restored the desktop segment strip`);
    assert(state.toggleHeight >= 44 && state.toggleHeight <= 50, `${label} Act Locator height is outside 44–50px: ${state.toggleHeight}`);
    assert(state.optionCount === 8, `${label} Act directory does not contain 8 entries`);
    assert(state.cardHeights.length === 5 && Math.max(...state.cardHeights) <= 84, `${label} collapsed Event is too tall: ${state.cardHeights}`);
    assert(state.cardHeights.reduce((sum, height) => sum + height, 0) <= 400, `${label} cannot scan five collapsed Events in 400px`);
    assert(state.eventColumns.startsWith('76px '), `${label} Event time rail is not 76px: ${state.eventColumns}`);
    assert(state.overflow === 0, `${label} horizontal overflow: ${state.overflow}`);
    await page.locator('[data-mobile-act-toggle]').click();
    assert(await page.locator('[data-mobile-act-option]:visible').count() === 8, `${label} directory did not expose 8 visible entries`);
    await page.locator('[data-mobile-act-option="act-07"]').click();
    await page.waitForFunction(() => document.querySelector('[data-timeline-navigator]')?.getAttribute('data-current-act') === 'act-07');
    assert(await page.locator('[data-mobile-act-menu]').getAttribute('hidden') !== null, `${label} Act directory stayed open after navigation`);
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    if (outputDir && viewport.width === 390) {
      await page.screenshot({ path: path.join(outputDir, '390x844-mobile-timeline.png'), fullPage: false });
    }
    evidence.mobile[label] = state;
    await page.close();
  }

  const interactionLogs = [];
  const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(interaction, interactionLogs);
  await interaction.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
  const card = interaction.locator(`[data-timeline-event="${detailEventId}"]`);
  await card.locator('[data-event-detail]').click();
  let interactionState = await interaction.evaluate((eventId) => {
    const card = document.querySelector(`[data-timeline-event="${eventId}"]`);
    return {
      active: card?.classList.contains('is-active'),
      manual: card?.classList.contains('is-manual-expanded'),
      expanded: card?.querySelector('[data-event-detail]')?.getAttribute('aria-expanded'),
      selectedEventId: document.querySelector('project-archive-shell')?.selectedEventId,
      mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
      summaryDisplay: getComputedStyle(card?.querySelector('.event-summary')).display,
      url: location.href,
    };
  }, detailEventId);
  assert(!interactionState.active && interactionState.manual && interactionState.expanded === 'true', `title did not open manual reading state: ${JSON.stringify(interactionState)}`);
  assert(interactionState.selectedEventId === null && !interactionState.url.includes('event='), `title changed player target or URL: ${JSON.stringify(interactionState)}`);
  assert(interactionState.summaryDisplay === 'block', `manual reading state did not expose full detail: ${JSON.stringify(interactionState)}`);
  await card.locator('[data-event-detail]').click();
  assert(await card.locator('[data-event-detail]').getAttribute('aria-expanded') === 'false', 'second title click did not collapse Event reading state');

  await interaction.evaluate(() => {
    const shell = document.querySelector('project-archive-shell');
    document.documentElement.dataset.mt1PlayCalls = '0';
    shell.playerReady = true;
    shell.player = {
      seekTo: () => {},
      playVideo: () => { document.documentElement.dataset.mt1PlayCalls = String(Number(document.documentElement.dataset.mt1PlayCalls) + 1); },
      pauseVideo: () => {},
      getCurrentTime: () => 0,
    };
  });
  await card.locator('[data-event-seek]').click();
  interactionState = await interaction.evaluate((eventId) => ({
    mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
    playCalls: Number(document.documentElement.dataset.mt1PlayCalls),
    active: document.querySelector(`[data-timeline-event="${eventId}"]`)?.classList.contains('is-active'),
    expanded: document.querySelector(`[data-timeline-event="${eventId}"] [data-event-detail]`)?.getAttribute('aria-expanded'),
    currentLabel: getComputedStyle(document.querySelector(`[data-timeline-event="${eventId}"] [data-event-detail]`), '::after').content,
  }), detailEventId);
  assert(interactionState.mode === 'expanded' && interactionState.playCalls === 1, `time rail did not keep explicit seek/play semantics: ${JSON.stringify(interactionState)}`);
  assert(interactionState.active && interactionState.expanded === 'true' && interactionState.currentLabel.includes('CURRENT'), `seek target did not become expanded current Event: ${JSON.stringify(interactionState)}`);
  assert(interactionLogs.length === 0, `interaction console errors: ${interactionLogs.join(' | ')}`);
  evidence.interaction = interactionState;
  await interaction.close();

  for (const trackId of ['space-1', 'space-2']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const logs = [];
    attachLogChecks(page, logs);
    await page.goto(`${projectUrl}?view=timeline&track=${trackId}`, { waitUntil: 'networkidle' });
    const state = await readMobileState(page);
    assert(state.scope === trackId && state.navigatorHidden, `${trackId} exposed the YT Act Locator`);
    assert(state.cardHeights.length >= 5 && Math.max(...state.cardHeights) <= 150, `${trackId} mobile Event rows are not compact`);
    assert(state.overflow === 0 && logs.length === 0, `${trackId} mobile regression: ${JSON.stringify({ state, logs })}`);
    evidence.sourceBoundary[trackId] = state;
    await page.close();
  }

  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  await desktop.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
  const desktopState = await desktop.evaluate(() => ({
    segments: [...document.querySelectorAll('[data-timeline-navigator-segment]')].filter((item) => item.getBoundingClientRect().height > 0).length,
    mobileDisplay: getComputedStyle(document.querySelector('.timeline-navigator__mobile')).display,
    columns: getComputedStyle(document.querySelector('.timeline-event')).gridTemplateColumns,
    summaryDisplay: getComputedStyle(document.querySelector('.timeline-event .event-summary')).display,
    detailToggleDisplay: getComputedStyle(document.querySelector('.timeline-event [data-event-detail]')).display,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  assert(desktopState.segments === 8 && desktopState.mobileDisplay === 'none', `desktop T1 Navigator regressed: ${JSON.stringify(desktopState)}`);
  assert(desktopState.columns.startsWith('110px ') && desktopState.overflow === 0, `desktop Event projection regressed: ${JSON.stringify(desktopState)}`);
  assert(desktopState.summaryDisplay === 'block' && desktopState.detailToggleDisplay === 'none', `desktop expanded-by-default projection regressed: ${JSON.stringify(desktopState)}`);
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  evidence.desktop = desktopState;
  await desktop.close();

  console.log(JSON.stringify({ evidence, outputDir }, null, 2));
} finally {
  await browser.close();
}
