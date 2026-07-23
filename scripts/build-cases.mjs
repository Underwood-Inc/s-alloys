/**
 * Build qa/cases.json from scripts/qa-cases-data.mjs
 * Run: node scripts/build-cases.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCases, DATAPACK_VERSION } from './qa-cases-data.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'qa', 'cases.json');

const payload = {
  datapack_version: DATAPACK_VERSION,
  generated_at: new Date().toISOString(),
  cases: buildCases(),
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${out} (${payload.cases.length} cases)`);
