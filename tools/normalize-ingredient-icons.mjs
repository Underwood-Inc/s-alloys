/**
 * Downscale guide ingredient PNGs to 16×16 (Minecraft slot size).
 * Vanilla exports at 64×64 were scaling inconsistently against 16×16 alloy icons.
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const INGREDIENTS_DIR = path.resolve('public/guide/ingredients');
const TARGET = 16;

function downscaleNearest(src, size) {
  const dst = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = Math.min(src.width - 1, Math.floor(((x + 0.5) * src.width) / size));
      const sy = Math.min(src.height - 1, Math.floor(((y + 0.5) * src.height) / size));
      const si = (sy * src.width + sx) << 2;
      const di = (y * size + x) << 2;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

let changed = 0;
for (const file of fs.readdirSync(INGREDIENTS_DIR).filter((name) => name.endsWith('.png'))) {
  const filePath = path.join(INGREDIENTS_DIR, file);
  const src = PNG.sync.read(fs.readFileSync(filePath));
  if (src.width === TARGET && src.height === TARGET) continue;
  const dst = downscaleNearest(src, TARGET);
  fs.writeFileSync(filePath, PNG.sync.write(dst));
  changed += 1;
  console.log(`${file}: ${src.width}x${src.height} -> ${TARGET}x${TARGET}`);
}

console.log(changed ? `Normalized ${changed} icon(s).` : 'All ingredient icons already 16x16.');
