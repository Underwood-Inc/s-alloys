import { test, expect } from 'vitest';
import {
  createSearchQueryMatcher,
  matchesSearchQuery,
  parseSearchQuery,
} from './searchQueryParser.js';

test('quoted phrases, OR groups, and AND terms are parsed from a search query', () => {
  const parsed = parseSearchQuery('"exact phrase" foo bar | baz');
  expect(parsed.exactPhrases).toEqual(['exact phrase']);
  expect(parsed.orGroups).toEqual([
    ['foo', 'bar'],
    ['baz'],
  ]);
  expect(parsed.hasContent).toBe(true);
});

test('a search result must contain every word in the AND group to match', () => {
  expect(matchesSearchQuery('silver wolf mountain', 'silver wolf')).toBe(true);
  expect(matchesSearchQuery('silver mountain', 'silver wolf')).toBe(false);
});

test('a search result matches when it satisfies any one of the OR alternatives', () => {
  expect(matchesSearchQuery('foo only', 'bar | foo')).toBe(true);
  expect(matchesSearchQuery('bar only', 'bar | foo')).toBe(true);
  expect(matchesSearchQuery('neither', 'bar | foo')).toBe(false);
});

test('wildcard prefix term matches substring', () => {
  expect(matchesSearchQuery('deep silver vein', 'sil*')).toBe(true);
  expect(matchesSearchQuery('deep vein', 'sil*')).toBe(false);
});

test('createSearchQueryMatcher matches like matchesSearchQuery', () => {
  const matcher = createSearchQueryMatcher('silver wolf');
  expect(matcher).not.toBeNull();
  expect(matcher!('silver wolf mountain')).toBe(true);
  expect(matcher!('silver mountain')).toBe(false);
});
