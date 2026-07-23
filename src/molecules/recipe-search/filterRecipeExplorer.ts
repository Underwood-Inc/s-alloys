import {
  ALLOY_CATALOG,
  recipeTabLabel,
  recipeTabsForAlloy,
  type AlloyCatalogEntry,
  type RecipeTabId,
} from '../recipe-catalog/alloysRecipeCatalog.js';
import {
  normalizeRecipeSelection,
  type RecipeSelection,
} from '../recipe-selection/recipeSelection.js';
import { createSearchQueryMatcher } from '../search-query/searchQueryParser.js';
import { buildRecipeSearchDocument, craftIngredientMatchBonus } from './recipeSearchIndex.js';

export function alloySearchHaystack(alloy: AlloyCatalogEntry): string {
  const tabs = recipeTabsForAlloy(alloy);
  const tabDocs = tabs.map((tab) => buildRecipeSearchDocument(alloy, tab));
  return [alloy.id, alloy.name, alloy.tagline, alloy.obtain, ...tabDocs].join(' ');
}

export function tabSearchHaystack(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  return buildRecipeSearchDocument(alloy, tab);
}

function pairLabel(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  return `${alloy.name} ${recipeTabLabel(tab)}`;
}

function scoreHaystack(
  haystack: string,
  label: string,
  matcher: (text: string) => boolean,
  rawQuery: string,
  tab?: RecipeTabId,
): number {
  if (!matcher(haystack)) return 0;

  let score = 4;
  const foldedLabel = label.toLowerCase();
  const qLower = rawQuery.toLowerCase();

  if (foldedLabel === qLower) score += 100;
  else if (foldedLabel.startsWith(qLower)) score += 40;
  else if (foldedLabel.includes(qLower)) score += 12;

  if (tab) {
    const tabLabel = recipeTabLabel(tab).toLowerCase();
    if (tab === qLower || tabLabel === qLower) score += 60;
    else if (tabLabel.startsWith(qLower) || tabLabel.includes(qLower)) score += 24;

    const asksIngot = qLower.includes('ingot');
    const asksFragment = qLower.includes('fragment');
    if (tab !== 'ingot' && tab !== 'fragment' && !asksIngot && !asksFragment) {
      score += 16;
    }
  }

  return score;
}

export interface RecipeExplorerSearchOutcome {
  selection: RecipeSelection;
  visibleAlloyIds: ReadonlySet<string>;
  visibleTabIds: ReadonlySet<RecipeTabId>;
  matchCount: number;
  hasQuery: boolean;
}

interface ScoredPair {
  alloyId: string;
  tab: RecipeTabId;
  score: number;
}

function allVisible(current: RecipeSelection): RecipeExplorerSearchOutcome {
  const selection = normalizeRecipeSelection(current) ?? normalizeRecipeSelection({ alloyId: ALLOY_CATALOG[0].id, tab: 'ingot' })!;
  const alloy = ALLOY_CATALOG.find((entry) => entry.id === selection.alloyId) ?? ALLOY_CATALOG[0];
  return {
    selection,
    visibleAlloyIds: new Set(ALLOY_CATALOG.map((entry) => entry.id)),
    visibleTabIds: new Set(recipeTabsForAlloy(alloy)),
    matchCount: 0,
    hasQuery: false,
  };
}

/** Filter alloy/tab chips and resolve the best selection for the current query. */
export function resolveRecipeExplorerSearch(
  query: string,
  current: RecipeSelection,
): RecipeExplorerSearchOutcome {
  const trimmed = query.trim();
  if (!trimmed) return allVisible(current);

  const matcher = createSearchQueryMatcher(trimmed);
  if (!matcher) return allVisible(current);

  const visibleAlloyIds = new Set<string>();
  const scoredPairs: ScoredPair[] = [];

  for (const alloy of ALLOY_CATALOG) {
    const alloyHay = alloySearchHaystack(alloy);
    const alloyScore = scoreHaystack(alloyHay, alloy.name, matcher, trimmed);
    if (alloyScore > 0) visibleAlloyIds.add(alloy.id);

    for (const tab of recipeTabsForAlloy(alloy)) {
      const tabHay = tabSearchHaystack(alloy, tab);
      const tabScore = scoreHaystack(tabHay, pairLabel(alloy, tab), matcher, trimmed, tab)
        + craftIngredientMatchBonus(alloy, tab, matcher);
      if (tabScore <= 0) continue;
      visibleAlloyIds.add(alloy.id);
      scoredPairs.push({
        alloyId: alloy.id,
        tab,
        score: tabScore + alloyScore,
      });
    }
  }

  scoredPairs.sort((left, right) => right.score - left.score);

  const normalizedCurrent = normalizeRecipeSelection(current);
  const currentAlloy = normalizedCurrent
    ? ALLOY_CATALOG.find((entry) => entry.id === normalizedCurrent.alloyId) ?? ALLOY_CATALOG[0]
    : ALLOY_CATALOG[0];
  const currentPairScore = normalizedCurrent
    ? scoreHaystack(
        tabSearchHaystack(currentAlloy, normalizedCurrent.tab),
        pairLabel(currentAlloy, normalizedCurrent.tab),
        matcher,
        trimmed,
        normalizedCurrent.tab,
      )
    : 0;

  let selection = normalizedCurrent ?? normalizeRecipeSelection({ alloyId: ALLOY_CATALOG[0].id, tab: 'ingot' })!;
  const bestPair = scoredPairs[0];
  if (bestPair && (!normalizedCurrent || bestPair.score > currentPairScore)) {
    selection = normalizeRecipeSelection(bestPair)!;
  } else if (normalizedCurrent) {
    const alloy = ALLOY_CATALOG.find((entry) => entry.id === normalizedCurrent.alloyId) ?? ALLOY_CATALOG[0];
    const tabHay = tabSearchHaystack(alloy, normalizedCurrent.tab);
    const tabScore = scoreHaystack(
      tabHay,
      pairLabel(alloy, normalizedCurrent.tab),
      matcher,
      trimmed,
      normalizedCurrent.tab,
    );
    if (tabScore <= 0) {
      const fallback = scoredPairs.find((pair) => pair.alloyId === alloy.id);
      if (fallback) selection = normalizeRecipeSelection(fallback)!;
      else if (bestPair) selection = normalizeRecipeSelection(bestPair)!;
    } else if (!visibleAlloyIds.has(normalizedCurrent.alloyId) && bestPair) {
      selection = normalizeRecipeSelection(bestPair)!;
    }
  }

  const activeAlloy = ALLOY_CATALOG.find((entry) => entry.id === selection.alloyId) ?? ALLOY_CATALOG[0];
  const visibleTabIds = new Set<RecipeTabId>();
  for (const tab of recipeTabsForAlloy(activeAlloy)) {
    const tabHay = tabSearchHaystack(activeAlloy, tab);
    if (scoreHaystack(tabHay, pairLabel(activeAlloy, tab), matcher, trimmed, tab) > 0) {
      visibleTabIds.add(tab);
    }
  }

  if (visibleTabIds.size > 0 && !visibleTabIds.has(selection.tab)) {
    const fallbackTab = [...visibleTabIds][0];
    selection = normalizeRecipeSelection({ alloyId: selection.alloyId, tab: fallbackTab })!;
  }

  return {
    selection,
    visibleAlloyIds,
    visibleTabIds,
    matchCount: scoredPairs.length,
    hasQuery: true,
  };
}
