import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { localeRegistry, localePath, type Locale } from '../src/i18n/locales';
import { dictionaries } from '../src/i18n/messages';

const flags: Record<string, string> = {
  tr: 'tr',
  en: 'gb',
  ar: 'sa',
  de: 'de',
  fr: 'fr',
  'zh-CN': 'cn',
  ja: 'jp',
  ru: 'ru',
  it: 'it',
  es: 'es',
};
const expectedLanguageNames: Record<Locale, string[]> = {
  tr: [
    'Türkçe',
    'İngilizce',
    'Arapça',
    'Almanca',
    'Fransızca',
    'Çince',
    'Japonca',
    'Rusça',
    'İtalyanca',
    'İspanyolca',
  ],
  en: [
    'Turkish',
    'English',
    'Arabic',
    'German',
    'French',
    'Chinese',
    'Japanese',
    'Russian',
    'Italian',
    'Spanish',
  ],
  ar: [
    'التركية',
    'الإنجليزية',
    'العربية',
    'الألمانية',
    'الفرنسية',
    'الصينية',
    'اليابانية',
    'الروسية',
    'الإيطالية',
    'الإسبانية',
  ],
  de: [
    'Türkisch',
    'Englisch',
    'Arabisch',
    'Deutsch',
    'Französisch',
    'Chinesisch',
    'Japanisch',
    'Russisch',
    'Italienisch',
    'Spanisch',
  ],
  fr: [
    'turc',
    'anglais',
    'arabe',
    'allemand',
    'français',
    'chinois',
    'japonais',
    'russe',
    'italien',
    'espagnol',
  ],
  'zh-CN': [
    '土耳其语',
    '英语',
    '阿拉伯语',
    '德语',
    '法语',
    '中文',
    '日语',
    '俄语',
    '意大利语',
    '西班牙语',
  ],
  ja: [
    'トルコ語',
    '英語',
    'アラビア語',
    'ドイツ語',
    'フランス語',
    '中国語',
    '日本語',
    'ロシア語',
    'イタリア語',
    'スペイン語',
  ],
  ru: [
    'турецкий',
    'английский',
    'арабский',
    'немецкий',
    'французский',
    'китайский',
    'японский',
    'русский',
    'итальянский',
    'испанский',
  ],
  it: [
    'turco',
    'inglese',
    'arabo',
    'tedesco',
    'francese',
    'cinese',
    'giapponese',
    'russo',
    'italiano',
    'spagnolo',
  ],
  es: [
    'turco',
    'inglés',
    'árabe',
    'alemán',
    'francés',
    'chino',
    'japonés',
    'ruso',
    'italiano',
    'español',
  ],
};
const dropdownOrder = [0, 2, 5, 1, 3, 4, 6, 7, 8, 9];

test('ten languages preserve the current page, native names and local flags', async ({ page }) => {
  test.setTimeout(120000);
  for (const [index, [locale, , , direction]] of localeRegistry.entries()) {
    const response = await page.goto(localePath(locale, '/hizmetler/veri-yedekleme/'));
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', direction);
    await expect(page.locator('.selected-language-name')).toHaveText(
      expectedLanguageNames[locale][index]!,
    );
    await expect(page.locator('summary > .language-flag')).toHaveAttribute(
      'src',
      `/flags/${flags[locale]}.svg`,
    );
    await page.locator('.language-picker summary').click();
    await expect(page.locator('[data-language-link]')).toHaveCount(10);
    await expect(page.locator('.language-option-label')).toHaveText(
      dropdownOrder.map((position) => expectedLanguageNames[locale][position]!),
    );
    for (const label of expectedLanguageNames[locale]) expect(label.trim()).not.toBe('');
    await expect(page.locator('[data-language-search]')).toHaveCount(0);
    await expect
      .poll(() =>
        page
          .locator('.language-options img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    if (locale === 'tr') {
      const audit = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(audit.violations, 'open language dropdown accessibility').toEqual([]);
    }
    await expect(page.locator('.language-unavailable,[aria-disabled="true"]')).toHaveCount(0);
    for (const [code] of localeRegistry) {
      await expect(page.locator(`[data-language-link="${code}"]`)).toHaveAttribute(
        'href',
        localePath(code, '/hizmetler/veri-yedekleme/'),
      );
      await expect(page.locator(`[data-language-link="${code}"]`)).toHaveAttribute('lang', locale);
    }
    const target = locale === 'de' ? 'fr' : 'de';
    await page.locator(`[data-language-link="${target}"]`).click();
    await expect(page).toHaveURL(localePath(target, '/hizmetler/veri-yedekleme/'));
    await expect(page.locator('h1')).toHaveText(dictionaries[target]['Veri Yedekleme']);
    await page.locator('.language-picker summary').click();
    await expect(page.locator('.language-option-label')).toHaveText(
      dropdownOrder.map((position) => expectedLanguageNames[target][position]!),
    );
    await page.locator('.language-picker summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});

test('localized catalog search and form feedback work in every language', async ({ page }) => {
  test.setTimeout(180000);
  await page.route('**/api/contact.php', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"code":"sent"}' });
  });
  for (const [locale] of localeRegistry) {
    if (locale === 'tr') continue;
    const dictionary = dictionaries[locale];
    await page.goto(localePath(locale, '/hizmetler/'));
    await page.locator('[data-service-search]').fill(dictionary['Veri Yedekleme']);
    await expect(
      page.locator(`a[href="${localePath(locale, '/hizmetler/veri-yedekleme/')}"]`),
    ).toBeVisible();
    await expect(page.locator('.search-count')).not.toContainText('hizmet');
    await page.goto(localePath(locale, '/iletisim/teklif-talebi/'));
    await page.locator('#full-name').fill('Sample Person');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#interest').selectOption({ index: 2 });
    await page
      .locator('#message')
      .fill('A technical consultation about our data center infrastructure.');
    await page.locator('input[name="notice"]').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.form-result')).toBeVisible();
    await expect(page.locator('.form-result')).not.toContainText('Mesajınız gönderildi');
  }
});

test('translated contact pages fit mobile and desktop with readable controls', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [locale] of localeRegistry) {
    await page.goto(localePath(locale, '/iletisim/'));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="tel:+903122806161"]')).toBeVisible();
    await expect(page.locator('a[href="mailto:info@algebrateknoloji.com"]')).toBeVisible();
    const geometry = await page.evaluate(() => {
      const content = document.querySelector('.contact-scene__content')!.getBoundingClientRect();
      const footer = document.querySelector('.contact-scene__footer')!.getBoundingClientRect();
      const header = document.querySelector('.site-header')!.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        contentTop: content.top,
        contentBottom: content.bottom,
        footerTop: footer.top,
        headerBottom: header.bottom,
      };
    });
    expect(geometry.overflow, `${locale}: horizontal overflow`).toBe(false);
    expect(geometry.contentTop, `${locale}: content behind header`).toBeGreaterThanOrEqual(
      geometry.headerBottom - 1,
    );
    expect(geometry.contentBottom, `${locale}: contact overlaps footer`).toBeLessThanOrEqual(
      geometry.footerTop - 8,
    );
    if (['de', 'ar', 'ja'].includes(locale)) {
      const audit = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(audit.violations, `${locale}: accessibility`).toEqual([]);
      await page.screenshot({ path: `reports/contact-${locale}-${testInfo.project.name}.png` });
    }
  }
});
