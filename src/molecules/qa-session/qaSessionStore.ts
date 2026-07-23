import type { QaSession, QaStorage } from './qaSessionTypes.js';

const EMPTY_SESSION: QaSession = {
  tester_name: '',
  selected_id: null,
  progress: {},
};

export class QaSessionStore extends EventTarget {
  private session: QaSession;

  constructor(private readonly storage: QaStorage) {
    super();
    this.session = storage.load() ?? structuredClone(EMPTY_SESSION);
  }

  getSession(): QaSession {
    return structuredClone(this.session);
  }

  getProgress(caseId: string) {
    return this.session.progress[caseId] ?? { verdict: 'untested' as const, notes: '', updated_at: '' };
  }

  setTesterName(tester_name: string) {
    this.session.tester_name = tester_name;
    this.persist();
  }

  setSelectedId(selected_id: string | null) {
    this.session.selected_id = selected_id;
    this.persist();
  }

  setVerdict(caseId: string, verdict: 'pass' | 'fail' | 'skip') {
    this.session.progress[caseId] = {
      verdict,
      notes: this.getProgress(caseId).notes,
      updated_at: new Date().toISOString(),
    };
    this.persist();
  }

  setNotes(caseId: string, notes: string) {
    const current = this.getProgress(caseId);
    this.session.progress[caseId] = {
      verdict: current.verdict,
      notes,
      updated_at: new Date().toISOString(),
    };
    this.persist();
  }

  mergeImport(partial: Partial<QaSession>) {
    if (partial.tester_name) this.session.tester_name = partial.tester_name;
    if (partial.progress) {
      this.session.progress = { ...this.session.progress, ...partial.progress };
    }
    this.persist();
  }

  resetProgress() {
    this.session.progress = {};
    this.persist();
  }

  private persist() {
    this.storage.save(this.session);
    this.dispatchEvent(new CustomEvent('change', { detail: this.getSession() }));
  }
}
