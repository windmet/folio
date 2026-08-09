import { existsSync } from 'node:fs';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) {
  throw new Error('Playwright is not installed. Run npm install in scripts/xhs-exporter before this verifier.');
}

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.RC12_E_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const browser = await chromium.launch({ headless: true });
const errors = [];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const readScope = async (page) => page.evaluate(() => ({
  scope: document.querySelector('[data-timeline-scope-button][aria-pressed="true"]')?.dataset.timelineScopeButton,
  active: document.activeElement?.dataset.timelineScopeButton || null,
  url: location.href,
}));

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${projectUrl}?view=timeline`);

  const initial = await page.evaluate(() => ({
    scope: document.querySelector('[data-timeline-scope-button][aria-pressed="true"]')?.dataset.timelineScopeButton,
    buttons: document.querySelectorAll('[data-timeline-scope-button]').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    duplicateIds: [...document.querySelectorAll('[id]')]
      .map((element) => element.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index),
  }));
  assert(initial.scope === 'yt-main', `expected initial yt-main scope, got ${initial.scope}`);
  assert(initial.buttons === 3, `expected 3 scope buttons, got ${initial.buttons}`);
  assert(initial.overflow === 0, `expected desktop overflow 0, got ${initial.overflow}`);
  assert(initial.duplicateIds.length === 0, `duplicate DOM ids: ${initial.duplicateIds.join(', ')}`);
  assert(await page.getByRole('button', { name: /Timeline scope/ }).count() === 3, 'expected 3 named Timeline scope buttons');

  const sp1 = page.locator('[data-timeline-scope-button="space-1"]');
  await sp1.focus();
  await sp1.press('Enter');
  await page.waitForTimeout(50);
  const enter = await readScope(page);
  assert(enter.scope === 'space-1' && enter.active === 'space-1', `Enter did not activate SP1: ${JSON.stringify(enter)}`);
  assert(enter.url.includes('track=space-1'), `SP1 URL missing track: ${enter.url}`);

  const sp2 = page.locator('[data-timeline-scope-button="space-2"]');
  await sp2.focus();
  await sp2.press(' ');
  await page.waitForTimeout(50);
  const space = await readScope(page);
  assert(space.scope === 'space-2' && space.active === 'space-2', `Space did not activate SP2: ${JSON.stringify(space)}`);
  assert(space.url.includes('track=space-2'), `SP2 URL missing track: ${space.url}`);

  await page.goBack();
  await page.waitForTimeout(50);
  const back = await readScope(page);
  assert(back.scope === 'space-1' && back.url.includes('track=space-1'), `Back did not restore SP1: ${JSON.stringify(back)}`);

  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const narrowLogs = [];
  narrow.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') narrowLogs.push(`${message.type()}: ${message.text()}`);
  });
  narrow.on('pageerror', (error) => narrowLogs.push(`pageerror: ${error.message}`));
  await narrow.goto(`${projectUrl}?view=timeline&track=space-1`);
  const mobile = await narrow.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    scopeBlock: Math.round(document.querySelector('[data-timeline-scope]')?.getBoundingClientRect().height || 0),
    buttons: [...document.querySelectorAll('[data-timeline-scope-button]')].map((button) => ({
      width: Math.round(button.getBoundingClientRect().width),
      height: Math.round(button.getBoundingClientRect().height),
    })),
    events: document.querySelector('[data-timeline-scope-panel="space-1"]')?.querySelectorAll('[data-timeline-event]').length,
  }));
  assert(mobile.overflow === 0, `expected mobile overflow 0, got ${mobile.overflow}`);
  assert(mobile.scopeBlock === 159, `expected mobile scope block 159px, got ${mobile.scopeBlock}`);
  assert(mobile.buttons.every(({ width, height }) => width === 114 && height === 74), `unexpected mobile scope buttons: ${JSON.stringify(mobile.buttons)}`);
  assert(mobile.events === 8, `expected 8 SP1 events on mobile, got ${mobile.events}`);
  errors.push(...narrowLogs);

  const medium = await browser.newPage({ viewport: { width: 901, height: 780 } });
  const mediumLogs = [];
  medium.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') mediumLogs.push(`${message.type()}: ${message.text()}`);
  });
  medium.on('pageerror', (error) => mediumLogs.push(`pageerror: ${error.message}`));
  await medium.goto(`${projectUrl}?view=timeline&track=space-1`);
  const mediumLayout = await medium.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    scopeButtons: [...document.querySelectorAll('[data-timeline-scope-button]')].map((button) => Math.round(button.getBoundingClientRect().width)),
    eventCard: Math.round(document.querySelector('[data-timeline-scope-panel="space-1"] [data-timeline-event]')?.getBoundingClientRect().width || 0),
    player: Math.round(document.querySelector('.project-player-column')?.getBoundingClientRect().width || 0),
  }));
  assert(mediumLayout.overflow === 0, `expected medium overflow 0, got ${mediumLayout.overflow}`);
  assert(mediumLayout.scopeButtons.every((width) => width >= 100), `medium scope buttons are too narrow: ${JSON.stringify(mediumLayout.scopeButtons)}`);
  assert(mediumLayout.eventCard > 0 && mediumLayout.player > 0, `medium layout missing Event card or Player: ${JSON.stringify(mediumLayout)}`);
  errors.push(...mediumLogs);

  assert(errors.length === 0, `browser console errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({ initial, enter, space, back, mobile, medium: mediumLayout, console: errors }, null, 2));
} finally {
  await browser.close();
}
