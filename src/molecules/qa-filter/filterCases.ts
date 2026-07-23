import type { CaseProgress, QaCase } from '../qa-session/qaSessionTypes.js';

export interface QaFilterState {
  suite: string;
  alloy: string;
  verdict: string;
  search: string;
  progress: Record<string, CaseProgress>;
}

export function filterCases(cases: QaCase[], state: QaFilterState): QaCase[] {
  const q = state.search.trim().toLowerCase();
  return cases.filter((testCase) => {
    if (state.suite && testCase.suite !== state.suite) return false;
    if (state.alloy && testCase.alloy !== state.alloy) return false;
    const current = state.progress[testCase.id]?.verdict ?? 'untested';
    if (state.verdict && current !== state.verdict) return false;
    if (!q) return true;
    const hay = [testCase.id, testCase.title, testCase.objective, testCase.alloy, testCase.suite]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}
