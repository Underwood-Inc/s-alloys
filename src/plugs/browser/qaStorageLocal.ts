import type { QaSession, QaStorage } from '../../molecules/qa-session/qaSessionTypes.js';

const STORAGE_KEY = 'alloys-qa-state-v1';

const EMPTY: QaSession = {
  tester_name: '',
  selected_id: null,
  progress: {},
};

export class QaStorageLocal implements QaStorage {
  load(): QaSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return { ...EMPTY, ...JSON.parse(raw) };
    } catch {
      return null;
    }
  }

  save(session: QaSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}
