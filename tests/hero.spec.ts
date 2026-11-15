import { test, expect } from '@playwright/test';

test('hero automatically visits every slide, loops and resets on reload', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const slider = page.locator('[data-slider]');
  const activeSlide = page.locator('.hero-slide.is-active');
  await expect(activeSlide).toHaveAttribute('data-slide-index', '0');
  await expect(slider).not.toHaveClass(/is-paused/);
  await expect(
    slider.locator('.hero-links,.hero-coordinate,.slide-tabs,.hero-eyebrow'),
  ).toHaveCount(0);
  await expect(slider).not.toContainText('39° N / 35° E');
  await page.mouse.move(250, 250);
  for (const next of ['1', '2', '3', '4', '0']) {
    await page.clock.fastForward(7600);
    await expect(slider.locator(`.hero-slide.is-active[data-slide-index="${next}"]`)).toHaveCount(
      1,
    );
    await expect(slider.locator('.hero-slide.is-active')).toHaveCount(1);
  }
  await page.locator('[data-next]').click();
  await expect(slider.locator('.hero-slide.is-active')).toHaveAttribute('data-slide-index', '1');
  await page.clock.fastForward(7600);
  await expect(slider.locator('.hero-slide.is-active')).toHaveAttribute('data-slide-index', '2');
  await page.reload();
  await expect(slider.locator('.hero-slide.is-active')).toHaveAttribute('data-slide-index', '0');
  await expect(slider.locator('.scroll-hint')).toHaveAttribute('href', '#services');
  const arrow = slider.locator('.scroll-arrow');
  expect(await arrow.evaluate((node) => getComputedStyle(node).animationName)).toContain(
    'hero-scroll-cue',
  );
});

test('provided images appear in the mapped slides and related pages', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('main a')).not.toContainText(['Algebra’yı Tanıyın']);
  for (const [index, asset] of [
    [2, 'datacenter-brand'],
    [3, 'energy-renewables-brand'],
    [4, 'engineering-global-brand'],
  ] as const) {
    const active = page.locator('.hero-slide.is-active');
    const currentIndex = Number(await active.getAttribute('data-slide-index'));
    const steps = (index - currentIndex + 5) % 5;
    for (let step = 0; step < steps; step++) {
      await page.locator('[data-next]').click();
      await expect(active).toHaveAttribute(
        'data-slide-index',
        String((currentIndex + step + 1) % 5),
      );
    }
    const image = page.locator('.hero-slide.is-active .hero-photo');
    await expect(image).toHaveAttribute('src', new RegExp(asset));
    await expect
      .poll(() =>
        image.evaluate(
          (node) =>
            (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(
      0,
    );
    await page.screenshot({ path: `reports/hero-${asset}-${testInfo.project.name}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  for (const [path, asset] of [
    ['/hizmetler/veri-merkezi-tasarimi/', 'datacenter-brand'],
    ['/hizmetler/gunes-enerjisi-sistemleri/', 'energy-renewables-brand'],
    ['/kurumsal/hakkimizda/', 'engineering-global-brand'],
  ]) {
    await page.goto(path!);
    await expect(page.locator('.page-hero-image')).toHaveAttribute('src', new RegExp(asset!));
  }
  expect(errors).toEqual([]);
});
