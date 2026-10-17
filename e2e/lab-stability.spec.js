import { test, expect } from '@playwright/test';

const components = [
  ['heatsink', 'Жылу таратқыш'],
  ['controller', 'Контроллер'],
  ['nand', 'NAND жад чиптері'],
  ['dram', 'DRAM буфері'],
  ['pcb', 'Баспа платасы'],
  ['connector', 'M.2 жалғағышы'],
];

async function expectActiveDescription(page, id, name) {
  const card = page.locator('.part-card');
  const active = card.locator('.part-card-panel.is-active');
  await expect(active).toHaveAttribute('data-part', id);
  await expect(active).toHaveCSS('opacity', '1');
  // Hidden descriptions still reserve space, but must not enter the accessibility tree.
  await expect(card.getByRole('heading', { level: 3 })).toHaveText([name]);
  const geometry = await active.evaluate(node => {
    const cardNode = node.closest('.part-card');
    const card = cardNode.getBoundingClientRect();
    const workspace = node.closest('.lab-workspace').getBoundingClientRect();
    const inactive = [...cardNode.querySelectorAll('.part-card-panel:not(.is-active)')];
    const style = getComputedStyle(node);
    const opacityIndex = style.transitionProperty.split(',').map(value => value.trim()).indexOf('opacity');
    const durations = style.transitionDuration.split(',').map(value => parseFloat(value) / (value.endsWith('ms') ? 1000 : 1));
    const children = [...node.children].map(child => {
      const rect = child.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    });
    return {
      activeCount: cardNode.querySelectorAll('.part-card-panel.is-active').length,
      activeInert: node.inert,
      inactiveHidden: inactive.length === 6 && inactive.every(panel => panel.inert && panel.getAttribute('aria-hidden') === 'true'),
      fadesContent: opacityIndex >= 0 && durations[opacityIndex % durations.length] >= 0.1,
      paragraphSize: parseFloat(getComputedStyle(node.querySelector(':scope > p')).fontSize),
      textFits: children.every(rect => rect.left >= card.left - 1 && rect.right <= card.right + 1 && rect.top >= card.top - 1 && rect.bottom <= card.bottom + 1),
      cardFits: card.left >= workspace.left - 1 && card.right <= workspace.right + 1 && card.top >= workspace.top - 1 && card.bottom <= workspace.bottom + 1,
    };
  });
  expect(geometry.activeCount, `${id}: exactly one active description`).toBe(1);
  expect(geometry.activeInert, `${id}: active description is accessible`).toBe(false);
  expect(geometry.inactiveHidden, `${id}: all inactive descriptions are hidden from assistive technology`).toBe(true);
  expect(geometry.fadesContent, `${id}: content keeps its normal-motion fade`).toBe(true);
  expect(geometry.paragraphSize, `${id}: description remains readable`).toBeGreaterThanOrEqual(16);
  expect(geometry.textFits, `${id}: description is not clipped by its card`).toBe(true);
  expect(geometry.cardFits, `${id}: card remains within the workspace`).toBe(true);
}

for (const width of [1440, 390]) test.describe(`lab stability ${width}px, normal motion`, () => {
  test.use({ viewport: { width, height: 1000 }, reducedMotion: 'no-preference' });

  test('all component transitions preserve the frame, canvas, readable text and accessible description', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.lab-scene canvas')).toHaveCount(1);
    await page.locator('.lab-panel').scrollIntoViewIfNeeded();
    await expect(page.locator('.lab-panel')).toHaveCSS('opacity', '1');
    await expect(page.locator('.part-card-panel')).toHaveCount(7);
    await expectActiveDescription(page, 'assembled', 'Ішінде не бар?');
    // Let the initial scroll reveal settle before measuring component transitions.
    await page.locator('.lab-panel').evaluate(async node => {
      await Promise.all(node.getAnimations({ subtree: true }).filter(animation =>
        animation.effect?.getTiming().iterations !== Infinity
      ).map(animation => animation.finished.catch(() => {})));
    });

    await page.evaluate(() => {
      const selectors = ['.lab-panel', '.lab-workspace', '.lab-scene', '.lab-scene canvas', '.part-card'];
      const nodes = selectors.map(selector => document.querySelector(selector));
      const bounds = node => {
        const rect = node.getBoundingClientRect();
        // Ignore intentional page scrolling, while retaining all layout changes.
        return [rect.left + scrollX, rect.top + scrollY, rect.width, rect.height];
      };
      const baseline = nodes.map(bounds);
      const state = window.__labStability = {
        frames: 0, maxDelta: 0, minOpacity: 1, nodeReplaced: false, stopped: false,
      };
      const sample = () => {
        state.frames++;
        selectors.forEach((selector, index) => {
          const current = document.querySelector(selector);
          if (current !== nodes[index]) state.nodeReplaced = true;
          if (!current) return;
          bounds(current).forEach((value, axis) => {
            state.maxDelta = Math.max(state.maxDelta, Math.abs(value - baseline[index][axis]));
          });
          state.minOpacity = Math.min(state.minOpacity, parseFloat(getComputedStyle(current).opacity));
        });
        if (!state.stopped) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    for (const [index, [id, name]] of components.entries()) {
      // Smoke tests cover real pointer clicks; dispatch avoids scrolling a tall mobile
      // lab out of view while this test samples its normal-motion transitions.
      await page.locator('.parts-navigation button').nth(index).dispatchEvent('click');
      await expectActiveDescription(page, id, name);
    }
    await page.locator('.lab-controls .button-orange').dispatchEvent('click');
    await expectActiveDescription(page, 'assembled', 'Ішінде не бар?');
    await expect(page.locator('.lab-view-label')).toHaveText('ASSEMBLED VIEW / 01');
    const samples = await page.evaluate(() => {
      window.__labStability.stopped = true;
      return window.__labStability;
    });
    await test.info().attach('lab-transition-metrics', { body: JSON.stringify(samples), contentType: 'application/json' });
    expect(samples.frames, 'sampled animation frames across all transitions').toBeGreaterThan(7);
    expect(samples.nodeReplaced, 'card, canvas and frame DOM nodes remain mounted').toBe(false);
    expect(samples.maxDelta, 'frame, workspace, model and card bounds stay fixed').toBeLessThanOrEqual(1);
    expect(samples.minOpacity, 'the surrounding card and model never blink').toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
