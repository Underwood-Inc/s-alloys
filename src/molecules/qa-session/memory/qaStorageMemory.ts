import type { QaSession, QaStorage } from '../qaSessionTypes.js';

export class QaStorageMemory implements QaStorage {
  private session: QaSession | null = null;

  load(): QaSession | null {
    return this.session ? structuredClone(this.session) : null;
  }

  save(session: QaSession): void {
    this.session = structuredClone(session);
  }
}
