import type { APIRoute } from 'astro';
import { publishedLocales, localePath, type Locale } from '../i18n/locales';
import { basePaths } from '../data/site';
export function getStaticPaths() {
  return publishedLocales.map((locale) => ({ params: { locale } }));
}
export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  const paths = basePaths.map((path) => localePath(locale, path));
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${paths.map((path) => `<url><loc>https://algebrateknoloji.com${path}</loc>${publishedLocales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="https://algebrateknoloji.com${localePath(l, path)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="https://algebrateknoloji.com${localePath('tr', path)}"/></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
