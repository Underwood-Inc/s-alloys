import type { IngredientView } from '../crafting-model/types.js';
import {
  buildRecipeForTab,
  recipeTabLabel,
  type AlloyCatalogEntry,
  type RecipeTabId,
} from '../recipe-catalog/alloysRecipeCatalog.js';
import {
  selectionSubtitle,
  selectionTitle,
  selectionTooltip,
} from '../recipe-selection/recipeSelection.js';
import type { GameTooltipData } from '../tooltip-model/types.js';

const INDEX_BASE_URL = '/';

/** Flatten tooltip copy shown in the game-tooltip host. */
export function tooltipSearchableText(tooltip: GameTooltipData): string {
  return [
    tooltip.title,
    ...tooltip.lines.map((line) => line.text),
    ...(tooltip.oreSources?.map((source) => source.label) ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

function ingredientSearchText(item: IngredientView): string {
  const parts = [item.label, item.id];
  if (item.tooltip) parts.push(tooltipSearchableText(item.tooltip));
  if (item.lore?.length) parts.push(...item.lore);
  return parts.filter(Boolean).join(' ');
}

function recipeCraftSearchText(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  const recipe = buildRecipeForTab(alloy, tab, INDEX_BASE_URL);
  const parts = [recipe.title];

  if (recipe.kind === 'shapeless') {
    for (const item of recipe.ingredients) {
      parts.push(ingredientSearchText(item));
    }
  } else {
    for (const item of Object.values(recipe.keys)) {
      parts.push(ingredientSearchText(item));
    }
  }

  parts.push(ingredientSearchText(recipe.result));
  return parts.join(' ');
}

function recipeCraftItems(alloy: AlloyCatalogEntry, tab: RecipeTabId): IngredientView[] {
  const recipe = buildRecipeForTab(alloy, tab, INDEX_BASE_URL);
  if (recipe.kind === 'shapeless') return recipe.ingredients;
  return [...Object.values(recipe.keys), recipe.result];
}

/** Prefer the tab whose crafting grid directly contains a matching ingredient label. */
export function craftIngredientMatchBonus(
  alloy: AlloyCatalogEntry,
  tab: RecipeTabId,
  matcher: (text: string) => boolean,
): number {
  let bonus = 0;
  for (const item of recipeCraftItems(alloy, tab)) {
    if (matcher(item.label)) bonus = Math.max(bonus, 48);
    if (item.id && matcher(item.id.replaceAll('_', ' '))) bonus = Math.max(bonus, 40);
    if (item.tooltip && matcher(tooltipSearchableText(item.tooltip))) bonus = Math.max(bonus, 24);
  }
  return bonus;
}

const tabHaystackCache = new Map<string, string>();

/** All searchable copy for one alloy + tab (tooltip, craft grid, lore, materials). */
export function buildRecipeSearchDocument(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  const cacheKey = `${alloy.id}:${tab}`;
  const cached = tabHaystackCache.get(cacheKey);
  if (cached) return cached;

  const tooltip = selectionTooltip(alloy, tab, INDEX_BASE_URL);
  const document = [
    alloy.id,
    alloy.name,
    alloy.tagline,
    alloy.obtain,
    recipeTabLabel(tab),
    tab,
    selectionTitle(alloy, tab),
    selectionSubtitle(alloy, tab),
    tooltipSearchableText(tooltip),
    recipeCraftSearchText(alloy, tab),
  ]
    .filter(Boolean)
    .join(' ');

  tabHaystackCache.set(cacheKey, document);
  return document;
}
