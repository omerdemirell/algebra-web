// Editorial preparation only: generated translations are committed as local
// dictionaries. The website and normal builds never call a translation service.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { transformHTML, normalizeText, isTranslatable } from '../src/i18n/html.ts';
import { translations } from '../src/i18n/ui.ts';

const locales = ['en', 'ar', 'de', 'fr', 'zh-CN', 'ja', 'ru', 'it', 'es'];
const strings = new Set();
const add = (value) => {
  const key = normalizeText(value);
  if (isTranslatable(key)) strings.add(key);
  return value;
};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (dir === 'dist' && entry.isDirectory() && locales.includes(entry.name)) continue;
    const file = join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.html') && entry.name !== '404.html')
      transformHTML(await readFile(file, 'utf8'), add);
  }
}
await walk('dist');
function leaves(value, fn) {
  if (Array.isArray(value)) return value.map((v) => leaves(v, fn));
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, leaves(v, fn)]));
  return fn(value);
}
leaves(translations.tr, add);
// Client feedback is emitted as data attributes, so no Turkish-only strings are
// embedded in the JavaScript bundles.
[
  'Dil seçin',
  'Dil ara',
  'Dil ara…',
  'Eşleşen dil bulunamadı.',
  'Form doğrulanamadı.',
  'Bilgileriniz biçim olarak geçerli. Henüz hiçbir mesaj veya başvuru gönderilmedi; bilgileriniz kaydedilmedi. Gönderim servisi etkinleştirilmelidir.',
  '{count} hizmet',
  'Çözümü keşfedin',
  'Kariyer Alanını Keşfedin',
  'Bilgi Merkezine Gidin',
].forEach(add);
await mkdir('src/i18n/messages', { recursive: true });
const sources = [...strings].sort();
await writeFile('src/i18n/messages/source.json', JSON.stringify(sources, null, 2) + '\n');
console.log(`${sources.length} unique source strings (${sources.join('').length} characters)`);

function seed(base, translated, dict) {
  if (Array.isArray(base)) return base.forEach((v, i) => seed(v, translated[i], dict));
  if (base && typeof base === 'object')
    return Object.keys(base).forEach((k) => seed(base[k], translated[k], dict));
  if (typeof base === 'string' && typeof translated === 'string')
    dict[normalizeText(base)] = normalizeText(translated);
}
const jobs = [];
const dictionaries = {};
for (const locale of locales) {
  let dictionary = {};
  try {
    dictionary = JSON.parse(await readFile(`src/i18n/messages/${locale}.json`, 'utf8'));
  } catch {}
  if (translations[locale]) seed(translations.tr, translations[locale], dictionary);
  dictionaries[locale] = dictionary;
  let batch = [],
    size = 0;
  for (const source of sources) {
    if (dictionary[source]) continue;
    if (size + source.length > 2700 || batch.length >= 24) {
      jobs.push({ locale, batch });
      batch = [];
      size = 0;
    }
    batch.push(source);
    size += source.length + 18;
  }
  if (batch.length) jobs.push({ locale, batch });
}
if (process.argv.includes('--collect')) {
  console.log('Collection only.');
  process.exit(0);
}
if (process.argv.includes('--refine-ui')) {
  const pairs = [];
  function pair(base, english) {
    if (Array.isArray(base)) return base.forEach((v, i) => pair(v, english[i]));
    if (base && typeof base === 'object')
      return Object.keys(base).forEach((k) => pair(base[k], english[k]));
    pairs.push([normalizeText(base), normalizeText(english)]);
  }
  pair(translations.tr, translations.en);
  for (const locale of ['de', 'fr', 'ja', 'ru', 'it', 'es']) {
    for (let start = 0; start < pairs.length; start += 16) {
      const group = pairs.slice(start, start + 16);
      jobs.push({ locale, batch: group.map((p) => p[1]), keys: group.map((p) => p[0]), sl: 'en' });
    }
  }
}
console.log(`${jobs.length} translation batches to prepare`);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function translate(locale, batch, sl = 'tr') {
  // Protect the registered company name while allowing surrounding prose to be translated.
  const input = batch
    .map((s, i) => `###${i}###\n${s.replace(/Algebra Teknoloji/gi, 'QX92741')}`)
    .join('\n\n');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  for (const [k, v] of Object.entries({ client: 'gtx', sl, tl: locale, dt: 't', q: input }))
    url.searchParams.set(k, v);
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`Translation ${response.status}`);
  const data = await response.json();
  const output = data[0]
    .map((part) => part[0] || '')
    .join('')
    .replaceAll('＃', '#');
  const entries = [
    ...output.matchAll(/#{2,}\s*(\d+)\s*#{2,}\s*([\s\S]*?)(?=#{2,}\s*\d+\s*#{2,}|$)/g),
  ];
  if (entries.length !== batch.length) {
    if (batch.length === 1)
      throw new Error(`Translation markers lost for ${locale}: ${output.slice(0, 120)}`);
    const mid = Math.ceil(batch.length / 2);
    return [
      ...(await translate(locale, batch.slice(0, mid), sl)),
      ...(await translate(locale, batch.slice(mid), sl)),
    ];
  }
  return entries.map((m, i) => {
    if (Number(m[1]) !== i || !m[2].trim()) throw new Error(`Translation alignment ${locale}:${i}`);
    let value = normalizeText(m[2]).replace(/QX\s*92741/gi, 'Algebra Teknoloji');
    // Keep reusable count interpolation machine-readable across all scripts.
    value = value.replace(/\{\s*(?:count|Count|COUNT)\s*\}/g, '{count}');
    return value;
  });
}
let completed = 0;
async function save(locale) {
  const ordered = Object.fromEntries(
    Object.entries(dictionaries[locale]).sort(([a], [b]) => a.localeCompare(b, 'tr')),
  );
  await writeFile(`src/i18n/messages/${locale}.json`, JSON.stringify(ordered, null, 2) + '\n');
}
async function worker() {
  while (jobs.length) {
    const { locale, batch, keys = batch, sl = 'tr' } = jobs.shift();
    let values;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        values = await translate(locale, batch, sl);
        break;
      } catch (error) {
        if (attempt === 3) throw error;
        await pause((attempt + 1) * 2000);
      }
    }
    keys.forEach((source, i) => (dictionaries[locale][source] = values[i]));
    await save(locale);
    completed++;
    if (completed % 10 === 0 || jobs.length === 0)
      console.log(`${completed} batches saved, ${jobs.length} remaining`);
    await pause(180);
  }
}
await Promise.all([worker(), worker(), worker()]);
for (const locale of locales) {
  await save(locale);
  const missing = sources.filter((s) => !dictionaries[locale][s]);
  if (missing.length) throw new Error(`${locale}: ${missing.length} missing translations`);
}
console.log('All nine translation dictionaries are complete.');
await import('./refine-dictionaries.mjs');
