import { test, expect } from 'vitest';
import { highlightSearchText } from './highlightSearchText.js';

test('returns escaped text when query is empty', () => {
  expect(highlightSearchText('Iron & gold', '')).toBe('Iron &amp; gold');
});

test('wraps a case-insensitive match', () => {
  expect(highlightSearchText('Night vision while worn', 'night')).toBe(
    '<mark class="search-hit">Night</mark> vision while worn',
  );
});

test('escapes HTML in the source text', () => {
  expect(highlightSearchText('<script>', 'script')).toBe(
    '&lt;<mark class="search-hit">script</mark>&gt;',
  );
});

test('highlights quoted phrase terms', () => {
  const html = highlightSearchText('Arrows: Spectral · Bow', '"spectral"');
  expect(html).toContain('<mark class="search-hit">Spectral</mark>');
});
