export type QaHeaderProgress = {
  pct: number;
  reviewed: number;
  total: number;
  version: string;
  testerName: string;
  breakdown: {
    total: number;
    reviewed: number;
    pass: number;
    fail: number;
    skip: number;
    untested: number;
  };
  suiteRows: {
    id: string;
    label: string;
    total: number;
    reviewed: number;
    pass: number;
    fail: number;
    skip: number;
  }[];
};

const PROGRESS_EVENT = 'alloys:qa-progress';
const CLEAR_EVENT = 'alloys:qa-progress-clear';

export function publishQaHeaderProgress(detail: QaHeaderProgress): void {
  window.dispatchEvent(new CustomEvent<QaHeaderProgress>(PROGRESS_EVENT, { detail }));
}

export function clearQaHeaderProgress(): void {
  window.dispatchEvent(new CustomEvent(CLEAR_EVENT));
}

export function onQaHeaderProgress(listener: (detail: QaHeaderProgress) => void): () => void {
  const handler = (event: Event) => {
    listener((event as CustomEvent<QaHeaderProgress>).detail);
  };
  window.addEventListener(PROGRESS_EVENT, handler);
  return () => window.removeEventListener(PROGRESS_EVENT, handler);
}

export function onQaHeaderProgressClear(listener: () => void): () => void {
  window.addEventListener(CLEAR_EVENT, listener);
  return () => window.removeEventListener(CLEAR_EVENT, listener);
}
