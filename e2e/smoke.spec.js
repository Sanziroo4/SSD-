import { test, expect } from '@playwright/test';

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function expectReadableText(page) {
  const sizes = await page.locator('.hero-description, .section-lead, .body-copy, .comparison-bottom p, .section-heading-aside, .journey-step-description p, .journey-timeline p, .fact-feature-copy > p, .faq-answer > p, .questions-heading > p, .closing-bottom p').evaluateAll(nodes =>
    nodes.map(node => ({ text: node.textContent.slice(0, 45), size: parseFloat(getComputedStyle(node).fontSize) }))
  );
  expect(sizes.length).toBeGreaterThan(15);
  expect(sizes.filter(({ size }) => size < 16), 'Explanatory text must remain readable without zooming').toEqual([]);
  await expect.poll(() => page.locator('.part-card-panel.is-active > p').evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(15);
}

test('desktop navigation and SSD/HDD comparison', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Кішкентай чип.');
  await expect(page.locator('.hero a, .hero button, .header-action')).toHaveCount(0);
  await expect(page.locator('.main-nav a')).toHaveCount(6);
  for (const id of ['intro', 'basics', 'anatomy', 'how', 'facts', 'questions']) {
    const link = page.locator(`.main-nav a[href="#${id}"]`);
    await expect(link).toHaveAccessibleName(/\S/);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect.poll(async () => Math.round((await page.locator(`#${id}`).boundingBox()).y)).toBeLessThan(180);
  }
  await expectReadableText(page);
  await page.locator('#basics button').filter({ hasText: 'HDD' }).click();
  await expect(page.locator('.drive-visual')).toHaveClass('drive-visual hdd');
  await expect(page.locator('.comparison-bottom h3')).toHaveText('Алдымен айналу. Сосын іздеу.');
  await page.locator('#basics button').filter({ hasText: 'SSD' }).click();
  await expect(page.locator('.drive-visual')).toHaveClass('drive-visual ssd');
});

test('SSD explodes, all six components explain themselves, and reassembles', async ({ page }) => {
  const toggle = page.locator('.lab-controls .button-orange');
  await expect(page.locator('.lab-controls button')).toHaveCount(1);
  await expect(toggle).toHaveAccessibleName('Бөлшектеу');
  await toggle.click();
  await expect(toggle).toHaveAccessibleName('Қайта жинау');
  await expect(page.locator('.lab-view-label')).toHaveText('EXPLODED VIEW / 02');
  const names = ['Жылу таратқыш', 'Контроллер', 'NAND жад чиптері', 'DRAM буфері', 'Баспа платасы', 'M.2 жалғағышы'];
  for (const [index, name] of names.entries()) {
    await page.locator('.parts-navigation button').nth(index).click();
    await expect(page.locator('.part-card-panel.is-active h3')).toHaveText(name);
    await expect(page.locator('.part-card-panel.is-active .part-number')).toHaveText(String(index + 1).padStart(2, '0'));
    await expect(page.locator('.parts-navigation button.active')).toHaveCount(1);
  }
  await toggle.click();
  await expect(page.locator('.lab-view-label')).toHaveText('ASSEMBLED VIEW / 01');
  await expect(toggle).toHaveAccessibleName('Бөлшектеу');
  await expect(page.locator('.part-card-panel.is-active h3')).toHaveText('Ішінде не бар?');
  await page.locator('.parts-navigation button').nth(3).click();
  await expect(page.locator('.part-card-panel.is-active h3')).toHaveText('DRAM буфері');
});

test('write/read simulation completes and changing the file resets it', async ({ page }) => {
  const write = page.getByRole('button', { name: 'Дерек жазу', exact: true });
  const read = page.getByRole('button', { name: 'Дерек оқу', exact: true });
  await expect(read).toBeDisabled();
  await write.click();
  await expect(page.locator('#file-type')).toBeDisabled();
  await expect(page.locator('.journey-step-description b')).toHaveText('Файл сақталды', { timeout: 10_000 });
  await expect(read).toBeEnabled();
  await read.click();
  await expect(page.locator('.journey-step-description b')).toHaveText('Файл компьютерге оралды', { timeout: 10_000 });
  await expect(write).toBeEnabled();
  await page.locator('#file-type').selectOption('Құжат.pdf');
  await expect(read).toBeDisabled();
  await expect(page.locator('.journey-step-description b')).toHaveText('Алғашқы файлыңызды сақтап көріңіз.');
  await expect(page.locator('.journey-step-description .step-count')).toHaveText('00/04');
  await expect(page.locator('.file-graphic span')).toHaveText('Құжат.pdf');
});

test('all six fact tabs and all five FAQ answers work', async ({ page }) => {
  for (let index = 0; index < 6; index++) {
    const tab = page.getByRole('tab').nth(index);
    const title = await tab.locator('b').textContent();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.fact-feature-copy h3')).toHaveText(title);
  }
  for (let index = 0; index < 5; index++) {
    const item = page.locator('.faq-item').nth(index);
    const button = item.locator('button');
    if (await button.getAttribute('aria-expanded') === 'true') await button.click();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.faq-item.open')).toHaveCount(1);
    await expect(item.locator('.faq-answer')).not.toHaveAttribute('inert');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  }
});

for (const width of [320, 390]) test.describe(`mobile ${width}px`, () => {
  test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });

  test('navigation menu closes after selection and the page fits the viewport', async ({ page }) => {
    const menu = page.locator('.mobile-toggle');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.main-nav a[href="#anatomy"]').click();
    await expect(page).toHaveURL(/#anatomy$/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expectReadableText(page);
    await page.locator('.parts-navigation button').nth(3).click();
    await expect(page.locator('.part-card-panel.is-active h3')).toHaveText('DRAM буфері');
    const workspace = await page.locator('.lab-workspace').boundingBox();
    const card = await page.locator('.part-card').boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(workspace.x);
    expect(card.x + card.width).toBeLessThanOrEqual(workspace.x + workspace.width + 1);
    expect(card.y + card.height).toBeLessThanOrEqual(workspace.y + workspace.height + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
