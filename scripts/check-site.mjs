import { readFile, readdir, access, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import './check-translations.mjs';
import { publishedLocales, localeFromPath, localePath } from '../src/i18n/locales.ts';
import { dictionaries } from '../src/i18n/messages.ts';
import { transformHTML } from '../src/i18n/html.ts';
const root = resolve('dist');
async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => (e.isDirectory() ? walk(join(path, e.name)) : [join(path, e.name)])),
    )
  ).flat();
}
const files = await walk(root),
  htmlFiles = files.filter((f) => f.endsWith('.html'));
const cache = new Map(
  await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, 'utf8')])),
);
const errors = [],
  titles = new Set();
let links = 0,
  assets = 0;
const existence = new Map();
const exists = async (path) => {
  if (existence.has(path)) return existence.get(path);
  try {
    await access(path);
    existence.set(path, true);
    return true;
  } catch {
    existence.set(path, false);
    return false;
  }
};
for (const [file, html] of cache) {
  const name = relative(root, file);
  const path = '/' + name.replaceAll('\\', '/').replace(/index\.html$/, '');
  const locale = localeFromPath(path);
  function check(value, message) {
    if (!value) errors.push(`${name}: ${message}`);
  }
  check((html.match(/<h1(?:\s|>)/g) || []).length === 1, 'must contain exactly one H1');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  check(title && !titles.has(`${locale}:${title}`), 'missing or duplicate title within language');
  titles.add(`${locale}:${title}`);
  check(
    (html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.length || 0) >=
      (['zh-CN', 'ja'].includes(locale) ? 7 : 10),
    'description missing or too short',
  );
  check(/rel="canonical" href="https:\/\/algebrateknoloji.com\//.test(html), 'canonical missing');
  check(
    /property="og:image"/.test(html) && /name="twitter:card"/.test(html),
    'social metadata missing',
  );
  check(
    !/\b(?:undefined|NaN)\b/.test(html.replace(/<script\b[^>]*>.*?<\/script>/gs, '')),
    'undefined or NaN output',
  );
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (m) => m[1]);
  check(new Set(ids).size === ids.length, 'duplicate DOM ids');
  for (const match of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  )) {
    try {
      JSON.parse(match[1]);
    } catch {
      check(false, 'invalid JSON-LD');
    }
  }
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
    const href = match[1];
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    links++;
    const url = new URL(href, `https://algebrateknoloji.com/${name.replace(/index\.html$/, '')}`);
    if (
      locale !== 'tr' &&
      href.startsWith('/') &&
      !match[0].includes('data-language-link') &&
      !url.pathname.includes('.')
    )
      check(localeFromPath(url.pathname) === locale, `link leaves selected language: ${href}`);
    const target = join(
      root,
      decodeURIComponent(url.pathname),
      url.pathname.endsWith('/') ? 'index.html' : '',
    );
    check(await exists(target), `broken link ${href}`);
    if (url.hash && cache.has(target)) {
      const targetHTML = cache.get(target);
      check(
        targetHTML.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `missing anchor ${href}`,
      );
    }
  }
  for (const match of html.matchAll(/<(?:img|script)\b[^>]*\bsrc="([^"]+)"/g)) {
    if (!match[1].startsWith('/')) continue;
    assets++;
    check(await exists(join(root, decodeURIComponent(match[1]))), `missing asset ${match[1]}`);
  }
  for (const match of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)) {
    if (!match[1].startsWith('/')) continue;
    assets++;
    check(
      await exists(join(root, decodeURIComponent(match[1]))),
      `missing linked asset ${match[1]}`,
    );
  }
  for (const match of html.matchAll(/(?:\s|-)srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const source = candidate.trim().split(/\s+/)[0];
      if (!source.startsWith('/')) continue;
      assets++;
      check(
        await exists(join(root, decodeURIComponent(source))),
        `missing responsive asset ${source}`,
      );
    }
  }
  for (const match of html.matchAll(/<img\b([^>]+)>/g))
    check(/\balt(?:\s|=|$)/.test(match[1]), 'image lacks alt attribute');
}
const basePages = [...cache.keys()].filter(
  (file) =>
    !file.endsWith('404.html') &&
    localeFromPath('/' + relative(root, file).replaceAll('\\', '/')) === 'tr',
);
const sourceStrings = new Set();
for (const file of basePages)
  transformHTML(cache.get(file), (source) => {
    sourceStrings.add(source);
    return source;
  });
for (const locale of publishedLocales) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const prefix = locale === 'tr' ? '' : locale;
  const html = await readFile(join(root, prefix, 'index.html'), 'utf8');
  assert(
    html.includes(`lang="${locale}"`) && html.includes(`dir="${direction}"`),
    `language direction: ${locale}`,
  );
  assert((html.match(/hreflang=/g) || []).length === 11, `alternate languages: ${locale}`);
  assert.equal(
    (html.match(/data-language-link=/g) || []).length,
    10,
    `${locale}: exactly ten language options`,
  );
  assert(!html.includes('Çeviri bekliyor'), `${locale}: pending language entry`);
  if (locale !== 'tr') {
    assert(!html.includes('Geleceğin teknolojisini'), `untranslated Turkish hero in ${locale}`);
    const missing = [...sourceStrings].filter((source) => !dictionaries[locale][source]);
    assert.equal(
      missing.length,
      0,
      `${locale}: missing rendered text translations:\n${missing.join('\n')}`,
    );
  }
  for (const baseFile of basePages) {
    const basePath =
      '/' +
      relative(root, baseFile)
        .replaceAll('\\', '/')
        .replace(/index\.html$/, '');
    const path = localePath(locale, basePath);
    const target = join(root, path, 'index.html');
    assert(cache.has(target), `${locale}: missing page ${path}`);
    const output = cache.get(target);
    assert.equal((output.match(/hreflang=/g) || []).length, 11, `${path}: alternate page links`);
    assert(output.includes(`lang="${locale}"`), `${path}: page language`);
    assert(
      output.includes(`rel="canonical" href="https://algebrateknoloji.com${path}"`),
      `${path}: canonical`,
    );
    if (locale !== 'tr')
      transformHTML(output, (text) => {
        if (sourceStrings.has(text))
          assert.equal(
            dictionaries[locale][text],
            text,
            `${path}: untranslated source text: ${text}`,
          );
        return text;
      });
  }
  const sitemap = await readFile(join(root, `sitemap-${locale}.xml`), 'utf8');
  assert.equal(
    (sitemap.match(/<url>/g) || []).length,
    basePages.length,
    'every translated page belongs in its locale sitemap',
  );
}
for (const locale of ['pt', 'fa', 'ko', 'zh-TW'])
  assert(
    !(await exists(join(root, locale, 'index.html'))),
    `unsupported locale was published: ${locale}`,
  );
assert(!files.some((f) => /[\\/]projeler[\\/]/.test(f)), 'projects route must not exist');
const summary = { pages: htmlFiles.length, links, assets, errors };
await mkdir('reports', { recursive: true });
await writeFile('reports/content-check.json', JSON.stringify(summary, null, 2));
const rows = [...cache].map(([file, html]) => {
  const path =
    '/' +
    relative(root, file)
      .replaceAll('\\', '/')
      .replace(/index\.html$/, '');
  const title =
    html.match(/<title>(.*?)<\/title>/s)?.[1]?.replace(/ \| Algebra Teknoloji$/, '') || '';
  return `| [${path}](http://localhost:4321${path}) | ${title.replaceAll('|', '·')} |`;
});
await mkdir('docs', { recursive: true });
await writeFile(
  'docs/PAGES.md',
  `# Üretilen sayfalar\n\n${htmlFiles.length} HTML dosyası: ${basePages.length} içerik sayfasının on dildeki sürümleri ve 404. Liste son başarılı build çıktısından üretilir. Sitemap ve robots dosyaları bu sayıya dahil değildir.\n\n| URL | Sayfa |\n| --- | --- |\n${rows.join('\n')}\n`,
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${htmlFiles.length} HTML pages, ${links} local links, ${assets} asset references, SEO, JSON-LD, locale coverage and RTL checks.`,
  );
