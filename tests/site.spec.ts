import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('cinematic hero, slides and lazy 3D', async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on('pageerror', (e) => failures.push(e.message));
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.goto('/');
  await expect(page.locator('main h1')).toContainText('Geleceğin teknolojisini');
  await expect(page.locator('.hero-slide.is-active')).toHaveCount(1);
  await page.locator('[data-next]').click();
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('data-slide-index', '1');
  await expect(page.locator('[data-autoplay]')).toHaveCount(0);
  await page.locator('[data-slider]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('data-slide-index', '0');
  expect(requested.some((url) => url.includes('world-texture'))).toBe(false);
  await page.screenshot({ path: `reports/home-${testInfo.project.name}.png`, fullPage: false });
  await page.locator('.world-canvas').scrollIntoViewIfNeeded();
  await expect(
    page.locator('.world-canvas canvas,.world-canvas .globe-fallback').first(),
  ).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(page.locator('.world-canvas canvas')).toBeVisible();
  await expect(page.locator('.world-canvas')).toHaveAttribute('data-animation', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.world-canvas')).toHaveAttribute('data-animation', 'paused');
  await page.screenshot({ path: `reports/globe-${testInfo.project.name}.png`, fullPage: false });
  expect(failures).toEqual([]);
});
test('WebGL unavailable uses the geographic static fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      return type === 'webgl' || type === 'webgl2'
        ? null
        : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await page.locator('.world-canvas').scrollIntoViewIfNeeded();
  await expect(page.locator('.world-canvas .globe-fallback')).toBeVisible();
  await expect(page.locator('.world-canvas canvas')).toHaveCount(0);
});
test.describe('JavaScript unavailable', () => {
  test.use({ javaScriptEnabled: false });
  test('form stays disabled without JavaScript', async ({ page }) => {
    await page.goto('/iletisim/teklif-talebi/');
    await expect(page.getByRole('button', { name: 'Teklif Talebi' })).toBeDisabled();
    await page.locator('#email').fill('test@example.com');
    await page.locator('#email').press('Enter');
    await expect(page).toHaveURL('/iletisim/teklif-talebi/');
  });
});
for (const [path, locale, direction] of [
  ['/', 'tr', 'ltr'],
  ['/en/', 'en', 'ltr'],
  ['/ar/', 'ar', 'rtl'],
  ['/de/', 'de', 'ltr'],
  ['/fr/', 'fr', 'ltr'],
  ['/zh-CN/', 'zh-CN', 'ltr'],
  ['/ja/', 'ja', 'ltr'],
  ['/ru/', 'ru', 'ltr'],
  ['/it/', 'it', 'ltr'],
  ['/es/', 'es', 'ltr'],
])
  test(`translated home ${locale} and responsive layout`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path!);
    await expect(page.locator('html')).toHaveAttribute('lang', locale!);
    await expect(page.locator('html')).toHaveAttribute('dir', direction!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.locator('main h1').evaluate((h) => h.getBoundingClientRect().bottom),
    ).toBeLessThan(
      await page.locator('.hero-bottom').evaluate((h) => h.getBoundingClientRect().top),
    );
    await page.locator('.language-picker summary').click();
    await page
      .locator(`.language-list a[data-language-link="${locale === 'en' ? 'tr' : 'en'}"]`)
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'tr' : 'en');
    await page.goto(path!);
    await page.screenshot({ path: `reports/locale-${locale}-${testInfo.project.name}.png` });
  });
test('navigation and service catalog', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Menüyü aç', exact: true }).click();
    await expect(page.locator('#mobile-nav')).not.toHaveAttribute('inert', '');
    await page.locator('#mobile-nav').getByRole('link', { name: 'Hizmetler' }).click();
    await expect(page).toHaveURL(/\/hizmetler\//);
  } else {
    await page
      .locator('.desktop-nav')
      .getByRole('link', { name: 'Hizmetler', exact: true })
      .click();
  }
  await page.getByRole('searchbox').fill('Yedekleme');
  await expect(page.locator('[data-service-item]:visible')).toHaveCount(1);
  await page.locator('[data-service-item]:visible').click();
  await expect(page.locator('main h1')).toHaveText('Veri Yedekleme');
  await page.locator('#faq summary').first().click();
  await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
  await page.screenshot({ path: `reports/service-${testInfo.project.name}.png` });
});
test('form sends once and only reports success after PHP confirms it', async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/api/contact.php', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"code":"sent"}' });
  });
  page.on('request', (r) => {
    if (r.method() === 'POST') requests.push(r.url());
  });
  await page.goto('/iletisim/teklif-talebi/');
  await page.locator('#full-name').fill('Test Kullanıcı');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#interest').selectOption({ label: 'Bilişim ve Veri Merkezi' });
  await page
    .locator('#message')
    .fill('Veri merkezi altyapısı için teknik değerlendirme talebidir.');
  await page.locator('input[name="notice"]').check();
  await page.getByRole('button', { name: 'Teklif Talebi' }).click();
  await expect(page.getByRole('button', { name: 'Teklif Talebi' })).toBeDisabled();
  await expect(page.locator('.form-result')).toContainText('Mesajınız gönderildi');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain('/api/contact.php');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page).toHaveURL('/iletisim/teklif-talebi/');
});
test('raw PHP source is never treated as successful delivery', async ({ page }) => {
  await page.route('**/api/contact.php', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: '<?php echo "not executed"; ?>' });
  });
  await page.goto('/iletisim/teklif-talebi/');
  await page.locator('#full-name').fill('Test Kullanıcı');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#interest').selectOption({ index: 1 });
  await page.locator('#message').fill('Teknik altyapı çalışması hakkında bilgi almak istiyoruz.');
  await page.locator('input[name="notice"]').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.form-result')).toContainText('Mesaj gönderilemedi');
});
test('form keeps entered values when PHP reports an SMTP failure', async ({ page }) => {
  await page.route('**/api/contact.php', async (route) => {
    await route.fulfill({ status: 502, contentType: 'application/json', body: '{"ok":false,"code":"delivery_failed"}' });
  });
  await page.goto('/iletisim/is-birligi/');
  await page.locator('#full-name').fill('Test Kullanıcı');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#interest').selectOption({ index: 1 });
  await page.locator('#message').fill('Birlikte geliştirmek istediğimiz altyapı projesi hakkında görüşmek istiyoruz.');
  await page.locator('input[name="notice"]').check();
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.form-result')).toContainText('Mesaj gönderilemedi');
  await expect(page.locator('#email')).toHaveValue('test@example.com');
});
test('career forms send their application category to PHP', async ({ page }) => {
  const submissions: Array<Record<string, unknown>> = [];
  await page.route('**/api/contact.php', async (route) => {
    submissions.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"code":"sent"}' });
  });
  for (const [slug, topic] of [['genel-basvuru', 'general'], ['staj-programi', 'internship']]) {
    await page.goto(`/insan-kaynaklari/${slug}/`);
    await page.locator('#full-name').fill('Test Kullanıcı');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#interest').selectOption({ index: 1 });
    await page.locator('#message').fill('Yazılım alanındaki deneyimimi ve çalışmalarımı paylaşmak istiyorum.');
    await page.locator('input[name="notice"]').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.form-result')).toContainText('Mesajınız gönderildi');
    expect(submissions.at(-1)?.type).toBe('career');
    expect(submissions.at(-1)?.careerTopic).toBe(topic);
  }
});
test('unknown pages and unsupported languages return HTTP 404', async ({ page }) => {
  for (const path of ['/does-not-exist/', '/pt/', '/ko/']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});
test('key templates have no WCAG A/AA accessibility violations', async ({ page }) => {
  for (const path of [
    '/',
    '/ar/',
    '/zh-CN/',
    '/hizmetler/veri-yedekleme/',
    '/cozumler/is-surekliligi/',
    '/iletisim/',
  ]) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});
test('representative pages fit phone, tablet and wide layouts', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'viewport matrix is shared');
  for (const width of [360, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    for (const path of [
      '/',
      '/hizmetler/',
      '/hizmetler/veri-yedekleme/',
      '/cozumler/',
      '/kurumsal/',
      '/iletisim/',
      '/ar/',
      '/zh-CN/',
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
});
