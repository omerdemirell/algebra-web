import en from './messages/en.json' with { type: 'json' };
import ar from './messages/ar.json' with { type: 'json' };
import de from './messages/de.json' with { type: 'json' };
import fr from './messages/fr.json' with { type: 'json' };
import zh from './messages/zh-CN.json' with { type: 'json' };
import ja from './messages/ja.json' with { type: 'json' };
import ru from './messages/ru.json' with { type: 'json' };
import it from './messages/it.json' with { type: 'json' };
import es from './messages/es.json' with { type: 'json' };
import type { Locale } from './locales';

export const dictionaries: Record<Exclude<Locale, 'tr'>, Record<string, string>> = {
  en,
  ar,
  de,
  fr,
  'zh-CN': zh,
  ja,
  ru,
  it,
  es,
};
export const normalizeMessage = (value: string) => value.replace(/\s+/g, ' ').trim();
/** Strict lookup for source content; incomplete translations stop the build. */
export function message(locale: Locale, source: string): string {
  if (locale === 'tr') return source;
  const key = normalizeMessage(source);
  const result = dictionaries[locale][key];
  if (!result) throw new Error(`Missing ${locale} translation: ${key}`);
  return result;
}
export function translateTree<T>(value: T, locale: Locale): T {
  if (typeof value === 'string') return message(locale, value) as T;
  if (Array.isArray(value)) return value.map((item) => translateTree(item, locale)) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateTree(item, locale)]),
    ) as T;
  return value;
}
