import { test, expect } from 'vitest';
import {
  breakdownPercents,
  buildSuiteTooltipRows,
  computeVerdictBreakdown,
} from './computeVerdictBreakdown.js';
import { computeSuiteStats } from '../qa-catalog/suiteCatalog.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const cases: QaCase[] = [
  { id: 'A', suite: 'smoke', kind: 'smoke', title: 'A', objective: '', severity: 'low' },
  { id: 'B', suite: 'smoke', kind: 'smoke', title: 'B', objective: '', severity: 'low' },
  { id: 'C', suite: 'ingots', kind: 'ingot', title: 'C', objective: '', severity: 'low' },
  { id: 'D', suite: 'ingots', kind: 'ingot', title: 'D', objective: '', severity: 'low' },
];

/**
 * @description Progress ring segments map to pass, fail, skip, and untested counts.
 */
test('[FR-005] computeVerdictBreakdown counts each verdict separately', () => {
  const progress = {
    A: { verdict: 'pass' as const, notes: '', updated_at: '' },
    B: { verdict: 'fail' as const, notes: '', updated_at: '' },
    C: { verdict: 'skip' as const, notes: '', updated_at: '' },
  };

  expect(computeVerdictBreakdown(cases, progress)).toEqual({
    total: 4,
    reviewed: 3,
    pass: 1,
    fail: 1,
    skip: 1,
    untested: 1,
  });
});

test('[FR-005] breakdownPercents returns segment sizes for the ring', () => {
  const breakdown = computeVerdictBreakdown(cases, {
    A: { verdict: 'pass', notes: '', updated_at: '' },
    B: { verdict: 'pass', notes: '', updated_at: '' },
  });

  expect(breakdownPercents(breakdown)).toEqual({
    reviewedPct: 50,
    passPct: 50,
    failPct: 0,
    skipPct: 0,
    untestedPct: 50,
  });
});

test('[FR-005] buildSuiteTooltipRows lists suites with totals in catalog order', () => {
  const stats = computeSuiteStats(cases, {
    A: { verdict: 'pass' },
    B: { verdict: 'fail' },
  });

  expect(buildSuiteTooltipRows(stats)).toEqual([
    { id: 'smoke', label: 'Smoke', total: 2, reviewed: 2, pass: 1, fail: 1, skip: 0 },
    { id: 'ingots', label: 'Ingots', total: 2, reviewed: 0, pass: 0, fail: 0, skip: 0 },
  ]);
});
