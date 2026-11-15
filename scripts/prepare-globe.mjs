import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { brand } from '../src/data/brand.ts';
const world = JSON.parse(await readFile('public/data/countries.geo.json', 'utf8'));
const features = Array.isArray(world)
  ? world
  : world.features.map((f) => ({ name: f.properties.ADMIN, geometry: f.geometry }));
await writeFile('public/data/countries.geo.json', JSON.stringify(features));
const isTurkey = (f) => f.name === 'Turkey' || f.name === 'Türkiye';
await writeFile('src/data/turkey.json', JSON.stringify(features.find(isTurkey).geometry));
const polygons = (f) =>
  f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
const paths = features
  .map(
    (f) =>
      `<path fill="#ededed" stroke="#808080" stroke-width=".55" d="${polygons(f)
        .map((poly) =>
          poly
            .map(
              (ring) =>
                ring
                  .map(
                    ([lon, lat], i) =>
                      `${i ? 'L' : 'M'}${(((lon + 180) / 360) * 2048).toFixed(2)} ${(((90 - lat) / 180) * 1024).toFixed(2)}`,
                  )
                  .join('') + 'Z',
            )
            .join(''),
        )
        .join('')}"/>`,
  )
  .join('');
// A geographic data mask. Lighting, points and graticules are rendered in the
// surface shader rather than baked into a flat, pre-lit color texture.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024"><rect width="2048" height="1024" fill="#000"/>${paths}</svg>`;
await sharp(Buffer.from(svg)).webp({ quality: 96 }).toFile('public/data/world-texture.webp');
const projection = ([lon, lat]) => {
  const phi = (lat * Math.PI) / 180,
    lambda = ((lon - 35) * Math.PI) / 180,
    center = 0.4;
  const x = Math.cos(phi) * Math.sin(lambda),
    y = Math.cos(center) * Math.sin(phi) - Math.sin(center) * Math.cos(phi) * Math.cos(lambda),
    z = Math.sin(center) * Math.sin(phi) + Math.cos(center) * Math.cos(phi) * Math.cos(lambda);
  return [300 + x * 230, 300 - y * 230, z];
};
const globe = features
  .map(
    (f) =>
      `<path fill="${isTurkey(f) ? brand.red : '#626d7d'}" stroke="#19212c" stroke-width=".55" d="${polygons(
        f,
      )
        .flatMap((poly) =>
          poly.map((ring) => {
            const points = ring.map(projection).filter((p) => p[2] > 0);
            return points.length > 2
              ? points
                  .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
                  .join('') + 'Z'
              : '';
          }),
        )
        .join('')}"/>`,
  )
  .join('');
await writeFile(
  'public/data/globe-fallback.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><radialGradient id="s" cx="30%" cy="25%" r="75%"><stop stop-color="#202b3c"/><stop offset="1" stop-color="#05080e"/></radialGradient><radialGradient id="shade" cx="26%" cy="20%" r="82%"><stop stop-color="#bbc7d5" stop-opacity=".1"/><stop offset=".68" stop-color="#03050b" stop-opacity=".18"/><stop offset="1" stop-color="#03050b" stop-opacity=".9"/></radialGradient><radialGradient id="g"><stop offset=".78" stop-color="#8ca1bb" stop-opacity="0"/><stop offset=".9" stop-color="#8ca1bb" stop-opacity=".18"/><stop offset="1" stop-color="#8ca1bb" stop-opacity="0"/></radialGradient><clipPath id="c"><circle cx="300" cy="300" r="220"/></clipPath><pattern id="p" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".6" fill="#c6ced9" opacity=".35"/></pattern><filter id="b"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="300" cy="300" r="245" fill="url(#g)"/><circle cx="300" cy="300" r="220" fill="url(#s)"/><g clip-path="url(#c)">${globe}<circle cx="300" cy="300" r="220" fill="url(#p)"/><circle cx="300" cy="300" r="220" fill="url(#shade)"/></g><g fill="none" stroke="${brand.red}"><ellipse cx="300" cy="300" rx="280" ry="98" transform="rotate(-25 300 300)" opacity=".24"/><ellipse cx="300" cy="300" rx="266" ry="130" transform="rotate(38 300 300)" opacity=".15"/><ellipse cx="300" cy="300" rx="280" ry="98" transform="rotate(-25 300 300)" stroke-width="3" stroke-dasharray="180 1400" stroke-dashoffset="-145" opacity=".7" filter="url(#b)"/><ellipse cx="300" cy="300" rx="280" ry="98" transform="rotate(-25 300 300)" stroke-width="1.3" stroke-dasharray="180 1400" stroke-dashoffset="-145"/></g></svg>`,
);
if (process.argv.includes('--globe-only')) process.exit(0);
await sharp('src/assets/hero.jpg')
  .resize(1200, 630, { fit: 'cover' })
  .composite([
    {
      input: Buffer.from(
        '<svg width="1200" height="630"><rect width="1200" height="630" fill="#050505" opacity=".6"/><text x="70" y="310" fill="white" font-family="Arial" font-size="65" font-weight="bold">Algebra Teknoloji</text><rect x="70" y="360" width="110" height="5" fill="#d00024"/><text x="70" y="420" fill="#cccccc" font-family="Arial" font-size="27">Yazılım · Bilişim · Enerji · Mühendislik</text></svg>',
      ),
    },
  ])
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg');
console.log('World texture, geographic fallback and Open Graph image prepared.');
