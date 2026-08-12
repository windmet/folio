import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) {
  throw new Error('Playwright is not installed. Run npm install in scripts/xhs-exporter before this verifier.');
}

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.RC12_T1_BASE_URL || 'http://127.0.0.1:4322';
const projectUrl = `${baseUrl}/projects/komatsu36/?view=timeline`;
const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (outputDir) mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];
const viewports = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const closeEnough = (left, right, tolerance = 1) => Math.abs(left - right) <= tolerance;

const readLayout = async (page) => page.evaluate(() => {
  const rect = (selector) => {
    const box = document.querySelector(selector)?.getBoundingClientRect();
    return box ? {
      left: Number(box.left.toFixed(2)),
      right: Number(box.right.toFixed(2)),
      top: Number(box.top.toFixed(2)),
      bottom: Number(box.bottom.toFixed(2)),
      width: Number(box.width.toFixed(2)),
      height: Number(box.height.toFixed(2)),
    } : null;
  };
  const segments = document.querySelector('.timeline-navigator__segments');
  const navigator = document.querySelector('[data-timeline-navigator]');
  const a03 = document.querySelectorAll('[data-timeline-navigator-segment]')[2];
  const a03Label = a03?.querySelector('strong');
  return {
    mode: document.querySelector('[data-player-frame]')?.getAttribute('data-player-mode'),
    dockedClass: document.querySelector('project-archive-shell')?.classList.contains('is-player-docked'),
    shell: rect('project-archive-shell'),
    workspace: rect('.project-workspace'),
    content: rect('.project-content'),
    navigator: rect('[data-timeline-navigator]'),
    segments: rect('.timeline-navigator__segments'),
    player: rect('.project-player-column'),
    playerFrame: rect('[data-player-frame]'),
    playerPosition: getComputedStyle(document.querySelector('.project-player-column')).position,
    playerTop: getComputedStyle(document.querySelector('.project-player-column')).top,
    navigatorGeometryAttr: navigator?.getAttribute('data-timeline-geometry'),
    safeInsetLeft: navigator && segments
      ? Number((segments.getBoundingClientRect().left - navigator.getBoundingClientRect().left).toFixed(2))
      : null,
    safeInsetRight: navigator && segments
      ? Number((navigator.getBoundingClientRect().right - segments.getBoundingClientRect().right).toFixed(2))
      : null,
    a03: rect('.timeline-navigator__segment:nth-child(3)'),
    a03TitleDisplay: a03Label ? getComputedStyle(a03Label).display : null,
    a03JustifyItems: a03 ? getComputedStyle(a03).justifyItems : null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});

const inspectTooltip = async (page, index, interaction) => {
  const segment = page.locator('.timeline-navigator__segment').nth(index);
  if (interaction === 'hover') await segment.hover();
  else await segment.locator('button').focus();
  await page.waitForTimeout(150);
  return segment.evaluate((item) => {
    const tooltip = item.querySelector('[data-timeline-navigator-tooltip]');
    const box = tooltip.getBoundingClientRect();
    const style = getComputedStyle(tooltip);
    return {
      text: tooltip.textContent.trim(),
      visibility: style.visibility,
      opacity: style.opacity,
      left: Number(box.left.toFixed(2)),
      right: Number(box.right.toFixed(2)),
      viewportWidth: document.documentElement.clientWidth,
      focused: item.querySelector('button') === document.activeElement,
    };
  });
};

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageLogs = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') pageLogs.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => pageLogs.push(`pageerror: ${error.message}`));
    await page.goto(projectUrl, { waitUntil: 'networkidle' });

    const expanded = await readLayout(page);
    assert(expanded.mode === 'expanded' && expanded.dockedClass === false, `${viewport.width}: expected Expanded mode`);
    assert(expanded.navigatorGeometryAttr === null, `${viewport.width}: rejected geometry attribute remains`);
    assert(closeEnough(expanded.navigator.left, expanded.content.left), `${viewport.width}: Navigator left is not inline with content`);
    assert(closeEnough(expanded.navigator.right, expanded.content.right), `${viewport.width}: Navigator right is not inline with content`);
    assert(expanded.navigator.right < expanded.player.left, `${viewport.width}: Navigator overlaps Player column`);
    assert(expanded.playerPosition === 'sticky' && expanded.playerTop === '96px', `${viewport.width}: Player sticky top is not independent 96px`);
    assert(closeEnough(expanded.safeInsetLeft, 14) && closeEnough(expanded.safeInsetRight, 14), `${viewport.width}: expected 14px safe insets`);
    assert(expanded.a03.width < 58 && expanded.a03TitleDisplay === 'none', `${viewport.width}: A03 must use narrow Axx-only projection`);
    assert(expanded.a03JustifyItems === 'center', `${viewport.width}: A03 index must be centered`);
    assert(expanded.overflow === 0, `${viewport.width}: Expanded overflow ${expanded.overflow}`);

    const tooltips = {};
    for (const index of [0, 2, 7]) {
      const key = `A${String(index + 1).padStart(2, '0')}`;
      tooltips[`${key}Hover`] = await inspectTooltip(page, index, 'hover');
      tooltips[`${key}Focus`] = await inspectTooltip(page, index, 'focus');
      for (const state of [tooltips[`${key}Hover`], tooltips[`${key}Focus`]]) {
        assert(state.text.startsWith(`ACT ${String(index + 1).padStart(2, '0')} · `), `${viewport.width}: ${key} tooltip text is incomplete`);
        assert(state.visibility === 'visible' && state.opacity === '1', `${viewport.width}: ${key} tooltip is not visible`);
        assert(state.left >= 0 && state.right <= state.viewportWidth, `${viewport.width}: ${key} tooltip leaves viewport`);
      }
      assert(tooltips[`${key}Focus`].focused, `${viewport.width}: ${key} keyboard focus was not retained`);
    }

    if (outputDir) {
      await page.screenshot({ path: path.join(outputDir, `${viewport.width}x${viewport.height}-expanded.png`), fullPage: false });
    }

    await page.locator('[data-player-mode-toggle]').click();
    await page.waitForTimeout(100);
    const docked = await readLayout(page);
    assert(docked.mode === 'docked' && docked.dockedClass === true, `${viewport.width}: expected Docked mode`);
    assert(closeEnough(docked.navigator.left, docked.content.left), `${viewport.width}: Docked Navigator left is not inline`);
    assert(closeEnough(docked.navigator.right, docked.content.right), `${viewport.width}: Docked Navigator right is not inline`);
    assert(docked.navigator.width > expanded.navigator.width, `${viewport.width}: Docked workspace did not naturally widen Navigator`);
    assert(docked.playerFrame.height === 72, `${viewport.width}: Docked Player is not the 72px bottom bar`);
    assert(docked.overflow === 0, `${viewport.width}: Docked overflow ${docked.overflow}`);
    assert(closeEnough(docked.safeInsetLeft, 14) && closeEnough(docked.safeInsetRight, 14), `${viewport.width}: Docked safe inset changed`);
    if (outputDir) {
      await page.screenshot({ path: path.join(outputDir, `${viewport.width}x${viewport.height}-docked.png`), fullPage: false });
    }

    assert(pageLogs.length === 0, `${viewport.width}: console errors: ${pageLogs.join(' | ')}`);
    evidence.push({ viewport, expanded, docked, tooltips, console: pageLogs });
    await page.close();
  }

  console.log(JSON.stringify({ route: projectUrl, outputDir, evidence }, null, 2));
} finally {
  await browser.close();
}
