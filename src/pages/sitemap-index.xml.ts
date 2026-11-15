import type { APIRoute } from 'astro';
import { publishedLocales } from '../i18n/locales';
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publishedLocales.map((locale) => `<sitemap><loc>https://algebrateknoloji.com/sitemap-${locale}.xml</loc></sitemap>`).join('')}</sitemapindex>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
