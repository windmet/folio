import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const youtubeEventId = 'yt-011843-hama-no-gift';
const externalEventId = 'sp1-000240-audio-finally-live';
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const attachLogChecks = (page, logs) => {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
};
const readState = (page) => page.evaluate(() => {
  const frame = document.querySelector('[data-player-frame]');
  const bubble = document.querySelector('[data-player-bubble]');
  const player = document.querySelector('[data-player]');
  const viewport = document.querySelector('[data-player-viewport]');
  const shell = document.querySelector('project-archive-shell');
  const rectangle = (element) => element?.getBoundingClientRect().toJSON() || null;
  return {
    mode: frame?.getAttribute('data-player-mode'),
    provider: frame?.getAttribute('data-player-provider'),
    selectedEventId: shell?.selectedEventId || null,
    frame: rectangle(frame),
    bubble: rectangle(bubble),
    player: rectangle(player),
    viewport: rectangle(viewport),
    bubbleDisplay: bubble ? getComputedStyle(bubble).display : null,
    bubbleVisibility: frame ? getComputedStyle(frame).visibility : null,
    playerDisplay: player ? getComputedStyle(player).display : null,
    framePosition: frame ? getComputedStyle(frame).position : null,
    bodyPosition: getComputedStyle(document.body).position,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    mounts: document.querySelectorAll('[data-player-mount]').length,
    iframes: document.querySelectorAll('iframe').length,
    bubbleCode: document.querySelector('[data-player-bubble-code]')?.textContent?.trim(),
    bubbleSymbol: document.querySelector('[data-player-bubble-symbol]')?.textContent?.trim(),
  };
});
const assertBubble = (state, label) => {
  assert(state.mode === 'bubble', `${label} did not default to Bubble: ${JSON.stringify(state)}`);
  assert(state.framePosition === 'fixed', `${label} Bubble is not fixed`);
  assert(state.bubbleDisplay !== 'none' && state.bubble?.width >= 55 && state.bubble?.height >= 55, `${label} Bubble is not 56px`);
  assert(state.playerDisplay === 'none', `${label} hidden player panel still occupies the page`);
  assert(state.bodyPosition !== 'fixed', `${label} Bubble locked body scrolling`);
  assert(state.mounts === 1 && state.iframes <= 1, `${label} violated the single player invariant`);
  assert(state.overflow === 0, `${label} horizontal overflow: ${state.overflow}`);
};
const assertExpanded = (state, label) => {
  assert(state.mode === 'expanded' && state.framePosition === 'fixed', `${label} did not open the floating panel`);
  assert(state.playerDisplay !== 'none', `${label} expanded panel is hidden`);
  assert(state.viewport?.width >= 200 && state.viewport?.height >= 199.5, `${label} media viewport is below 200x200: ${JSON.stringify(state.viewport)}`);
  assert(state.bodyPosition !== 'fixed', `${label} floating panel locked body scrolling`);
  assert(state.mounts === 1 && state.iframes <= 1, `${label} violated the single player invariant`);
  assert(state.overflow === 0, `${label} horizontal overflow: ${state.overflow}`);
};

const browser = await chromium.launch({ headless: true });
try {
  const evidence = { mobile: {}, interaction: {}, desktop: {} };
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 414, height: 896 },
  ]) {
    const label = `${viewport.width}x${viewport.height}`;
    const logs = [];
    const page = await browser.newPage({ viewport });
    attachLogChecks(page, logs);
    await page.goto(`${projectUrl}?view=timeline&event=${youtubeEventId}`, { waitUntil: 'networkidle' });
    const bubbleState = await readState(page);
    assertBubble(bubbleState, label);
    assert(bubbleState.bubbleCode === 'YT' && bubbleState.bubbleSymbol === '▶', `${label} YouTube Bubble identity is wrong`);

    await page.locator('[data-player-bubble]').click();
    const expandedState = await readState(page);
    assertExpanded(expandedState, label);
    if (outputDir && viewport.width === 390) {
      await page.screenshot({ path: path.join(outputDir, '390x844-expanded.png'), fullPage: false });
      await page.locator('[data-player-mode-toggle]').click();
      await page.screenshot({ path: path.join(outputDir, '390x844-bubble.png'), fullPage: false });
    }
    assert(logs.length === 0, `${label} console errors: ${logs.join(' | ')}`);
    evidence.mobile[label] = {
      bubble: { size: [bubbleState.bubble.width, bubbleState.bubble.height], mode: bubbleState.mode },
      expanded: { viewport: [expandedState.viewport.width, expandedState.viewport.height], mode: expandedState.mode },
      overflow: expandedState.overflow,
      console: logs,
    };
    await page.close();
  }

  const interactionLogs = [];
  const interaction = await browser.newPage({ viewport: { width: 390, height: 844 } });
  attachLogChecks(interaction, interactionLogs);
  await interaction.goto(`${projectUrl}?view=timeline&event=${youtubeEventId}`, { waitUntil: 'networkidle' });
  await interaction.locator('[data-player-bubble]').click();
  await interaction.evaluate(() => {
    const shell = document.querySelector('project-archive-shell');
    document.documentElement.dataset.m1MockTime = '4783.25';
    document.documentElement.dataset.m1PauseCalls = '0';
    document.documentElement.dataset.m1PlayCalls = '0';
    document.documentElement.dataset.m1SeekTarget = '';
    shell.playerReady = true;
    shell.pendingSeekMs = 1234;
    shell.player = {
      getCurrentTime: () => Number(document.documentElement.dataset.m1MockTime),
      pauseVideo: () => {
        document.documentElement.dataset.m1PauseCalls = String(Number(document.documentElement.dataset.m1PauseCalls) + 1);
      },
      playVideo: () => {
        document.documentElement.dataset.m1PlayCalls = String(Number(document.documentElement.dataset.m1PlayCalls) + 1);
      },
      seekTo: (seconds) => {
        document.documentElement.dataset.m1SeekTarget = String(seconds);
      },
    };
  });
  await interaction.locator('[data-player-mode-toggle]').click();
  let compliance = await interaction.evaluate(() => {
    const shell = document.querySelector('project-archive-shell');
    return {
      mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
      pauseCalls: Number(document.documentElement.dataset.m1PauseCalls),
      playCalls: Number(document.documentElement.dataset.m1PlayCalls),
      pendingSeekMs: shell.pendingSeekMs,
      resumeMs: shell.mobileResumeMs,
    };
  });
  assert(compliance.mode === 'bubble' && compliance.pauseCalls === 1, `collapse did not pause: ${JSON.stringify(compliance)}`);
  assert(compliance.pendingSeekMs === null && compliance.resumeMs === 4783250, `collapse did not preserve clean resume state: ${JSON.stringify(compliance)}`);
  assert(compliance.playCalls === 0, 'collapse unexpectedly played media');

  await interaction.evaluate(() => { document.documentElement.dataset.m1MockTime = '4700'; });
  await interaction.locator('[data-player-bubble]').click();
  await interaction.waitForTimeout(50);
  compliance = await interaction.evaluate(() => ({
    mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
    seekTarget: Number(document.documentElement.dataset.m1SeekTarget),
    pauseCalls: Number(document.documentElement.dataset.m1PauseCalls),
    playCalls: Number(document.documentElement.dataset.m1PlayCalls),
  }));
  assert(compliance.mode === 'expanded' && Math.abs(compliance.seekTarget - 4783.25) < 0.01, `expand did not restore the saved position: ${JSON.stringify(compliance)}`);
  assert(compliance.playCalls === 0, `expand auto-played media: ${JSON.stringify(compliance)}`);

  await interaction.locator('[data-player-mode-toggle]').click();
  await interaction.locator(`[data-event-card="${youtubeEventId}"] [data-open-person="hama-kento"]`).click();
  const modalState = await readState(interaction);
  assert(modalState.bubbleVisibility === 'hidden', `Person modal did not hide Bubble: ${JSON.stringify(modalState)}`);
  await interaction.locator('[data-person-panel] .panel-close').click();
  assert((await readState(interaction)).bubbleVisibility === 'visible', 'Bubble did not return after Person modal closed');

  await interaction.goto(`${projectUrl}?view=timeline&event=${externalEventId}`, { waitUntil: 'networkidle' });
  const externalBubble = await readState(interaction);
  assertBubble(externalBubble, 'SP1 external source');
  assert(externalBubble.provider === 'external' && externalBubble.bubbleCode === 'SP1' && externalBubble.bubbleSymbol === '↗', 'External Bubble pretends to be a player');
  await interaction.locator('[data-player-bubble]').click();
  const externalExpanded = await readState(interaction);
  assert(externalExpanded.iframes === 0, 'External expanded panel created an iframe');
  assert((await interaction.locator('[data-player-unavailable]').innerText()).includes('EXTERNAL SOURCE'), 'External expanded panel lost its source boundary');

  await interaction.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
  await interaction.evaluate(() => {
    const shell = document.querySelector('project-archive-shell');
    document.documentElement.dataset.m1ExplicitSeek = '';
    document.documentElement.dataset.m1ExplicitPlay = '0';
    shell.playerReady = true;
    shell.player = {
      seekTo: (seconds) => { document.documentElement.dataset.m1ExplicitSeek = String(seconds); },
      playVideo: () => { document.documentElement.dataset.m1ExplicitPlay = String(Number(document.documentElement.dataset.m1ExplicitPlay) + 1); },
      pauseVideo: () => {},
      getCurrentTime: () => 0,
    };
  });
  await interaction.locator(`[data-event-seek="${youtubeEventId}"]`).click();
  const explicitPlay = await interaction.evaluate(() => ({
    mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
    selected: document.querySelector('project-archive-shell')?.selectedEventId,
    seekTarget: Number(document.documentElement.dataset.m1ExplicitSeek),
    playCalls: Number(document.documentElement.dataset.m1ExplicitPlay),
  }));
  assert(explicitPlay.mode === 'expanded' && explicitPlay.selected === youtubeEventId, `explicit Timeline play did not open the panel: ${JSON.stringify(explicitPlay)}`);
  assert(Math.abs(explicitPlay.seekTarget - 4723) < 0.01 && explicitPlay.playCalls === 1, `explicit Timeline play did not seek/play: ${JSON.stringify(explicitPlay)}`);

  await interaction.goto(`${projectUrl}?view=timeline`, { waitUntil: 'networkidle' });
  await interaction.locator('.media-sources__disclosure > summary').click();
  await interaction.locator('[data-source-browse="space-1"]').click();
  await interaction.locator(`[data-source-event="${externalEventId}"]`).click();
  assert((await readState(interaction)).mode === 'bubble', 'source index selection forced the mobile panel open');
  await interaction.goBack({ waitUntil: 'networkidle' });
  assert((await readState(interaction)).selectedEventId === null, 'Back did not restore the track-only state');
  await interaction.goForward({ waitUntil: 'networkidle' });
  assert((await readState(interaction)).mode === 'bubble', 'Forward did not restore the selected Event Bubble');
  assert(interactionLogs.length === 0, `interaction console errors: ${interactionLogs.join(' | ')}`);
  evidence.interaction = { compliance, explicitPlay, external: externalBubble, console: interactionLogs };
  await interaction.close();

  const landscape = await browser.newPage({ viewport: { width: 844, height: 390 } });
  await landscape.goto(`${projectUrl}?view=timeline&event=${youtubeEventId}`, { waitUntil: 'networkidle' });
  assertBubble(await readState(landscape), '844x390 landscape');
  await landscape.locator('[data-player-bubble]').click();
  const landscapeExpanded = await readState(landscape);
  assertExpanded(landscapeExpanded, '844x390 landscape');
  assert(landscapeExpanded.frame.height <= 358.5, `landscape panel exceeds viewport safe area: ${JSON.stringify(landscapeExpanded.frame)}`);
  await landscape.close();

  const desktopLogs = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  attachLogChecks(desktop, desktopLogs);
  await desktop.goto(`${projectUrl}?view=timeline&event=${youtubeEventId}`, { waitUntil: 'networkidle' });
  let desktopState = await readState(desktop);
  assert(desktopState.mode === 'expanded' && desktopState.framePosition !== 'fixed', `desktop default Player changed: ${JSON.stringify(desktopState)}`);
  await desktop.locator('[data-player-mode-toggle]').click();
  desktopState = await readState(desktop);
  assert(desktopState.mode === 'docked' && desktopState.framePosition === 'fixed', `desktop Docked mode regressed: ${JSON.stringify(desktopState)}`);
  assert(desktopState.mounts === 1 && desktopState.overflow === 0, 'desktop regression violated mount/overflow invariants');
  assert(desktopLogs.length === 0, `desktop console errors: ${desktopLogs.join(' | ')}`);
  evidence.desktop = { mode: desktopState.mode, mounts: desktopState.mounts, overflow: desktopState.overflow, console: desktopLogs };
  await desktop.close();

  console.log(JSON.stringify({ evidence, outputDir }, null, 2));
} finally {
  await browser.close();
}
