/**
 * Generate PWA / favicon icons from the hand-painted Alloys pack icon.
 * Run: node scripts/generate-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { paintAlloysPackIcon } from '../../alloys/tools/handcrafted/pack-icon.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'icons');

fs.mkdirSync(outDir, { recursive: true });

for (const size of [64, 192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, paintAlloysPackIcon(size));
  console.log(`Wrote ${file}`);
}
