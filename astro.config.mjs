// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://algebrateknoloji.com',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  integrations: [react()],
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en', 'ar', 'de', 'fr', 'zh-CN', 'ja', 'ru', 'it', 'es'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
