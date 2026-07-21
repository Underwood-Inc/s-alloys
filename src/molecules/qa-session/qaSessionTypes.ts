export type Verdict = 'untested' | 'pass' | 'fail' | 'skip';

export interface CaseProgress {
  verdict: Verdict;
  notes: string;
  updated_at: string;
}

export interface QaCase {
  id: string;
  suite: string;
  kind: string;
  title: string;
  objective: string;
  severity: string;
  alloy?: string;
  preconditions?: string[];
  input?: string[];
  steps?: string[];
  expect?: string[];
  mustNot?: string[];
}

export interface QaCatalog {
  datapack_version: string;
  generated_at: string;
  cases: QaCase[];
}

export interface QaSession {
  tester_name: string;
  selected_id: string | null;
  progress: Record<string, CaseProgress>;
}

export interface QaStorage {
  load(): QaSession | null;
  save(session: QaSession): void;
}
