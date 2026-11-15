import { mkdir, writeFile, copyFile } from 'node:fs/promises';
await mkdir('src/assets', { recursive: true });
await mkdir('public/brand', { recursive: true });
await mkdir('public/data', { recursive: true });
await mkdir('public/fonts', { recursive: true });
const licenseResponse = await fetch(
  'https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt',
);
if (!licenseResponse.ok) throw new Error(`Font license: HTTP ${licenseResponse.status}`);
await writeFile('public/fonts/OFL.txt', await licenseResponse.text());
if (process.argv.includes('--licenses-only')) {
  console.log('Manrope OFL license saved.');
  process.exit(0);
}
const base = 'C:/Users/Allatro/Desktop/algebra teknoloji/';
await copyFile(base + 'algebra-logo.jpeg', 'public/brand/algebra-logo.jpeg');
await copyFile(base + 'algebra-remove.png', 'public/brand/algebra-remove.png');
await copyFile(base + 'favicon.png', 'public/brand/favicon.png');
const assets = [
  [
    'src/assets/hero.jpg',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=88',
  ],
  [
    'src/assets/software.jpg',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1500&q=85',
  ],
  [
    'src/assets/datacenter.jpg',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=85',
  ],
  [
    'src/assets/solar.jpg',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=85',
  ],
  [
    'src/assets/engineering.jpg',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1500&q=85',
  ],
  [
    'public/data/countries.geo.json',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
  ],
  [
    'public/fonts/manrope-latin.woff2',
    'https://cdn.jsdelivr.net/fontsource/fonts/manrope:vf@latest/latin-wght-normal.woff2',
  ],
  [
    'public/fonts/manrope-latin-ext.woff2',
    'https://cdn.jsdelivr.net/fontsource/fonts/manrope:vf@latest/latin-ext-wght-normal.woff2',
  ],
];
for (const [path, url] of assets) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000) throw new Error(`Invalid asset: ${path}`);
  await writeFile(path, bytes);
  console.log(`${path}: ${bytes.length} bytes`);
}
