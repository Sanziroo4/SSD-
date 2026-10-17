import { test, expect } from '@playwright/test';

const graphicTypes = ['charge', 'blocks', 'endurance', 'trim', 'cache', 'capacity'];

async function selectGraphic(page, index) {
  // Tab interaction itself is covered by smoke tests. Keep this suite focused on
  // the illustration even when the mobile tab list is above the viewport.
  await page.getByRole('tab').nth(index).dispatchEvent('click');
  const graphic = page.locator(`.${graphicTypes[index]}-graphic`);
  await graphic.scrollIntoViewIfNeeded();
  await expect(graphic).toBeVisible();
  await expect(graphic).toHaveAttribute('aria-hidden', 'true');
  return graphic;
}

test.describe('fact illustrations with normal motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('all six illustrations animate in view and stop consuming animation time offscreen', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    for (let index = 0; index < graphicTypes.length; index++) {
      const graphic = await selectGraphic(page, index);
      await expect(graphic).toHaveAttribute('data-motion', 'running');
      await expect.poll(() => graphic.evaluate(node => node.getAnimations({ subtree: true })
        .filter(animation => animation.playState === 'running'
          && animation.playbackRate > 0
          && animation.effect.getTiming().iterations === Infinity
          && animation.effect.getComputedTiming().duration > 0).length),
      { message: `${graphicTypes[index]} has a real, running loop` }).toBeGreaterThan(0);

      // Verify browser animation time advances rather than only testing a class.
      const advances = await graphic.evaluate(async node => {
        const animation = node.getAnimations({ subtree: true }).find(item => item.playState === 'running');
        const before = animation.currentTime;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return animation.currentTime > before;
      });
      expect(advances, `${graphicTypes[index]} actually advances`).toBe(true);

      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await expect(graphic).toHaveAttribute('data-motion', 'paused');
      const paused = await graphic.evaluate(async node => {
        const animations = node.getAnimations({ subtree: true });
        const before = animations.map(animation => animation.currentTime);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return animations.length > 0 && animations.every((animation, i) =>
          animation.playState === 'paused' && Math.abs(animation.currentTime - before[i]) < 1);
      });
      expect(paused, `${graphicTypes[index]} pauses offscreen without restarting`).toBe(true);
    }
  });

  test('the resource needle sweeps to its endpoint and returns without moving the card', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    const graphic = await selectGraphic(page, 2);
    await expect(graphic).toHaveAttribute('data-motion', 'running');
    await expect.poll(() => graphic.locator('.endurance-needle').evaluate(node =>
      node.getAnimations().filter(animation => animation.playState === 'running').length)).toBeGreaterThan(0);
    const samples = await graphic.evaluate(node => {
      const needle = node.querySelector('.endurance-needle');
      const progressArc = node.querySelector('.endurance-progress');
      const animation = needle.getAnimations()[0];
      const arcAnimation = progressArc.getAnimations()[0];
      const timing = animation.effect.getComputedTiming();
      animation.pause();
      arcAnimation.pause();
      const bounds = element => {
        const rect = element.getBoundingClientRect();
        return [rect.x + scrollX, rect.y + scrollY, rect.width, rect.height];
      };
      const measured = [node, node.closest('.fact-feature')];
      const baseline = measured.map(bounds);
      let maxDelta = 0;
      const arcOffsets = [];
      const angles = [0.001, 0.25, 0.5, 0.75, 0.999].map(progress => {
        animation.currentTime = Number(timing.delay || 0) + timing.duration * progress;
        arcAnimation.currentTime = arcAnimation.effect.getComputedTiming().duration * progress;
        const matrix = new DOMMatrixReadOnly(getComputedStyle(needle).transform);
        arcOffsets.push(parseFloat(getComputedStyle(progressArc).strokeDashoffset));
        measured.forEach((element, index) => bounds(element).forEach((value, axis) => {
          maxDelta = Math.max(maxDelta, Math.abs(value - baseline[index][axis]));
        }));
        return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
      });
      return { angles, arcOffsets, maxDelta };
    });
    const [start, outgoing, endpoint, incoming, returned] = samples.angles;
    expect(endpoint - start, 'the needle traverses the dial').toBeGreaterThan(100);
    expect(outgoing, 'outgoing motion is between the endpoints').toBeGreaterThan(start);
    expect(outgoing).toBeLessThan(endpoint);
    expect(incoming, 'the needle travels back after the endpoint').toBeLessThan(endpoint);
    expect(incoming).toBeGreaterThan(returned);
    expect(Math.abs(returned - start), 'the loop returns smoothly to its starting angle').toBeLessThan(2);
    expect(samples.arcOffsets[0] - samples.arcOffsets[2], 'the colored arc fills as the needle advances').toBeGreaterThan(50);
    expect(Math.abs(samples.arcOffsets[4] - samples.arcOffsets[0]), 'the arc returns with the needle').toBeLessThan(2);
    expect(samples.maxDelta, 'the graphic and card boundaries never jump during the sweep').toBeLessThanOrEqual(0.5);
    await graphic.evaluate(node => {
      node.getAnimations({ subtree: true }).forEach(animation => {
        animation.pause();
        animation.currentTime = animation.effect.getComputedTiming().duration * 0.5;
      });
    });
    await page.locator('.fact-feature').screenshot({ path: '/tmp/ssd-fact-gauge-desktop.png' });
  });
});

test.describe('fact illustrations on a narrow screen with reduced motion', () => {
  test.use({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });

  test('all six remain visible, readable and within the viewport without animation', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (let index = 0; index < graphicTypes.length; index++) {
      const graphic = await selectGraphic(page, index);
      const result = await graphic.evaluate(node => {
        const rect = node.getBoundingClientRect();
        const feature = node.closest('.fact-feature').getBoundingClientRect();
        const paragraph = node.closest('.fact-feature').querySelector('.fact-feature-copy > p');
        return {
          width: rect.width,
          height: rect.height,
          fits: rect.left >= feature.left - 1 && rect.right <= feature.right + 1
            && feature.left >= 0 && feature.right <= innerWidth,
          paragraphSize: parseFloat(getComputedStyle(paragraph).fontSize),
          activeAnimations: node.getAnimations({ subtree: true })
            .filter(animation => animation.playState === 'running'
              && animation.effect.getComputedTiming().duration > 1).length,
          pageFits: document.documentElement.scrollWidth <= innerWidth,
        };
      });
      expect(result.width, `${graphicTypes[index]} is still rendered`).toBeGreaterThan(100);
      expect(result.height).toBeGreaterThan(100);
      expect(result.fits, `${graphicTypes[index]} fits the mobile card`).toBe(true);
      expect(result.paragraphSize, 'explanatory text stays readable').toBeGreaterThanOrEqual(16);
      expect(result.activeAnimations, 'reduced motion presents a static illustration').toBe(0);
      expect(result.pageFits, 'the animation adds no horizontal page overflow').toBe(true);
      if (index === 3) await page.locator('.fact-feature').screenshot({ path: '/tmp/ssd-fact-trim-mobile.png' });
    }
  });
});
