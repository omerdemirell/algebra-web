export const localeRegistry = [
  ['tr', 'Türkçe', true, 'ltr'],
  ['en', 'English', true, 'ltr'],
  ['ar', 'العربية', true, 'rtl'],
  ['de', 'Deutsch', true, 'ltr'],
  ['fr', 'Français', true, 'ltr'],
  ['zh-CN', '简体中文', true, 'ltr'],
  ['ja', '日本語', true, 'ltr'],
  ['ru', 'Русский', true, 'ltr'],
  ['it', 'Italiano', true, 'ltr'],
  ['es', 'Español', true, 'ltr'],
] as const;
export type Locale = (typeof localeRegistry)[number][0];
export const publishedLocales: Locale[] = localeRegistry.map(([code]) => code);
const languageNameFormatters = new Map<Locale, Intl.DisplayNames>();
export function languageName(target: Locale, displayLocale: Locale): string {
  let formatter = languageNameFormatters.get(displayLocale);
  if (!formatter) {
    formatter = new Intl.DisplayNames([displayLocale], {
      type: 'language',
      languageDisplay: 'standard',
      fallback: 'none',
    });
    languageNameFormatters.set(displayLocale, formatter);
  }
  const name = formatter.of(target === 'zh-CN' ? 'zh' : target);
  if (!name) throw new Error(`Missing language name: ${target} in ${displayLocale}`);
  return name;
}
export const homePath = (locale: Locale) => (locale === 'tr' ? '/' : `/${locale}/`);
export const sectionIds = [
  'home',
  'about',
  'services',
  'solutions',
  'sectors',
  'careers',
  'insights',
  'contact',
] as const;
export const trPaths = [
  '',
  'kurumsal',
  'hizmetler',
  'cozumler',
  'sektorler',
  'insan-kaynaklari',
  'bilgi-merkezi',
  'iletisim',
];
export function navPath(locale: Locale, index: number) {
  return localePath(locale, `/${trPaths[index]}/`.replace('//', '/'));
}
export function localeFromPath(path: string): Locale {
  return (
    publishedLocales.find(
      (locale) => locale !== 'tr' && (path === `/${locale}` || path.startsWith(`/${locale}/`)),
    ) || 'tr'
  );
}
export function withoutLocale(path: string): string {
  const locale = localeFromPath(path);
  return locale === 'tr' ? path : path.slice(locale.length + 1) || '/';
}
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = withoutLocale(path);
  return locale === 'tr' ? base : `/${locale}${base}`;
}
export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale).format(value);
}
export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(value));
}
