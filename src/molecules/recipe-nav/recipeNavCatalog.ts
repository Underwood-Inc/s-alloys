import type { RecipeTabId } from '../recipe-catalog/alloysRecipeCatalog.js';
import { recipeTabLabel } from '../recipe-catalog/alloysRecipeCatalog.js';

export interface RecipeNavTile {
  id: RecipeTabId;
  label: string;
  icon: string;
}

/** Generic category art (steel/cobalt stand-ins) when no alloy is selected. */
export function recipeNavIcon(tab: RecipeTabId, baseUrl: string): string {
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (tab === 'ingot') return `${root}guide/ingots/steel.png`;
  if (tab === 'fragment') return `${root}guide/fragments/cobalt.png`;
  return `${root}guide/gear/steel_${tab}.png`;
}

/** Alloy-aware icon — updates with the active metal filter. */
export function recipeNavIconForAlloy(tab: RecipeTabId, alloyId: string, baseUrl: string): string {
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (tab === 'ingot') return `${root}guide/ingots/${alloyId}.png`;
  if (tab === 'fragment') return `${root}guide/fragments/${alloyId}.png`;
  return `${root}guide/gear/${alloyId}_${tab}.png`;
}

export function recipeNavTiles(tabs: RecipeTabId[], baseUrl: string, alloyId?: string): RecipeNavTile[] {
  return tabs.map((id) => ({
    id,
    label: recipeTabLabel(id),
    icon: alloyId ? recipeNavIconForAlloy(id, alloyId, baseUrl) : recipeNavIcon(id, baseUrl),
  }));
}
