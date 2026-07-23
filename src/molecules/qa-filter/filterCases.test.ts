import { test, expect } from 'vitest';
import { filterCases } from './filterCases.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const sample: QaCase[] = [
  { id: 'A', suite: 'smoke', kind: 'smoke', title: 'Alpha', objective: 'one', severity: 'blocker', alloy: 'tin' },
  { id: 'B', suite: 'gear-positive', kind: 'gear', title: 'Beta bronze', objective: 'two', severity: 'high', alloy: 'bronze' },
];

/**
 * @description Testers need fast narrowing during long QA sessions.
 */
test('[FR-004] filters by suite alloy verdict and search', () => {
  const result = filterCases(sample, {
    suite: 'gear-positive',
    alloy: 'bronze',
    verdict: '',
    search: 'beta',
    progress: { B: { verdict: 'pass', notes: '', updated_at: '' } },
  });
  expect(result.map((c) => c.id)).toEqual(['B']);
});

test('[FR-004] filters by verdict using progress map', () => {
  const result = filterCases(sample, {
    suite: '',
    alloy: '',
    verdict: 'pass',
    search: '',
    progress: { B: { verdict: 'pass', notes: '', updated_at: '' } },
  });
  expect(result.map((c) => c.id)).toEqual(['B']);
});
