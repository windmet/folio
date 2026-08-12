import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) {
  throw new Error('Playwright is not installed. Run npm install in scripts/xhs-exporter before this verifier.');
}

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const eventId = 'yt-042252-seigura-superchat';
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const logs = [];

const runHandoff = async (page, selector, key, throwOnPause = false) => {
  await page.evaluate(({ selector: targetSelector, key: targetKey, shouldThrow }) => {
    const shell = document.querySelector('project-archive-shell');
    document.documentElement.dataset[`y1PauseCalls${targetKey}`] = '0';
    shell.pendingSeekMs = 987654;
    shell.stopPlaybackSync();
    shell.playbackSyncTimer = window.setInterval(() => {}, 60_000);
    shell.playerReady = true;
    shell.player = {
      pauseVideo: () => {
        const datasetKey = `y1PauseCalls${targetKey}`;
        document.documentElement.dataset[datasetKey] = String(Number(document.documentElement.dataset[datasetKey]) + 1);
        if (shouldThrow) throw new Error('expected provider teardown');
      },
    };
    document.addEventListener('click', (event) => {
      if (event.target.closest(targetSelector)) event.preventDefault();
    }, { capture: true, once: true });
  }, { selector, key, throwOnPause });

  await page.locator(selector).dispatchEvent('click');
  return page.evaluate((targetKey) => {
    const shell = document.querySelector('project-archive-shell');
    return {
      pendingSeekMs: shell.pendingSeekMs,
      playbackSyncTimer: shell.playbackSyncTimer,
      pauseCalls: Number(document.documentElement.dataset[`y1PauseCalls${targetKey}`]),
    };
  }, key);
};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
  await page.goto(`${projectUrl}?view=timeline&event=${eventId}`, { waitUntil: 'networkidle' });

  const active = await page.locator(`[data-event-card="${eventId}"]`).evaluate((card) => card.classList.contains('is-active'));
  assert(active, 'Y1 fixture event did not restore as active');

  const selectors = ['[data-player-fallback]', '[data-player-rail-source]'];
  const links = {};
  for (const selector of selectors) {
    const link = page.locator(selector);
    await link.waitFor({ state: 'attached' });
    links[selector] = {
      href: await link.getAttribute('href'),
      target: await link.getAttribute('target'),
      rel: await link.getAttribute('rel'),
      hook: await link.getAttribute('data-external-youtube-handoff'),
    };
  }

  const expectedHref = 'https://www.youtube.com/watch?v=jszQ4MQfRg8&t=15772s';
  for (const [selector, link] of Object.entries(links)) {
    assert(link.href === expectedHref, `${selector} timestamp href mismatch: ${JSON.stringify(link)}`);
    assert(link.target === '_blank' && link.rel === 'noopener noreferrer' && link.hook === '', `${selector} safety/handoff attributes mismatch: ${JSON.stringify(link)}`);
  }

  const fallback = await runHandoff(page, '[data-player-fallback]', 'Fallback');
  assert(fallback.pendingSeekMs === null && fallback.playbackSyncTimer === null && fallback.pauseCalls === 1,
    `fallback did not complete Y1 pause handoff: ${JSON.stringify(fallback)}`);

  const rail = await runHandoff(page, '[data-player-rail-source]', 'Rail', true);
  assert(rail.pendingSeekMs === null && rail.playbackSyncTimer === null && rail.pauseCalls === 1,
    `rail did not preserve Y1 handoff during provider teardown: ${JSON.stringify(rail)}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow === 0, `Y1 desktop overflow: ${overflow}`);
  assert(logs.length === 0, `Y1 console/page errors: ${logs.join(' | ')}`);

  if (outputDir) await page.screenshot({ path: path.join(outputDir, '1440x900-y1-handoff.png'), fullPage: false });
  console.log(JSON.stringify({ active, links, fallback, rail, overflow, console: logs, outputDir }, null, 2));
} finally {
  await browser.close();
}
