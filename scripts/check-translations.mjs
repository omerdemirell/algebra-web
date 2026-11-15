import assert from 'node:assert/strict';
import { translations } from '../src/i18n/ui.ts';
import { localeRegistry, publishedLocales } from '../src/i18n/locales.ts';
import { dictionaries } from '../src/i18n/messages.ts';
const base = translations.tr;
let checked = 0;
function validate(reference, value, path, locale) {
  if (Array.isArray(reference)) {
    assert(
      Array.isArray(value) && value.length === reference.length,
      `${locale}.${path}: translation array length differs`,
    );
    reference.forEach((entry, i) => validate(entry, value[i], `${path}[${i}]`, locale));
    return;
  }
  assert.equal(typeof value, 'string', `${locale}.${path}: translation missing`);
  assert(value.trim().length > 0, `${locale}.${path}: translation empty`);
  if (locale !== 'tr')
    assert.notEqual(
      value,
      reference,
      `${locale}.${path}: Turkish text was copied without translation`,
    );
  checked++;
}
for (const locale of publishedLocales) {
  assert.deepEqual(
    Object.keys(translations[locale]).sort(),
    Object.keys(base).sort(),
    `${locale}: missing translation keys`,
  );
  for (const key of Object.keys(base)) validate(base[key], translations[locale][key], key, locale);
}
assert.equal(localeRegistry.length, 10);
assert.deepEqual(publishedLocales, ['tr', 'en', 'ar', 'de', 'fr', 'zh-CN', 'ja', 'ru', 'it', 'es']);
assert.deepEqual(
  localeRegistry
    .filter(([, , live]) => live)
    .map(([code]) => code)
    .sort(),
  [...publishedLocales].sort(),
);
assert.equal(localeRegistry.find(([code]) => code === 'ar')[3], 'rtl');
for (const [locale, dictionary] of Object.entries(dictionaries)) {
  assert.equal(
    dictionary['{count} hizmet'].match(/\{count\}/g)?.length,
    1,
    `${locale}: count interpolation`,
  );
  for (const [source, value] of Object.entries(dictionary)) {
    assert(value.trim(), `${locale}: empty translation for ${source}`);
    assert(
      !/###|ZXMARQUE|ZXMARCA|ZX品牌|ZXBRAND|QX92741/.test(value),
      `${locale}: translation marker in ${source}`,
    );
  }
}
console.log(
  `PASS: ${checked} UI strings, matching keys and array shapes, 10 active locales, translation markers, placeholders and RTL registry.`,
);
