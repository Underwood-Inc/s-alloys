import type { AlloyCatalogEntry } from '../recipe-catalog/alloysRecipeCatalog.js';
import { recipeTabLabel, type RecipeTabId } from '../recipe-catalog/alloysRecipeCatalog.js';
import { buildFragmentTooltip, buildGearTooltip, buildIngotTooltip } from '../tooltip-model/buildGameTooltip.js';
import type { GameTooltipData } from '../tooltip-model/types.js';
import { GEAR_LAYOUT_BY_ID } from '../recipe-catalog/gearLayouts.js';

export interface RecipeSelection {
  alloyId: string;
  tab: RecipeTabId;
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function selectionPreviewIcon(selection: RecipeSelection, baseUrl: string): string {
  const root = normalizeBaseUrl(baseUrl);
  if (selection.tab === 'ingot') {
    return `${root}guide/ingots/${selection.alloyId}.png`;
  }
  if (selection.tab === 'fragment') {
    return `${root}guide/fragments/${selection.alloyId}.png`;
  }
  return `${root}guide/gear/${selection.alloyId}_${selection.tab}.png`;
}

export function selectionTitle(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  if (tab === 'ingot') return `${alloy.name} Ingot`;
  if (tab === 'fragment') return `${alloy.name} Fragments`;
  const gear = GEAR_LAYOUT_BY_ID[tab];
  return `${alloy.name} ${gear?.label ?? tab}`;
}

export function selectionSubtitle(alloy: AlloyCatalogEntry, tab: RecipeTabId): string {
  if (tab === 'ingot') return alloy.obtain;
  if (tab === 'fragment') {
    return alloy.hasFragment
      ? `Nine ${alloy.name.toLowerCase()} fragments combine into one ingot.`
      : `${alloy.name} has no fragment path.`;
  }
  return `${recipeTabLabel(tab)} recipe · ${alloy.name}`;
}

export function selectionTooltip(
  alloy: AlloyCatalogEntry,
  tab: RecipeTabId,
  baseUrl: string,
): GameTooltipData {
  const icon = selectionPreviewIcon({ alloyId: alloy.id, tab }, baseUrl);
  if (tab === 'ingot') return buildIngotTooltip(alloy.id, alloy.name, icon);
  if (tab === 'fragment') return buildFragmentTooltip(alloy.id, alloy.name, icon, alloy.obtain);
  const gear = GEAR_LAYOUT_BY_ID[tab];
  return buildGearTooltip(alloy.id, alloy.name, tab, gear?.label ?? tab, icon);
}
