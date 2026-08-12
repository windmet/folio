import { existsSync } from 'node:fs';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMACHOE_BASE_URL || 'http://127.0.0.1:5174';
const projectUrl = `${baseUrl}/projects/komachoe-20260425/`;
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const fakeYouTubeApi = String.raw`(() => {
  const state = window.__komachoeProvider = window.__komachoeProvider || { instances: 0, seekCalls: [], playCalls: 0, currentTime: 0 };
  const PlayerState = { PLAYING: 1, PAUSED: 2 };
  class Player {
    constructor(mount, options) {
      this.options = options;
      this.iframe = document.createElement('iframe');
      mount.replaceWith(this.iframe);
      state.instances += 1;
      window.setTimeout(() => options.events?.onReady?.({ target: this }), 20);
    }
    seekTo(seconds) { state.currentTime = Number(seconds); state.seekCalls.push(Number(seconds)); }
    playVideo() { state.playCalls += 1; this.options.events?.onStateChange?.({ data: PlayerState.PLAYING }); }
    pauseVideo() { this.options.events?.onStateChange?.({ data: PlayerState.PAUSED }); }
    getCurrentTime() { return state.currentTime; }
    getIframe() { return this.iframe; }
    destroy() { this.iframe.remove(); }
  }
  window.YT = { Player, PlayerState };
  window.onYouTubeIframeAPIReady?.();
})();`;

const browser = await chromium.launch({ headless: true });
const evidence = { viewports: {}, sectionNavigation: {}, search: {}, player: {}, history: {} };

const attachLogs = (page) => {
  const logs = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
  return logs;
};
const openPage = async (viewport, { failApiOnce = false } = {}) => {
  const page = await browser.newPage({ viewport });
  const logs = attachLogs(page);
  let apiAttempts = 0;
  await page.route('**/*iframe_api*', async (route) => {
    apiAttempts += 1;
    if (failApiOnce && apiAttempts === 1) return route.abort('failed');
    return route.fulfill({ contentType: 'application/javascript', body: fakeYouTubeApi });
  });
  await page.route('**/img.youtube.com/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.goto(projectUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('project-archive-shell').waitFor();
  return { page, logs, getApiAttempts: () => apiAttempts };
};

try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 414, height: 896 },
  ]) {
    const label = `${viewport.width}x${viewport.height}`;
    const { page, logs } = await openPage(viewport);
    const state = await page.evaluate(() => ({
      activeView: document.querySelector('project-archive-shell')?.activeView,
      nav: [...document.querySelectorAll('[data-view-button]')].map((button) => button.dataset.viewButton),
      visiblePanels: [...document.querySelectorAll('[data-view-panel]:not([hidden])')].map((panel) => panel.dataset.viewPanel),
      sections: document.querySelectorAll('[data-section-act]').length,
      acts: document.querySelectorAll('[data-timeline-navigator-segment]').length,
      events: document.querySelectorAll('[data-event-card]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      forbidden: document.querySelectorAll('[data-timeline-scope], [data-source-track], [data-player-rail-thread], [data-thread-overlay], [data-person-overlay]').length,
    }));
    assert(state.activeView === 'overview' && state.visiblePanels.join() === 'overview', `${label} does not open on Overview: ${JSON.stringify(state)}`);
    assert(state.nav.join() === 'overview,sections,timeline', `${label} view navigation mismatch`);
    assert(state.sections === 6 && state.acts === 6 && state.events === 30, `${label} does not render 6 Sections / Acts and 30 Events`);
    assert(state.overflow === 0 && state.forbidden === 0, `${label} overflow or forbidden optional UI: ${JSON.stringify(state)}`);
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    evidence.viewports[label] = state;
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 1440, height: 900 });
    await page.locator('[data-view-button="sections"]').click();
    const before = await page.evaluate(() => history.length);
    await page.locator('[data-section-act="act-04"]').click();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.activeView === 'timeline');
    const state = await page.evaluate(() => ({
      activeView: document.querySelector('project-archive-shell')?.activeView,
      activeAct: document.activeElement?.closest?.('[data-act]')?.getAttribute('data-act'),
      url: location.href,
      historyLength: history.length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(state.activeAct === 'act-04', `Section did not focus act-04: ${JSON.stringify(state)}`);
    assert(state.historyLength === before + 1 && !state.url.includes('section='), `Section navigation history contract failed: ${JSON.stringify(state)}`);
    assert(logs.length === 0, `Section navigation console errors: ${logs.join(' | ')}`);
    evidence.sectionNavigation = state;
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 1440, height: 900 });
    await page.locator('[data-view-button="sections"]').click();
    await page.locator('[data-section-act="act-03"]').click();
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.activeView === 'sections');
    const backView = await page.evaluate(() => document.querySelector('project-archive-shell')?.activeView);
    await page.goForward();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.activeView === 'timeline');
    const forwardView = await page.evaluate(() => document.querySelector('project-archive-shell')?.activeView);
    assert(backView === 'sections' && forwardView === 'timeline', `Back/Forward failed: ${backView} -> ${forwardView}`);
    assert(logs.length === 0, `Back/Forward console errors: ${logs.join(' | ')}`);
    evidence.history = { backView, forwardView };
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 1440, height: 900 });
    await page.locator('[data-archive-search]').fill('寺島');
    await page.locator('[data-search-item]').first().waitFor();
    const matches = await page.locator('[data-search-item]').evaluateAll((items) => items.map((item) => ({ kind: item.dataset.searchKind, title: item.textContent?.trim() })));
    assert(matches.length >= 1 && matches.every((item) => item.kind === 'event'), `Search did not return Event-only matches: ${JSON.stringify(matches)}`);
    await page.locator('[data-search-item]').first().click();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.activeView === 'timeline');
    const selectedEvent = await page.evaluate(() => document.querySelector('project-archive-shell')?.selectedEventId);
    assert(selectedEvent === 'yt-002351-terashima-backstage-mc', `Search selected the wrong Event: ${selectedEvent}`);
    assert(logs.length === 0, `Search console errors: ${logs.join(' | ')}`);
    evidence.search = { query: '寺島', matches, selectedEvent };
    await page.close();
  }

  {
    const { page, logs, getApiAttempts } = await openPage({ width: 1440, height: 900 }, { failApiOnce: true });
    await page.locator('[data-event-seek="yt-000250-no-detailed-script"]').first().click();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.playerLoadState === 'error');
    await page.locator('[data-player-retry]').click();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.playerLoadState === 'ready');
    await page.locator('[data-event-seek="yt-013430-hontou-wa-accent"]').first().click();
    await page.waitForFunction(() => window.__komachoeProvider?.seekCalls?.at(-1) === 5670);
    const state = await page.evaluate(() => ({
      selectedEvent: document.querySelector('project-archive-shell')?.selectedEventId,
      loadState: document.querySelector('project-archive-shell')?.playerLoadState,
      playerTime: document.querySelector('[data-player-time]')?.textContent,
      seekCalls: window.__komachoeProvider?.seekCalls,
      railActions: document.querySelectorAll('[data-player-context-rail] > button, [data-player-context-rail] > a').length,
      sourceHref: document.querySelector('[data-player-rail-source]')?.href,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(getApiAttempts() === 2 && state.loadState === 'ready', `YouTube retry did not recover: ${JSON.stringify(state)}`);
    assert(state.selectedEvent === 'yt-013430-hontou-wa-accent' && state.playerTime === '01:34:30', `Event seek state mismatch: ${JSON.stringify(state)}`);
    assert(state.railActions === 2 && /[?&]t=5670s/.test(state.sourceHref || ''), `single-source action rail/current-time handoff failed: ${JSON.stringify(state)}`);
    const unexpectedLogs = logs.filter((message) => !message.includes('Failed to load resource: net::ERR_FAILED'));
    assert(state.overflow === 0 && unexpectedLogs.length === 0, `Player QA errors: ${unexpectedLogs.join(' | ')}`);
    evidence.player = { ...state, apiAttempts: getApiAttempts(), expectedFailureLogs: logs.length - unexpectedLogs.length };
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 390, height: 844 });
    await page.goto(`${projectUrl}?view=timeline&event=yt-013430-hontou-wa-accent`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.selectedEventId === 'yt-013430-hontou-wa-accent');
    const restored = await page.evaluate(() => ({
      view: document.querySelector('project-archive-shell')?.activeView,
      event: document.querySelector('project-archive-shell')?.selectedEventId,
      mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(restored.view === 'timeline' && restored.event === 'yt-013430-hontou-wa-accent' && restored.mode === 'bubble', `mobile URL restore/Bubble failed: ${JSON.stringify(restored)}`);
    await page.locator('[data-player-bubble]').click();
    const expandedMode = await page.locator('[data-player-frame]').getAttribute('data-player-mode');
    assert(expandedMode === 'expanded', `mobile Bubble did not expand: ${expandedMode}`);
    assert(restored.overflow === 0 && logs.length === 0, `mobile restore errors: ${logs.join(' | ')}`);
    evidence.mobileRestore = { ...restored, expandedMode };
    await page.close();
  }

  console.log(JSON.stringify(evidence, null, 2));
  console.log('Komachoe browser verification passed.');
} finally {
  await browser.close();
}
