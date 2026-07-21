export interface SuiteMeta {
  id: string;
  label: string;
  description: string;
  phase: string;
  order: number;
}

export const SUITE_CATALOG: SuiteMeta[] = [
  { id: 'smoke', label: 'Smoke', description: 'Datapack loaded, kits, and happy-path sanity.', phase: 'Foundation', order: 1 },
  { id: 'ingots', label: 'Ingots', description: 'Crafting and identity of every alloy ingot.', phase: 'Materials', order: 2 },
  { id: 'fragments', label: 'Fragments', description: 'Ore bonus drops and nine-fragment combines.', phase: 'Materials', order: 3 },
  { id: 'gear-positive', label: 'Gear — legit', description: 'Real alloy ingots produce correct gear.', phase: 'Crafting', order: 4 },
  { id: 'gear-negative', label: 'Gear — fraud', description: 'Plain lookalikes must not keep alloy gear.', phase: 'Crafting', order: 5 },
  { id: 'mixed', label: 'Mixed layouts', description: 'Cross-alloy and edge-case crafting grids.', phase: 'Crafting', order: 6 },
  { id: 'effects', label: 'Traits', description: 'Passive bonuses while held or worn.', phase: 'Gameplay', order: 7 },
  { id: 'ops', label: 'Unlocks & ore', description: 'Recipe book, kits, and world interactions.', phase: 'Gameplay', order: 8 },
  { id: 'signoff', label: 'Sign-off', description: 'Final release checklist before shipping.', phase: 'Release', order: 9 },
];

export interface SuiteStats {
  total: number;
  reviewed: number;
  pass: number;
  fail: number;
  skip: number;
}

export function suitesInOrder(): SuiteMeta[] {
  return [...SUITE_CATALOG].sort((a, b) => a.order - b.order);
}

export function getSuiteMeta(id: string): SuiteMeta | undefined {
  return SUITE_CATALOG.find((suite) => suite.id === id);
}

export function groupCasesBySuite<T extends { suite: string }>(cases: T[]): Map<string, T[]> {
  const order = new Map(suitesInOrder().map((suite, index) => [suite.id, index]));
  const groups = new Map<string, T[]>();
  for (const suite of suitesInOrder()) groups.set(suite.id, []);
  for (const testCase of cases) {
    if (!groups.has(testCase.suite)) groups.set(testCase.suite, []);
    groups.get(testCase.suite)!.push(testCase);
  }
  return new Map([...groups.entries()].sort((a, b) => (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99)));
}

export function computeSuiteStats(
  cases: { id: string; suite: string }[],
  progress: Record<string, { verdict: string }>,
): Record<string, SuiteStats> {
  const stats: Record<string, SuiteStats> = {};
  for (const suite of SUITE_CATALOG) {
    stats[suite.id] = { total: 0, reviewed: 0, pass: 0, fail: 0, skip: 0 };
  }
  for (const testCase of cases) {
    const bucket = stats[testCase.suite] ?? { total: 0, reviewed: 0, pass: 0, fail: 0, skip: 0 };
    bucket.total += 1;
    const verdict = progress[testCase.id]?.verdict ?? 'untested';
    if (verdict === 'pass' || verdict === 'fail' || verdict === 'skip') {
      bucket.reviewed += 1;
      if (verdict === 'pass') bucket.pass += 1;
      if (verdict === 'fail') bucket.fail += 1;
      if (verdict === 'skip') bucket.skip += 1;
    }
    stats[testCase.suite] = bucket;
  }
  return stats;
}

export function phasesWithSuites(): { phase: string; suites: SuiteMeta[] }[] {
  const phases: { phase: string; suites: SuiteMeta[] }[] = [];
  for (const suite of suitesInOrder()) {
    const last = phases[phases.length - 1];
    if (!last || last.phase !== suite.phase) phases.push({ phase: suite.phase, suites: [suite] });
    else last.suites.push(suite);
  }
  return phases;
}
