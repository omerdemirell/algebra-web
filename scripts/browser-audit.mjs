import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('reports', { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const results = [];
for (const [name, width, height, path] of [
  ['home-desktop', 1440, 1000, '/'],
  ['service-mobile', 390, 844, '/hizmetler/veri-yedekleme/'],
  ['contact-desktop', 1440, 1000, '/iletisim/'],
  ['arabic-mobile', 390, 844, '/ar/'],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('body *')]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return (
          b.width > 0 &&
          (b.right > innerWidth + 2 || b.left < -2) &&
          getComputedStyle(e).position !== 'absolute' &&
          getComputedStyle(e).display !== 'none'
        );
      })
      .slice(0, 15)
      .map((e) => ({
        tag: e.tagName,
        class: e.className,
        rect: e.getBoundingClientRect().toJSON(),
        display: getComputedStyle(e).display,
        grid: getComputedStyle(e).gridTemplateColumns,
      })),
  }));
  await page.screenshot({ path: `reports/audit-${name}.png`, fullPage: true });
  if (path === '/') {
    await page.locator('.world-canvas').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    const globe = await page.evaluate(() => ({
      canvas: !!document.querySelector('.world-canvas canvas'),
      fallback: !!document.querySelector('.world-canvas img'),
      requests: performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((x) => /WorldGlobe|world-texture/.test(x)),
    }));
    results.push({ name, layout, globe, errors });
    await page.screenshot({ path: 'reports/audit-globe-desktop.png' });
  } else results.push({ name, layout, errors });
  await page.close();
}
await browser.close();
await writeFile('reports/browser-audit.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
