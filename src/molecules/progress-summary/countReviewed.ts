import type { CaseProgress, QaCase } from '../qa-session/qaSessionTypes.js';

export function countReviewed(cases: QaCase[], progress: Record<string, CaseProgress>): number {
  return cases.filter((testCase) => {
    const verdict = progress[testCase.id]?.verdict ?? 'untested';
    return verdict === 'pass' || verdict === 'fail' || verdict === 'skip';
  }).length;
}
