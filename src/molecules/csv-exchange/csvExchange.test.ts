import { test, expect } from 'vitest';
import { exportQaCsv, exportQaJson, importQaCsv } from './csvExchange.js';
import type { QaCase, QaSession } from '../qa-session/qaSessionTypes.js';

const cases: QaCase[] = [
  {
    id: 'SM-01',
    suite: 'smoke',
    kind: 'smoke',
    title: 'Datapack enabled',
    objective: 'Confirm Alloys is loaded.',
    severity: 'blocker',
  },
];

const session: QaSession = {
  tester_name: 'Rowan',
  selected_id: 'SM-01',
  progress: {
    'SM-01': { verdict: 'pass', notes: 'ok', updated_at: '2026-01-01T00:00:00.000Z' },
  },
};

/**
 * @description Export must be shareable and re-importable for ad-hoc QA handoffs.
 */
test('[FR-001] export includes metadata and case rows', () => {
  const csv = exportQaCsv('1.0.43', cases, session, 1);
  expect(csv).toContain('# tester_name,Rowan');
  expect(csv).toContain('# datapack_version,1.0.43');
  expect(csv).toContain('SM-01,smoke,smoke,,Datapack enabled,blocker,pass,ok');
});

/**
 * @description Import merges progress without inventing unknown case ids.
 */
test('[FR-002] import merges known case progress and tester name', () => {
  const csv = exportQaCsv('1.0.43', cases, session, 1);
  const result = importQaCsv(csv, new Set(['SM-01']));
  expect(result.tester_name).toBe('Rowan');
  expect(result.progress['SM-01']?.verdict).toBe('pass');
});

test('[FR-002] import ignores unknown case ids', () => {
  const csv = 'case_id,suite,kind,alloy,title,severity,verdict,notes,updated_at\nXX-99,smoke,smoke,,Ghost,low,fail,bad,';
  const result = importQaCsv(csv, new Set(['SM-01']));
  expect(result.progress['XX-99']).toBeUndefined();
});

test('[FR-001] exportQaJson includes progress payload', () => {
  const json = exportQaJson('1.0.43', cases, session, 1);
  expect(json.tester_name).toBe('Rowan');
  expect(json.progress['SM-01']?.verdict).toBe('pass');
});

test('[FR-002] import reads quoted csv fields', () => {
  const csv = 'case_id,suite,kind,alloy,title,severity,verdict,notes,updated_at\nSM-01,smoke,smoke,,Datapack enabled,blocker,pass,"comma, note",';
  const result = importQaCsv(csv, new Set(['SM-01']));
  expect(result.progress['SM-01']?.notes).toBe('comma, note');
});
