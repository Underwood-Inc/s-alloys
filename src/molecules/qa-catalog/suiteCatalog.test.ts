import { test, expect } from 'vitest';
import {
  SUITE_CATALOG,
  computeSuiteStats,
  getSuiteMeta,
  groupCasesBySuite,
  suitesInOrder,
} from './suiteCatalog.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const sample: QaCase[] = [
  { id: 'A', suite: 'smoke', kind: 'smoke', title: 'A', objective: '', severity: 'blocker' },
  { id: 'B', suite: 'smoke', kind: 'smoke', title: 'B', objective: '', severity: 'blocker' },
  { id: 'C', suite: 'ingots', kind: 'ingot', title: 'C', objective: '', severity: 'high' },
];

/**
 * @description QA navigation groups cases by suite in catalog order.
 */
test('[FR-004] groupCasesBySuite preserves catalog order', () => {
  const groups = groupCasesBySuite(sample);
  expect([...groups.keys()].slice(0, 2)).toEqual(['smoke', 'ingots']);
  expect(groups.get('smoke')?.map((c) => c.id)).toEqual(['A', 'B']);
});

test('[FR-005] computeSuiteStats counts reviewed verdicts per suite', () => {
  const stats = computeSuiteStats(sample, {
    A: { verdict: 'pass' },
    C: { verdict: 'fail' },
  });
  expect(stats.smoke).toEqual({ total: 2, reviewed: 1, pass: 1, fail: 0, skip: 0 });
  expect(stats.ingots.reviewed).toBe(1);
});

test('[FR-007] suite catalog exposes player-facing labels only', () => {
  for (const suite of SUITE_CATALOG) {
    expect(suite.label.length).toBeGreaterThan(2);
    expect(suite.description).not.toMatch(/custom_data|tools\/|build\/server/i);
  }
  expect(getSuiteMeta('smoke')?.phase).toBe('Foundation');
  expect(suitesInOrder().length).toBe(SUITE_CATALOG.length);
});
