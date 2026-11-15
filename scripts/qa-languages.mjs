import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { localeRegistry, localePath } from '../src/i18n/locales.ts';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const results = [];
for (const [width, height] of [
  [360, 640],
  [844, 390],
  [1024, 768],
  [1920, 1080],
]) {
  await page.setViewportSize({ width, height });
  for (const [locale] of localeRegistry) {
    await page.goto(`http://localhost:4321${localePath(locale, '/iletisim/')}`);
    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      return {
        scene: rect('.contact-scene'),
        content: rect('.contact-scene__content'),
        footer: rect('.contact-scene__footer'),
        header: rect('.site-header'),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    const errors = [];
    if (geometry.overflow) errors.push('horizontal overflow');
    if (geometry.content.top < geometry.header.bottom - 1) errors.push('content overlaps header');
    if (geometry.content.bottom > geometry.footer.top - 8) errors.push('content overlaps footer');
    if (geometry.scene.bottom > height + 1) errors.push('scene exceeds viewport');
    await page.locator('.language-picker summary').click();
    const menu = await page.locator('.modern-language-list').boundingBox();
    if (!menu || menu.x < 8 || menu.x + menu.width > width - 8 || menu.y + menu.height > height - 8)
      errors.push('language dropdown exceeds viewport');
    if (locale === 'tr' && width === 360)
      await page.screenshot({ path: 'reports/language-dropdown-mobile.png' });
    await page.locator('.language-picker summary').click();
    results.push({ locale, width, height, errors, geometry });
    if (errors.length)
      await page.screenshot({ path: `reports/language-overflow-${locale}-${width}x${height}.png` });
  }
  console.log(`Contact layout checked: ${width}x${height}, ten languages`);
}
await browser.close();
await writeFile('reports/language-layout.json', JSON.stringify(results, null, 2));
const failures = results.filter((r) => r.errors.length);
if (failures.length) {
  console.error(
    JSON.stringify(
      failures.map(({ locale, width, height, errors }) => ({ locale, width, height, errors })),
      null,
      2,
    ),
  );
  process.exitCode = 1;
} else console.log('PASS: 40 multilingual contact layouts, no overflow or collisions.');
