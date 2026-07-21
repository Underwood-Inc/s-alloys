import { test, expect } from 'vitest';
import { computeVerdictBreakdown } from './computeVerdictBreakdown.js';
import { progressRingAriaLabel, renderProgressRing } from './progressRingView.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const cases: QaCase[] = [
  { id: 'A', suite: 'smoke', kind: 'smoke', title: 'A', objective: '', severity: 'low' },
  { id: 'B', suite: 'smoke', kind: 'smoke', title: 'B', objective: '', severity: 'low' },
];

/**
 * @description Segmented ring exposes verdict CSS variables and accessible summary text.
 */
test('[FR-005] renderProgressRing emits segmented styles and tooltip rows', () => {
  const breakdown = computeVerdictBreakdown(cases, {
    A: { verdict: 'pass', notes: '', updated_at: '' },
  });
  const html = renderProgressRing({
    breakdown,
    suiteRows: [{
      id: 'smoke',
      label: 'Smoke',
      total: 2,
      reviewed: 1,
      pass: 0,
      fail: 1,
      skip: 0,
    }],
  });

  expect(html).toContain('data-viewport-tooltip');
  expect(html).toContain('progress-ring--segmented');
  expect(html).toContain('--pass-pct:50');
  expect(html).toContain('--untested-pct:50');
  expect(html).toContain('1 / 2 reviewed');
  expect(html).toContain('By suite');
  expect(html).toContain('Smoke');
  expect(html).toContain('progress-ring__tooltip-suite-meter');
  expect(html).toContain('1 fail');
});

test('[FR-005] progressRingAriaLabel summarizes verdict counts', () => {
  const breakdown = computeVerdictBreakdown(cases, {
    A: { verdict: 'fail', notes: '', updated_at: '' },
  });

  expect(progressRingAriaLabel(breakdown)).toBe('Review progress 50 percent. 0 pass, 1 fail, 0 skip, 1 untested.');
});
