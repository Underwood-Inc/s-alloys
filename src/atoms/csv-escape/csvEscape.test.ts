import { test, expect } from 'vitest';
import { escapeCsv } from './csvEscape.js';

/**
 * @description CSV fields with commas or quotes must be RFC4180 escaped.
 */
test('[FR-001] wraps values that contain commas in double quotes', () => {
  expect(escapeCsv('hello, world')).toBe('"hello, world"');
});

test('[FR-001] doubles embedded double quotes', () => {
  expect(escapeCsv('say "hi"')).toBe('"say ""hi"""');
});

test('[FR-001] leaves simple tokens unquoted', () => {
  expect(escapeCsv('pass')).toBe('pass');
});
