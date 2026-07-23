import { foldLocaleSearchText } from '../../atoms/foldLocaleSearchText.js';

/**
 * Human-friendly search query parsing (AND / OR / quoted phrases / `prefix*` wildcards).
 * Behavior aligned with Mappy `searchQueryParser.ts` / `@strixun/search-query-parser`.
 */

export interface SearchQueryResult {
  exactPhrases: string[];
  orGroups: string[][];
  hasContent: boolean;
}

export function parseSearchQuery(query: string): SearchQueryResult {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      exactPhrases: [],
      orGroups: [],
      hasContent: false,
    };
  }

  const exactPhrases: string[] = [];
  let processedQuery = trimmed.replace(/"([^"]+)"/g, (_match, phrase: string) => {
    exactPhrases.push(phrase.toLowerCase());
    return '';
  });

  processedQuery = processedQuery.trim();

  const orGroups: string[][] = [];

  if (processedQuery) {
    const groups = processedQuery
      .split('|')
      .map((group) => group.trim())
      .filter((group) => group);

    for (const group of groups) {
      const andTerms = group.split(/\s+/).filter((term) => term);
      if (andTerms.length > 0) {
        orGroups.push(andTerms);
      }
    }
  }

  return {
    exactPhrases,
    orGroups,
    hasContent: exactPhrases.length > 0 || orGroups.length > 0,
  };
}

function matchesFoldedSearchText(searchText: string, parsed: SearchQueryResult): boolean {
  for (const phrase of parsed.exactPhrases) {
    if (!searchText.includes(foldLocaleSearchText(phrase))) {
      return false;
    }
  }

  if (parsed.orGroups.length === 0) {
    return parsed.exactPhrases.length > 0;
  }

  return parsed.orGroups.some((orGroup) =>
    orGroup.every((term) => {
      if (term.endsWith('*')) {
        const prefix = foldLocaleSearchText(term.slice(0, -1));
        return prefix.length > 0 && searchText.includes(prefix);
      }
      return searchText.includes(foldLocaleSearchText(term));
    }),
  );
}

/** Parse once, match many — for recipe explorer chip filters. */
export function createSearchQueryMatcher(query: string): ((text: string) => boolean) | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const parsed = parseSearchQuery(trimmed);
  if (!parsed.hasContent) return null;
  return (text: string) => matchesFoldedSearchText(foldLocaleSearchText(text), parsed);
}

export function matchesSearchQuery(text: string, query: string): boolean {
  const matcher = createSearchQueryMatcher(query);
  if (!matcher) return false;
  return matcher(text);
}

export function queryLooksAdvanced(query: string): boolean {
  const trimmed = query.trim();
  return /["|*]/.test(trimmed) || /\S+\s+\S+/.test(trimmed);
}
