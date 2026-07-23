import { escapeHtml } from './dom/defineElement.js';
import { foldLocaleSearchText } from './foldLocaleSearchText.js';
import { parseSearchQuery } from '../molecules/search-query/searchQueryParser.js';

function collectHighlightTerms(query: string): string[] {
  const parsed = parseSearchQuery(query.trim());
  const terms: string[] = [...parsed.exactPhrases];

  for (const group of parsed.orGroups) {
    for (const term of group) {
      terms.push(term.endsWith('*') ? term.slice(0, -1) : term);
    }
  }

  return [...new Set(terms.map((term) => term.trim()).filter((term) => term.length > 0))];
}

function foldWithIndexMap(raw: string): { folded: string; map: number[] } {
  const map: number[] = [];
  let folded = '';

  for (let index = 0; index < raw.length; index += 1) {
    const piece = foldLocaleSearchText(raw[index] ?? '');
    for (const char of piece) {
      folded += char;
      map.push(index);
    }
  }

  return { folded, map };
}

function mergeRanges(ranges: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((left, right) => left.start - right.start);
  const merged: Array<{ start: number; end: number }> = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/** Escape HTML and wrap query term hits in `<mark class="search-hit">`. */
export function highlightSearchText(text: string, query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return escapeHtml(text);

  const terms = collectHighlightTerms(trimmed);
  if (!terms.length) return escapeHtml(text);

  const { folded, map } = foldWithIndexMap(text);
  const ranges: Array<{ start: number; end: number }> = [];

  for (const term of terms) {
    const foldedTerm = foldLocaleSearchText(term);
    if (!foldedTerm) continue;

    let from = 0;
    while (from < folded.length) {
      const index = folded.indexOf(foldedTerm, from);
      if (index === -1) break;

      const start = map[index] ?? 0;
      const end = (map[index + foldedTerm.length - 1] ?? start) + 1;
      ranges.push({ start, end });
      from = index + 1;
    }
  }

  if (!ranges.length) return escapeHtml(text);

  const merged = mergeRanges(ranges);
  let html = '';
  let cursor = 0;

  for (const { start, end } of merged) {
    html += escapeHtml(text.slice(cursor, start));
    html += `<mark class="search-hit">${escapeHtml(text.slice(start, end))}</mark>`;
    cursor = end;
  }

  html += escapeHtml(text.slice(cursor));
  return html;
}
