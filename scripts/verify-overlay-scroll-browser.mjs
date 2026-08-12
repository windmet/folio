import { existsSync } from 'node:fs';

const playwrightModule = new URL('./xhs-exporter/node_modules/playwright/index.mjs', import.meta.url);
if (!existsSync(playwrightModule)) throw new Error('Playwright is not installed in scripts/xhs-exporter.');

const { chromium } = await import(playwrightModule.href);
const baseUrl = process.env.KOMATSU36_BASE_URL || 'http://127.0.0.1:4321';
const projectUrl = `${baseUrl}/projects/komatsu36/`;
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const panelState = (page, selector) => page.locator(selector).evaluate((panel) => ({
  scrollTop: panel.scrollTop,
  scrollLeft: panel.scrollLeft,
  scrollHeight: panel.scrollHeight,
  clientHeight: panel.clientHeight,
  focused: document.activeElement === panel,
}));

const scrollPanelToEnd = async (page, selector) => {
  await page.locator(selector).evaluate((panel) => {
    panel.scrollTop = panel.scrollHeight;
    panel.scrollLeft = 12;
  });
  const state = await panelState(page, selector);
  assert(state.scrollTop > 0, `${selector} fixture did not become scrollable: ${JSON.stringify(state)}`);
  return state;
};

const browser = await chromium.launch({ headless: true });
try {
  const evidence = {};
  for (const viewport of [
    { width: 390, height: 844, label: 'mobile' },
    { width: 1440, height: 900, label: 'desktop' },
  ]) {
    const page = await browser.newPage({ viewport });
    const logs = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') logs.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
    await page.goto(projectUrl, { waitUntil: 'networkidle' });

    await page.locator('[data-view-button="people"]').click();
    await page.locator('[data-view-panel="people"] .person-index-row[data-open-person="komatsu-shohei"]').click();
    const personScrolled = await scrollPanelToEnd(page, '[data-person-panel]');
    await page.locator('[data-person-panel] [data-close-person]').click();
    await page.locator('[data-view-panel="people"] .person-index-row[data-open-person="hama-kento"]').first().click();
    const personReopened = await panelState(page, '[data-person-panel]');
    assert(personReopened.scrollTop === 0 && personReopened.scrollLeft === 0 && personReopened.focused,
      `${viewport.label} Person B did not open at the top: ${JSON.stringify(personReopened)}`);

    await scrollPanelToEnd(page, '[data-person-panel]');
    await page.locator('[data-person-panel] [data-close-person]').click();
    await page.locator('[data-view-panel="people"] .person-index-row[data-open-person="komatsu-shohei"]').click();
    const personReturned = await panelState(page, '[data-person-panel]');
    assert(personReturned.scrollTop === 0 && personReturned.focused,
      `${viewport.label} Person A did not reset on return: ${JSON.stringify(personReturned)}`);
    await page.locator('[data-person-panel] [data-close-person]').click();

    await page.locator('[data-view-button="storylines"]').click();
    await page.locator('[data-view-panel="storylines"] [data-open-thread="hama-paid-drinking"]').click();
    const threadScrolled = await scrollPanelToEnd(page, '[data-thread-panel]');
    await page.locator('[data-thread-panel] [data-close-thread]').click();
    await page.locator('[data-view-panel="storylines"] [data-open-thread="bingo-payback"]').click();
    const threadReopened = await panelState(page, '[data-thread-panel]');
    assert(threadReopened.scrollTop === 0 && threadReopened.scrollLeft === 0 && threadReopened.focused,
      `${viewport.label} Thread B did not open at the top: ${JSON.stringify(threadReopened)}`);

    await scrollPanelToEnd(page, '[data-thread-panel]');
    await page.evaluate(() => {
      document.querySelector('project-archive-shell')?.openPerson('komatsu-shohei', null, false);
    });
    const threadToPerson = await panelState(page, '[data-person-panel]');
    assert(threadToPerson.scrollTop === 0 && threadToPerson.focused,
      `${viewport.label} Thread to Person transition inherited scroll: ${JSON.stringify(threadToPerson)}`);

    await scrollPanelToEnd(page, '[data-person-panel]');
    const personThreadButton = page.locator('[data-person-detail="komatsu-shohei"] [data-open-thread]').first();
    await personThreadButton.click();
    const personToThread = await panelState(page, '[data-thread-panel]');
    assert(personToThread.scrollTop === 0 && personToThread.focused,
      `${viewport.label} Person to Thread transition inherited scroll: ${JSON.stringify(personToThread)}`);

    assert(logs.length === 0, `${viewport.label} console errors: ${logs.join(' | ')}`);
    evidence[viewport.label] = {
      personScrolled,
      personReopened,
      personReturned,
      threadScrolled,
      threadReopened,
      threadToPerson,
      personToThread,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      logs,
    };
    await page.close();
  }

  console.log(JSON.stringify({ evidence }, null, 2));
  console.log('Overlay detail scroll reset verification passed.');
} finally {
  await browser.close();
}
