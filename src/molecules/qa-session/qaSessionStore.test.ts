import { test, expect } from 'vitest';
import { QaSessionStore } from './qaSessionStore.js';
import { QaStorageMemory } from './memory/qaStorageMemory.js';

/**
 * @description Session state must survive reload via the storage port.
 */
test('[FR-003] saves and loads tester name and progress', () => {
  const storage = new QaStorageMemory();
  const store = new QaSessionStore(storage);
  store.setTesterName('Tester');
  store.setVerdict('SM-01', 'fail');
  store.setNotes('SM-01', 'broken');

  const reloaded = new QaSessionStore(storage);
  expect(reloaded.getSession().tester_name).toBe('Tester');
  expect(reloaded.getProgress('SM-01').verdict).toBe('fail');
  expect(reloaded.getProgress('SM-01').notes).toBe('broken');
});

test('[FR-003] reset clears progress but keeps tester name', () => {
  const storage = new QaStorageMemory();
  const store = new QaSessionStore(storage);
  store.setTesterName('Tester');
  store.setVerdict('SM-01', 'pass');
  store.resetProgress();
  expect(store.getSession().tester_name).toBe('Tester');
  expect(store.getProgress('SM-01').verdict).toBe('untested');
});

test('[FR-003] tracks selected case and notes', () => {
  const storage = new QaStorageMemory();
  const store = new QaSessionStore(storage);
  store.setSelectedId('SM-01');
  store.setNotes('SM-01', 'note');
  expect(store.getSession().selected_id).toBe('SM-01');
  expect(store.getProgress('SM-01').notes).toBe('note');
});

test('[FR-003] mergeImport combines progress maps', () => {
  const storage = new QaStorageMemory();
  const store = new QaSessionStore(storage);
  store.mergeImport({
    tester_name: 'Import',
    progress: { 'SM-01': { verdict: 'skip', notes: 'later', updated_at: 't' } },
  });
  expect(store.getSession().tester_name).toBe('Import');
  expect(store.getProgress('SM-01').verdict).toBe('skip');
});
