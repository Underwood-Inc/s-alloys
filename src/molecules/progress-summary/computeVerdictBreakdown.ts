import type { CaseProgress, QaCase } from '../qa-session/qaSessionTypes.js';
import type { SuiteStats } from '../qa-catalog/suiteCatalog.js';
import { suitesInOrder } from '../qa-catalog/suiteCatalog.js';

export interface VerdictBreakdown {
  total: number;
  reviewed: number;
  pass: number;
  fail: number;
  skip: number;
  untested: number;
}

export interface VerdictPercents {
  reviewedPct: number;
  passPct: number;
  failPct: number;
  skipPct: number;
  untestedPct: number;
}

export interface SuiteTooltipRow {
  id: string;
  label: string;
  total: number;
  reviewed: number;
  pass: number;
  fail: number;
  skip: number;
}

export function computeVerdictBreakdown(
  cases: Pick<QaCase, 'id'>[],
  progress: Record<string, CaseProgress | { verdict: string }>,
): VerdictBreakdown {
  const breakdown: VerdictBreakdown = {
    total: cases.length,
    reviewed: 0,
    pass: 0,
    fail: 0,
    skip: 0,
    untested: 0,
  };

  for (const testCase of cases) {
    const verdict = progress[testCase.id]?.verdict ?? 'untested';
    if (verdict === 'pass') {
      breakdown.pass += 1;
      breakdown.reviewed += 1;
    } else if (verdict === 'fail') {
      breakdown.fail += 1;
      breakdown.reviewed += 1;
    } else if (verdict === 'skip') {
      breakdown.skip += 1;
      breakdown.reviewed += 1;
    } else {
      breakdown.untested += 1;
    }
  }

  return breakdown;
}

export function breakdownPercents(breakdown: VerdictBreakdown): VerdictPercents {
  const denom = breakdown.total || 1;
  return {
    reviewedPct: Math.round((breakdown.reviewed / denom) * 100),
    passPct: (breakdown.pass / denom) * 100,
    failPct: (breakdown.fail / denom) * 100,
    skipPct: (breakdown.skip / denom) * 100,
    untestedPct: (breakdown.untested / denom) * 100,
  };
}

export function buildSuiteTooltipRows(
  suiteStats: Record<string, SuiteStats>,
): SuiteTooltipRow[] {
  return suitesInOrder()
    .map((suite) => {
      const stats = suiteStats[suite.id];
      if (!stats?.total) return null;
      return {
        id: suite.id,
        label: suite.label,
        total: stats.total,
        reviewed: stats.reviewed,
        pass: stats.pass,
        fail: stats.fail,
        skip: stats.skip,
      };
    })
    .filter((row): row is SuiteTooltipRow => row !== null);
}
