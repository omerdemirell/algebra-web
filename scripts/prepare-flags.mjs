import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('public/flags', { recursive: true });
for (const code of ['tr', 'gb', 'sa', 'de', 'fr', 'cn', 'jp', 'ru', 'it', 'es']) {
  const response = await fetch(`https://flagcdn.com/${code}.svg`);
  if (!response.ok) throw new Error(`${code}: HTTP ${response.status}`);
  await writeFile(`public/flags/${code}.svg`, await response.text());
}
