import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { companyContact } from '../src/data/contact.ts';
import { brand } from '../src/data/brand.ts';
await mkdir('reports', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const [width, height] of [
    [360, 640],
    [360, 740],
    [390, 664],
    [390, 844],
    [768, 1024],
    [820, 1180],
    [844, 390],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1536, 776],
    [1920, 970],
    [1920, 1080],
    [2560, 1080],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto('http://localhost:4321/iletisim/', {
      waitUntil: 'networkidle',
    });
    await expect(page.locator('main h1')).toHaveText(/Geleceği\s*konuşalım\./);
    const contactDetails = page.locator('.contact-scene__channels');
    await expect(
      contactDetails.getByRole('link', { name: companyContact.address }),
    ).toHaveAttribute('href', companyContact.mapUrl);
    await expect(contactDetails.getByRole('link', { name: companyContact.phone })).toHaveAttribute(
      'href',
      `tel:${companyContact.telephone}`,
    );
    await expect(contactDetails.getByRole('link', { name: companyContact.email })).toHaveAttribute(
      'href',
      `mailto:${companyContact.email}`,
    );
    await expect(page.locator('.contact-action--primary')).toHaveCSS(
      'background-color',
      'rgb(208, 0, 36)',
    );
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      corporateRed: getComputedStyle(document.documentElement).getPropertyValue('--red').trim(),
      imageLoaded: document.querySelector('.contact-scene__image').naturalWidth > 0,
      imageFit: getComputedStyle(document.querySelector('.contact-scene__image')).objectFit,
      imageBounds: document.querySelector('.contact-scene__image').getBoundingClientRect().toJSON(),
      footer: document.querySelector('.contact-scene__footer').getBoundingClientRect().toJSON(),
      content: document.querySelector('.contact-scene__content').getBoundingClientRect().toJSON(),
      hasOldSections: !!document.querySelector(
        '.site-footer,.building-placeholder,.contact-lower,.expertise-section',
      ),
      activeNav: document.querySelector('.desktop-nav [aria-current="page"]')?.textContent.trim(),
    }));
    const violations =
      width === 390 || width === 1440
        ? (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
              .analyze()
          ).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))
        : [];
    await page.screenshot({ path: `reports/contact-${width}x${height}.png` });
    results.push({ status: response.status(), ...layout, errors, violations });
    await context.close();
  }
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/iletisim/');
  await page
    .locator('.contact-scene__actions')
    .getByRole('link', { name: 'Teklif Talebi' })
    .click();
  await expect(page.locator('main h1')).toHaveText('Teklif Talebi');
  await page.close();
} finally {
  await browser.close();
  await writeFile('reports/contact-qa.json', JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
if (
  results.some(
    (r) =>
      r.status !== 200 ||
      r.scrollWidth > r.width + 1 ||
      r.scrollHeight > r.height + 1 ||
      r.hasOldSections ||
      r.corporateRed !== brand.red ||
      !r.imageLoaded ||
      r.imageFit !== 'cover' ||
      Math.abs(r.imageBounds.left) > 1 ||
      Math.abs(r.imageBounds.right - r.width) > 1 ||
      Math.abs(r.imageBounds.top) > 1 ||
      Math.abs(r.imageBounds.bottom - r.height) > 1 ||
      r.errors.length ||
      r.violations.length ||
      r.content.bottom > r.footer.top,
  )
)
  process.exitCode = 1;
