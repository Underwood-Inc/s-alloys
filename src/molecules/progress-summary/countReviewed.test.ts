import { test, expect } from 'vitest';
import { countReviewed } from './countReviewed.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const cases: QaCase[] = [
  { id: 'A', suite: 'smoke', kind: 'smoke', title: 'A', objective: '', severity: 'low' },
  { id: 'B', suite: 'smoke', kind: 'smoke', title: 'B', objective: '', severity: 'low' },
  { id: 'C', suite: 'smoke', kind: 'smoke', title: 'C', objective: '', severity: 'low' },
];

/**
 * @description Progress bar uses reviewed count, not pass-only.
 */
test('[FR-005] counts pass fail and skip as reviewed', () => {
  const progress = {
    A: { verdict: 'pass' as const, notes: '', updated_at: '' },
    B: { verdict: 'fail' as const, notes: '', updated_at: '' },
    C: { verdict: 'skip' as const, notes: '', updated_at: '' },
  };
  expect(countReviewed(cases, progress)).toBe(3);
});

test('[FR-005] ignores untested cases', () => {
  expect(countReviewed(cases, {})).toBe(0);
});
