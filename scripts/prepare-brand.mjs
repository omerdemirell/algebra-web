import sharp from 'sharp';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
// Re-encode at native dimensions. Source files and all visible pixels remain unchanged.
for (const [source, target] of [
  ['public/brand/algebra-remove.png', 'public/brand/algebra-display.webp'],
  ['public/brand/favicon.png', 'public/brand/favicon-display.webp'],
]) {
  await sharp(source).webp({ lossless: true, effort: 6 }).toFile(target);
  const original = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const display = await sharp(target).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(original.info.width, display.info.width);
  assert.equal(original.info.height, display.info.height);
  for (let i = 0; i < original.data.length; i += 4) {
    assert.equal(original.data[i + 3], display.data[i + 3]);
    if (original.data[i + 3] > 0)
      for (let channel = 0; channel < 3; channel++)
        assert.equal(original.data[i + channel], display.data[i + channel]);
  }
  console.log(
    `${source}: ${(await stat(source)).size} → ${target}: ${(await stat(target)).size} bytes; dimensions, alpha and visible RGB verified identical.`,
  );
}
