import { existsSync } from 'node:fs';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4321';
const projectUrl = `${baseUrl}/projects/komatsu36/?view=timeline`;
const youtubeEventId = 'yt-020950-side-program-start';
const externalEventId = 'sp1-000240-audio-finally-live';
const expectedSeekSeconds = 7790;

const fakeYouTubeApi = String.raw`(() => {
  const state = window.__n1Provider = window.__n1Provider || {
    instances: 0,
    destroyCalls: 0,
    playCalls: 0,
    pauseCalls: 0,
    seekCalls: [],
    currentTime: 0,
  };
  const PlayerState = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
  class Player {
    constructor(mount, options) {
      this.options = options;
      this.destroyed = false;
      this.iframe = document.createElement('iframe');
      this.iframe.dataset.n1FakeIframe = '';
      mount.replaceWith(this.iframe);
      state.instances += 1;
      const behavior = (window.__n1Behaviors || []).shift() || 'ready';
      window.setTimeout(() => {
        if (this.destroyed) return;
        if (behavior === 'error') options.events?.onError?.({ data: 5 });
        else if (behavior === 'ready' || behavior === 'ready-error') {
          options.events?.onReady?.({ target: this });
          if (behavior === 'ready-error') {
            window.setTimeout(() => {
              if (!this.destroyed) options.events?.onError?.({ data: 150 });
            }, 40);
          }
        }
      }, 20);
    }
    seekTo(seconds) {
      state.currentTime = Number(seconds);
      state.seekCalls.push(Number(seconds));
    }
    playVideo() {
      state.playCalls += 1;
      this.options.events?.onStateChange?.({ data: PlayerState.PLAYING });
    }
    pauseVideo() {
      state.pauseCalls += 1;
      this.options.events?.onStateChange?.({ data: PlayerState.PAUSED });
    }
    getCurrentTime() { return state.currentTime; }
    getIframe() { return this.iframe; }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      state.destroyCalls += 1;
      this.iframe.remove();
    }
  }
  window.YT = { Player, PlayerState };
  window.onYouTubeIframeAPIReady?.();
})();`;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const browser = await chromium.launch({ headless: true });

const readState = (page) => page.evaluate(() => {
  const shell = document.querySelector('project-archive-shell');
  const viewport = document.querySelector('[data-player-viewport]');
  const error = document.querySelector('[data-player-error]');
  const posterFallback = document.querySelector('[data-player-poster-fallback]');
  return {
    trackId: shell?.activeTrackId || null,
    selectedEventId: shell?.selectedEventId || null,
    loadState: shell?.playerLoadState || null,
    playerReady: Boolean(shell?.playerReady),
    hasPlayer: Boolean(shell?.player),
    pendingSeekMs: shell?.pendingSeekMs ?? null,
    mobileResumeMs: shell?.mobileResumeMs ?? null,
    mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode') || null,
    viewportHidden: Boolean(viewport?.hidden),
    errorVisible: Boolean(error && !error.hidden),
    posterFallbackVisible: Boolean(posterFallback && !posterFallback.hidden),
    mounts: document.querySelectorAll('[data-player-mount]').length,
    iframes: document.querySelectorAll('[data-player-host] iframe').length,
    provider: window.__n1Provider ? { ...window.__n1Provider, seekCalls: [...window.__n1Provider.seekCalls] } : null,
  };
});

const waitForState = (page, state) => page.waitForFunction((expected) => (
  document.querySelector('project-archive-shell')?.playerLoadState === expected
), state, { timeout: 5000 });

const createFixture = async ({ viewport = { width: 1440, height: 900 }, api = 'success', poster = 'success' } = {}) => {
  const page = await browser.newPage({ viewport });
  const control = { api, poster, heldRoute: null };
  await page.route('**/*iframe_api*', async (route) => {
    if (control.api === 'fail') return route.abort('failed');
    if (control.api === 'hold') {
      control.heldRoute = route;
      return;
    }
    return route.fulfill({ contentType: 'application/javascript', body: fakeYouTubeApi });
  });
  await page.route('**/img.youtube.com/**', async (route) => (
    control.poster === 'fail' ? route.abort('failed') : route.continue()
  ));
  await page.goto(projectUrl, { waitUntil: 'domcontentloaded' });
  return { page, control };
};

const clickYouTubeEvent = async (page) => {
  await page.locator(`[data-event-seek="${youtubeEventId}"]`).click();
};

try {
  const evidence = {};

  {
    const { page } = await createFixture();
    await page.evaluate(() => { window.__n1Behaviors = ['ready']; });
    await clickYouTubeEvent(page);
    await waitForState(page, 'ready');
    const state = await readState(page);
    assert(state.playerReady && state.iframes === 1 && state.mounts === 0, `normal load violated the unique-player invariant: ${JSON.stringify(state)}`);
    assert(state.selectedEventId === youtubeEventId && state.pendingSeekMs === null, `normal load lost its Event/seek: ${JSON.stringify(state)}`);
    assert(state.provider.playCalls === 1 && state.provider.seekCalls.at(-1) === expectedSeekSeconds, `normal load did not seek/play: ${JSON.stringify(state)}`);
    evidence.normal = state;
    await page.close();
  }

  {
    const { page } = await createFixture();
    await page.evaluate(() => { window.__n1Behaviors = ['ready-error', 'ready']; });
    await clickYouTubeEvent(page);
    await waitForState(page, 'error');
    const failedAfterReady = await readState(page);
    assert(failedAfterReady.selectedEventId === youtubeEventId && failedAfterReady.pendingSeekMs === expectedSeekSeconds * 1000,
      `provider error after ready lost the Event resume time: ${JSON.stringify(failedAfterReady)}`);
    await page.locator('[data-player-retry]').click();
    await waitForState(page, 'ready');
    const recovered = await readState(page);
    assert(recovered.provider.seekCalls.at(-1) === expectedSeekSeconds && recovered.provider.playCalls === 2,
      `provider-error retry did not resume the selected Event: ${JSON.stringify(recovered)}`);
    evidence.providerErrorAfterReady = { failedAfterReady, recovered };
    await page.close();
  }

  {
    const { page, control } = await createFixture({ api: 'fail' });
    await clickYouTubeEvent(page);
    await waitForState(page, 'error');
    const failed = await readState(page);
    assert(failed.errorVisible && !failed.viewportHidden && failed.iframes === 0 && failed.mounts === 1, `API failure damaged the viewport/mount: ${JSON.stringify(failed)}`);
    assert(failed.selectedEventId === youtubeEventId && failed.pendingSeekMs === expectedSeekSeconds * 1000, `API failure lost TARGET/pending seek: ${JSON.stringify(failed)}`);
    control.api = 'success';
    await page.evaluate(() => { window.__n1Behaviors = ['ready']; });
    await page.locator('[data-player-retry]').click();
    await waitForState(page, 'ready');
    const recovered = await readState(page);
    assert(recovered.playerReady && recovered.iframes === 1 && recovered.mounts === 0, `API retry did not recover uniquely: ${JSON.stringify(recovered)}`);
    assert(recovered.pendingSeekMs === null && recovered.provider.seekCalls.at(-1) === expectedSeekSeconds, `API retry lost the pending Event seek: ${JSON.stringify(recovered)}`);
    evidence.apiFailureRecovery = { failed, recovered };
    await page.close();
  }

  {
    const { page, control } = await createFixture({ api: 'hold' });
    await clickYouTubeEvent(page);
    await waitForState(page, 'loading');
    await page.waitForFunction(() => Boolean(document.querySelector('project-archive-shell')?.playerLoadPromise));
    await control.heldRoute.abort('internetdisconnected');
    control.heldRoute = null;
    await waitForState(page, 'error');
    const failed = await readState(page);
    control.api = 'success';
    await page.evaluate(() => { window.__n1Behaviors = ['ready']; });
    await page.locator('[data-player-retry]').click();
    await waitForState(page, 'ready');
    const recovered = await readState(page);
    assert(failed.errorVisible && recovered.playerReady && recovered.iframes === 1, `mid-load disconnect did not recover: ${JSON.stringify({ failed, recovered })}`);
    evidence.midLoadDisconnect = { failed, recovered };
    await page.close();
  }

  {
    const { page } = await createFixture({ poster: 'fail' });
    await page.waitForFunction(() => document.querySelector('project-archive-shell')?.playerPosterFailed === true);
    const posterFailed = await readState(page);
    await page.evaluate(() => { window.__n1Behaviors = ['ready']; });
    await clickYouTubeEvent(page);
    await waitForState(page, 'ready');
    const playerReady = await readState(page);
    assert(posterFailed.posterFallbackVisible && playerReady.playerReady && playerReady.iframes === 1, `poster failure blocked Player load: ${JSON.stringify({ posterFailed, playerReady })}`);
    evidence.posterFailure = { posterFailed, playerReady };
    await page.close();
  }

  {
    const { page, control } = await createFixture({ api: 'hold' });
    await clickYouTubeEvent(page);
    await waitForState(page, 'loading');
    await page.locator('[data-timeline-scope-button="space-1"]').click();
    await page.locator(`[data-event-seek="${externalEventId}"]`).click();
    await control.heldRoute.fulfill({ contentType: 'application/javascript', body: fakeYouTubeApi });
    control.heldRoute = null;
    await page.waitForTimeout(100);
    const state = await readState(page);
    assert(state.trackId === 'space-1' && state.selectedEventId === externalEventId, `source switch did not select SP1: ${JSON.stringify(state)}`);
    assert(state.iframes === 0 && !state.hasPlayer && state.viewportHidden, `stale YouTube attempt revived after SP1 switch: ${JSON.stringify(state)}`);
    assert(state.pendingSeekMs === null, `external Event polluted the pending YouTube seek: ${JSON.stringify(state)}`);
    evidence.loadingSwitch = state;
    await page.close();
  }

  {
    const { page } = await createFixture();
    await page.evaluate(() => { window.__n1Behaviors = ['error', 'error', 'ready']; });
    await clickYouTubeEvent(page);
    await waitForState(page, 'error');
    const firstFailure = await readState(page);
    await page.locator('[data-player-retry]').click();
    await waitForState(page, 'error');
    const secondFailure = await readState(page);
    await page.locator('[data-player-retry]').click();
    await waitForState(page, 'ready');
    const recovered = await readState(page);
    for (const [label, state] of Object.entries({ firstFailure, secondFailure, recovered })) {
      assert(state.iframes <= 1, `${label} created duplicate iframes: ${JSON.stringify(state)}`);
    }
    assert(recovered.playerReady && recovered.provider.instances === 3 && recovered.provider.destroyCalls === 2, `continuous retry lifecycle mismatch: ${JSON.stringify(recovered)}`);
    evidence.continuousRetry = { firstFailure, secondFailure, recovered };
    await page.close();
  }

  {
    const { page, control } = await createFixture({ viewport: { width: 390, height: 844 }, api: 'hold' });
    await clickYouTubeEvent(page);
    await waitForState(page, 'loading');
    await page.locator('[data-player-mode-toggle]').click();
    const loadingBubble = await readState(page);
    assert(loadingBubble.mode === 'bubble' && loadingBubble.pendingSeekMs === expectedSeekSeconds * 1000, `loading Bubble lost its pending time: ${JSON.stringify(loadingBubble)}`);
    await page.evaluate(() => { window.__n1Behaviors = ['ready']; });
    await control.heldRoute.fulfill({ contentType: 'application/javascript', body: fakeYouTubeApi });
    control.heldRoute = null;
    await waitForState(page, 'ready');
    const readyBubble = await readState(page);
    assert(readyBubble.mode === 'bubble' && readyBubble.provider.playCalls === 0 && readyBubble.mobileResumeMs === expectedSeekSeconds * 1000, `Bubble autoplayed or lost resume time: ${JSON.stringify(readyBubble)}`);
    await page.locator('[data-player-bubble]').click();
    await page.waitForTimeout(50);
    const expanded = await readState(page);
    assert(expanded.mode === 'expanded' && expanded.provider.playCalls === 0 && expanded.provider.seekCalls.at(-1) === expectedSeekSeconds, `Bubble expand autoplayed or restored the wrong time: ${JSON.stringify(expanded)}`);
    evidence.mobileBubble = { loadingBubble, readyBubble, expanded };
    await page.close();
  }

  console.log(JSON.stringify({ evidence }, null, 2));
  console.log('YouTube N1 controlled regression passed.');
} finally {
  await browser.close();
}
