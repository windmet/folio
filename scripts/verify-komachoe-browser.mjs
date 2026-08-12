import { existsSync } from 'node:fs';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMACHOE_BASE_URL || 'http://127.0.0.1:5174';
const projectUrl = `${baseUrl}/projects/komachoe-20260425/`;
const komatsuUrl = `${baseUrl}/projects/komatsu36/`;
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
const evidence = { viewports: {}, sectionNavigation: {}, search: {}, player: {}, history: {}, mobileTimeline: {} };

const attachLogs = (page) => {
  const logs = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
  return logs;
};
const openPage = async (viewport, { failApiOnce = false, url = projectUrl } = {}) => {
  const page = await browser.newPage({ viewport });
  const logs = attachLogs(page);
  let apiAttempts = 0;
  await page.route('**/*iframe_api*', async (route) => {
    apiAttempts += 1;
    if (failApiOnce && apiAttempts === 1) return route.abort('failed');
    return route.fulfill({ contentType: 'application/javascript', body: fakeYouTubeApi });
  });
  await page.route('**/img.youtube.com/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
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
      theme: document.body.dataset.archiveTheme,
      palette: {
        paper: getComputedStyle(document.body).getPropertyValue('--archive-paper').trim(),
        accent: getComputedStyle(document.body).getPropertyValue('--archive-red').trim(),
        text: getComputedStyle(document.body).getPropertyValue('--archive-ink').trim(),
        surface: getComputedStyle(document.body).getPropertyValue('--archive-surface').trim(),
      },
      nav: [...document.querySelectorAll('[data-view-button]')].map((button) => button.dataset.viewButton),
      visiblePanels: [...document.querySelectorAll('[data-view-panel]:not([hidden])')].map((panel) => panel.dataset.viewPanel),
      sections: document.querySelectorAll('[data-section-act]').length,
      acts: document.querySelectorAll('[data-timeline-navigator-segment]').length,
      events: document.querySelectorAll('[data-event-card]').length,
      mentions: document.querySelectorAll('[data-mention-card]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      forbidden: document.querySelectorAll('[data-timeline-scope], [data-source-track], [data-player-rail-thread], [data-thread-overlay], [data-person-overlay]').length,
    }));
    assert(state.activeView === 'overview' && state.visiblePanels.join() === 'overview', `${label} does not open on Overview: ${JSON.stringify(state)}`);
    assert(
      state.theme === 'broadcast-blue'
        && state.palette.paper === '#f6f4ef'
        && state.palette.surface === '#fbfaf7'
        && state.palette.text === '#2e2a28'
        && state.palette.accent === '#5e7c96',
      `${label} broadcast-blue theme mismatch: ${JSON.stringify(state.palette)}`,
    );
    assert(state.nav.join() === 'overview,sections,timeline,mentions', `${label} view navigation mismatch`);
    assert(state.sections === 6 && state.acts === 6 && state.events === 30 && state.mentions === 19, `${label} does not render 6 Sections / 30 Events / 19 Mentions`);
    assert(state.overflow === 0 && state.forbidden === 0, `${label} overflow or forbidden optional UI: ${JSON.stringify(state)}`);
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    evidence.viewports[label] = state;
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 1440, height: 900 });
    await page.locator('[data-view-button="mentions"]').click();
    const state = await page.evaluate(() => ({
      activeView: document.querySelector('project-archive-shell')?.activeView,
      groups: [...document.querySelectorAll('[data-mention-kind]')].map((group) => ({
        kind: group.getAttribute('data-mention-kind'),
        cards: group.querySelectorAll('[data-mention-card]').length,
      })),
      columns: getComputedStyle(document.querySelector('.mentions-list')).gridTemplateColumns.split(' ').length,
      jumpLinks: document.querySelectorAll('.mentions-jump a').length,
      foldedTimes: [...document.querySelectorAll('.mention-times-more')].map((details) => ({
        open: details.open,
        hiddenButtons: details.querySelectorAll('[data-mention-event]').length,
      })),
      sources: [...document.querySelectorAll('.mention-source')].map((link) => ({
        label: link.textContent.trim(),
        target: link.getAttribute('target'),
        rel: link.getAttribute('rel'),
        borderWidth: getComputedStyle(link).borderTopWidth,
        paddingLeft: getComputedStyle(link).paddingLeft,
        textDecoration: getComputedStyle(link).textDecorationLine,
      })),
      mentionTitleClamp: getComputedStyle(document.querySelector('.mention-card__copy h4')).webkitLineClamp,
      mentionSummaryClamp: getComputedStyle(document.querySelector('.mention-card__copy p')).webkitLineClamp,
      fifthSlotEmpty: document.querySelectorAll('[data-view-button]').length === 4,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(state.activeView === 'mentions' && state.groups.length === 3, `Mentions view did not render its three groups: ${JSON.stringify(state)}`);
    assert(state.groups.map((group) => group.kind).join() === 'person,work,context', `Mentions group order mismatch: ${JSON.stringify(state.groups)}`);
    assert(JSON.stringify(state.groups.map((group) => group.cards)) === JSON.stringify([10, 8, 1]) && state.columns === 2 && state.jumpLinks === 3 && state.fifthSlotEmpty, `Mentions card grid or fifth nav slot contract failed: ${JSON.stringify(state)}`);
    assert(state.foldedTimes.length === 1 && state.foldedTimes.every((item) => !item.open && item.hiddenButtons === 1), `Mentions time folding mismatch: ${JSON.stringify(state.foldedTimes)}`);
    assert(state.mentionTitleClamp === '2' && state.mentionSummaryClamp === '3', `Mentions title/summary clamp contract failed: ${JSON.stringify(state)}`);
    assert(state.sources.length === 9 && state.sources.every((source) => source.label.startsWith('查看') && source.target === '_blank' && source.rel === 'noopener noreferrer' && source.borderWidth === '0px' && source.paddingLeft === '0px' && source.textDecoration.includes('underline')), `Mentions primary-source links mismatch: ${JSON.stringify(state.sources)}`);
    await page.locator('.mention-times-more summary').first().click();
    assert(await page.locator('.mention-times-more').first().getAttribute('open') !== null, 'Mentions +N control did not expand');
    await page.locator('[data-mention-event="yt-005429-hosoya-bonfire"]').first().click();
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.activeView === 'timeline');
    const navigated = await page.evaluate(() => ({
      activeView: document.querySelector('project-archive-shell')?.activeView,
      selectedEvent: document.querySelector('project-archive-shell')?.selectedEventId,
      url: location.href,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(navigated.selectedEvent === 'yt-005429-hosoya-bonfire' && /view=timeline/.test(navigated.url), `Mention time did not return to Timeline: ${JSON.stringify(navigated)}`);
    assert(state.overflow === 0 && navigated.overflow === 0 && logs.length === 0, `Mentions browser errors: ${logs.join(' | ')}`);
    evidence.mentions = { state, navigated };
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 390, height: 844 });
    await page.locator('[data-view-button="mentions"]').click();
    const state = await page.evaluate(() => {
      const card = document.querySelector('[data-mention-card]');
      const summary = card?.querySelector('.mention-card__copy p');
      return {
        columns: getComputedStyle(document.querySelector('.mentions-list')).gridTemplateColumns.split(' ').length,
        cardWidth: Math.round(card?.getBoundingClientRect().width || 0),
        summaryClamp: getComputedStyle(summary).webkitLineClamp,
        jumpLinks: document.querySelectorAll('.mentions-jump a').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    assert(state.columns === 1 && state.cardWidth > 300 && state.summaryClamp === '2', `mobile Mentions card stack mismatch: ${JSON.stringify(state)}`);
    assert(state.jumpLinks === 3 && state.overflow === 0 && logs.length === 0, `mobile Mentions navigation or overflow failed: ${JSON.stringify(state)}`);
    evidence.mobileMentions = state;
    await page.close();
  }

  {
    const { page, logs } = await openPage({ width: 1440, height: 900 });
    await page.locator('[data-view-button="sections"]').click();
    const sectionClamp = await page.locator('.section-card h3').first().evaluate((title) => getComputedStyle(title).webkitLineClamp);
    await page.locator('[data-view-button="timeline"]').click();
    const timeline = await page.evaluate(() => ({
      actTitleClamp: getComputedStyle(document.querySelector('.act-header h2')).webkitLineClamp,
      eventTitleClamp: getComputedStyle(document.querySelector('.event-heading h3')).webkitLineClamp,
      actTitleToggles: document.querySelectorAll('.act-header [data-inline-text-toggle]').length,
      navigatorTooltips: document.querySelectorAll('[data-timeline-navigator-tooltip]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(sectionClamp === '2' && timeline.actTitleClamp === '2' && timeline.eventTitleClamp === '2', `Komachoe desktop title contract failed: ${JSON.stringify({ sectionClamp, timeline })}`);
    assert(timeline.actTitleToggles === 0 && timeline.navigatorTooltips === 6 && timeline.overflow === 0 && logs.length === 0, `Komachoe desktop title navigation failed: ${JSON.stringify(timeline)}`);
    evidence.komachoeTextContract = { sectionClamp, timeline };
    await page.close();
  }

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { page, logs } = await openPage(viewport, { url: komatsuUrl });
    await page.locator('[data-view-button="timeline"]').click();
    const mobile = viewport.width <= 600;
    if (mobile) await page.locator('[data-mobile-act-toggle]').click();
    const state = await page.evaluate((isMobile) => ({
      actTitleClamp: getComputedStyle(document.querySelector('.act-header h2')).webkitLineClamp,
      eventTitleClamp: getComputedStyle(document.querySelector(isMobile ? '.event-detail-toggle > span' : '.event-heading h3')).webkitLineClamp,
      mobileMenuTitleClamp: isMobile ? getComputedStyle(document.querySelector('.timeline-navigator__mobile-menu strong')).webkitLineClamp : null,
      actTitleToggles: document.querySelectorAll('.act-header [data-inline-text-toggle]').length,
      navigatorTooltips: document.querySelectorAll('[data-timeline-navigator-tooltip]').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }), mobile);
    assert(state.actTitleClamp === '2' && state.eventTitleClamp === '2' && (!mobile || state.mobileMenuTitleClamp === '2'), `Komatsu36 ${viewport.width}px title contract failed: ${JSON.stringify(state)}`);
    assert(state.actTitleToggles === 0 && state.navigatorTooltips === 8 && state.overflow === 0 && logs.length === 0, `Komatsu36 ${viewport.width}px title navigation failed: ${JSON.stringify(state)}`);
    evidence[`komatsuTextContract${viewport.width}`] = state;
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
    await page.locator('[data-event-seek="yt-000031-production-retrospective"]').first().click();
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
    await page.locator('[data-view-button="timeline"]').click();
    const collapsed = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.timeline-event')].slice(0, 5);
      return {
        heights: cards.map((card) => card.getBoundingClientRect().height),
        summaries: cards.map((card) => getComputedStyle(card.querySelector('.event-summary')).display),
        people: cards.map((card) => getComputedStyle(card.querySelector('.event-people')).display),
      };
    });
    assert(Math.max(...collapsed.heights) <= 84, `Komachoe collapsed Events are too tall: ${JSON.stringify(collapsed)}`);
    assert(collapsed.summaries.every((display) => display === 'none') && collapsed.people.every((display) => display === 'none'), `Komachoe collapsed Events expose detail: ${JSON.stringify(collapsed)}`);

    const p11 = page.locator('[data-event-card="yt-002803-terashima-midnight-ramen"]');
    const p09 = page.locator('[data-event-card="yt-002510-no-more-dual-platform"]');
    await p11.locator('[data-event-detail]').click();
    const manual = await page.evaluate(() => ({
      selected: document.querySelector('project-archive-shell')?.selectedEventId,
      manual: document.querySelector('project-archive-shell')?.manualExpandedEventId,
      url: location.href,
      summary: getComputedStyle(document.querySelector('[data-event-card="yt-002803-terashima-midnight-ramen"] .event-summary')).display,
    }));
    assert(manual.selected === null && manual.manual === 'yt-002803-terashima-midnight-ramen' && !manual.url.includes('event=') && manual.summary === 'block', `Komachoe title click changed playback semantics: ${JSON.stringify(manual)}`);

    await p09.locator('[data-event-detail]').click();
    assert(await p11.locator('[data-event-detail]').getAttribute('aria-expanded') === 'false', 'Komachoe kept more than one manual Event expanded');
    await p11.locator('[data-event-seek]').click();
    const beforeSyncY = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => {
      const shell = document.querySelector('project-archive-shell');
      shell.playerReady = true;
      shell.player = { getCurrentTime: () => 1857, pauseVideo: () => {}, seekTo: () => {}, playVideo: () => {} };
      shell.syncFromPlayer();
    });
    const current = await page.evaluate(() => ({
      selected: document.querySelector('project-archive-shell')?.selectedEventId,
      manual: document.querySelector('project-archive-shell')?.manualExpandedEventId,
      expandedCards: [...document.querySelectorAll('.timeline-event')]
        .filter((card) => card.classList.contains('is-active') || card.classList.contains('is-manual-expanded'))
        .map((card) => card.getAttribute('data-event-card')),
      currentLabel: getComputedStyle(document.querySelector('.timeline-event.is-active [data-event-detail]'), '::after').content,
      scrollY: window.scrollY,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(current.selected === 'yt-003057-script-staging-documented' && current.manual === 'yt-002510-no-more-dual-platform', `playhead did not preserve current + one manual Event: ${JSON.stringify(current)}`);
    assert(current.expandedCards.length === 2 && current.currentLabel.includes('CURRENT') && current.scrollY === beforeSyncY, `playhead expansion stole scroll or lost disclosure state: ${JSON.stringify(current)}`);
    assert(current.overflow === 0 && logs.length === 0, `Komachoe mobile Timeline errors: ${logs.join(' | ')}`);
    evidence.mobileTimeline = { collapsed, manual, current };
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
