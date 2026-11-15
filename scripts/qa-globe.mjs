import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

async function changes(a, b) {
  const first = await sharp(a).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const second = await sharp(b).ensureAlpha().raw().toBuffer();
  const { width, height } = first.info;
  const radius = (Math.min(width, height) * 2) / 5.75;
  let center = 0,
    rays = 0,
    total = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const delta =
        Math.abs(first.data[i] - second[i]) +
        Math.abs(first.data[i + 1] - second[i + 1]) +
        Math.abs(first.data[i + 2] - second[i + 2]);
      if (delta < 12) continue;
      total++;
      const distance = Math.hypot(x - width / 2, y - height / 2);
      if (distance < radius * 0.65) center++;
      if (distance > radius * 1.06 && distance < radius * 1.42) rays++;
    }
  return { center, rays, total };
}
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const results = [];
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: 'no-preference',
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /shader|WebGLProgram|GL_INVALID/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto('http://localhost:4321/');
  const host = page.locator('.world-canvas');
  await host.scrollIntoViewIfNeeded();
  const canvas = host.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(host).toHaveAttribute('data-animation', 'running');
  await page.waitForTimeout(900);
  const a = await canvas.screenshot({ scale: 'css' });
  await page.waitForTimeout(1800);
  const b = await canvas.screenshot({ scale: 'css' });
  const motion = await changes(a, b);
  await writeFile(`reports/globe-${name}-canvas.png`, b);
  await page.locator('.globe-section').screenshot({ path: `reports/globe-${name}-modern.png` });
  expect(motion.center, `${name}: sphere actually turns`).toBeGreaterThan(50);
  expect(motion.rays, `${name}: light trails actually travel`).toBeGreaterThan(20);
  await page.getByRole('button', { name: 'Dünya animasyonunu durdur' }).click();
  await expect(host).toHaveAttribute('data-animation', 'paused');
  await page.waitForTimeout(160);
  const pausedA = await canvas.screenshot({ scale: 'css' });
  await page.waitForTimeout(800);
  const paused = await changes(pausedA, await canvas.screenshot({ scale: 'css' }));
  expect(paused.total, `${name}: pause stops all animation`).toBe(0);
  await page.getByRole('button', { name: 'Dünya animasyonunu başlat' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(host).toHaveAttribute('data-animation', 'paused');
  await page.waitForTimeout(160);
  const reducedA = await canvas.screenshot({ scale: 'css' });
  await page.waitForTimeout(800);
  const reduced = await changes(reducedA, await canvas.screenshot({ scale: 'css' }));
  expect(reduced.total, `${name}: reduced motion stays still`).toBe(0);
  expect(errors, `${name}: runtime and shader errors`).toEqual([]);
  results.push({ name, width, height, motion, paused, reduced, errors });
  console.log(JSON.stringify(results.at(-1)));
  await page.close();
}
await browser.close();
await writeFile('reports/globe-qa.json', JSON.stringify(results, null, 2));
console.log(
  'PASS: surface rotation, traveling light trails, pause, reduced motion and WebGL shaders.',
);
