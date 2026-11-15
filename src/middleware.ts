import { defineMiddleware } from 'astro:middleware';
import { localeFromPath, localePath } from './i18n/locales';
import { dictionaries } from './i18n/messages';
import { transformHTML } from './i18n/html';

// Static generation runs middleware for every translated route. All translated
// text ships in the HTML, including metadata, accessible labels and form feedback.
// No translation requests, DOM replacement or translation bundles run in the browser.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const locale = localeFromPath(context.url.pathname);
  if (
    locale === 'tr' ||
    response.status !== 200 ||
    !response.headers.get('content-type')?.includes('text/html')
  )
    return response;
  const dictionary = dictionaries[locale];
  const html = transformHTML(
    await response.text(),
    (source) => dictionary[source] || source,
    (source) =>
      source.startsWith('/') && !source.startsWith('//') && !source.split(/[?#]/)[0]!.includes('.')
        ? localePath(locale, source)
        : source,
  );
  return new Response(html, { status: response.status, headers: response.headers });
});
