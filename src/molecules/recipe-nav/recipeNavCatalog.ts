import type { RecipeTabId } from '../recipe-catalog/alloysRecipeCatalog.js';
import { recipeTabLabel } from '../recipe-catalog/alloysRecipeCatalog.js';
import { assetUrl } from '../../lib/assetUrl.js';

export interface RecipeNavTile {
  id: RecipeTabId;
  label: string;
  icon: string;
}

/** Generic category art (steel/cobalt stand-ins) when no alloy is selected. */
export function recipeNavIcon(tab: RecipeTabId, baseUrl: string): string {
  if (tab === 'ingot') return assetUrl('guide/ingots/steel.png', baseUrl);
  if (tab === 'fragment') return assetUrl('guide/fragments/cobalt.png', baseUrl);
  return assetUrl(`guide/gear/steel_${tab}.png`, baseUrl);
}

/** Alloy-aware icon — updates with the active metal filter. */
export function recipeNavIconForAlloy(tab: RecipeTabId, alloyId: string, baseUrl: string): string {
  if (tab === 'ingot') return assetUrl(`guide/ingots/${alloyId}.png`, baseUrl);
  if (tab === 'fragment') return assetUrl(`guide/fragments/${alloyId}.png`, baseUrl);
  return assetUrl(`guide/gear/${alloyId}_${tab}.png`, baseUrl);
}

export function recipeNavTiles(tabs: RecipeTabId[], baseUrl: string, alloyId?: string): RecipeNavTile[] {
  return tabs.map((id) => ({
    id,
    label: recipeTabLabel(id),
    icon: alloyId ? recipeNavIconForAlloy(id, alloyId, baseUrl) : recipeNavIcon(id, baseUrl),
  }));
}
