import { test, expect } from 'vitest';
import { fragmentShowcaseEntries } from './fragmentShowcaseCatalog.js';

test('[FR-007] fragmentShowcaseEntries lists four fragment alloys with vein blurbs', () => {
  const entries = fragmentShowcaseEntries();

  expect(entries).toHaveLength(4);
  expect(entries.map((entry) => entry.alloy.id)).toEqual(['cobalt', 'nickel', 'mythril', 'adamantine']);
  expect(entries[0].vein).toContain('lapis');
});
