import { assetUrl, stripAssetVersion } from '../../lib/assetUrl.js';
import {
  getAlloyById,
  recipeTabLabel,
  recipeTabsForAlloy,
  type AlloyCatalogEntry,
  type RecipeTabId,
} from '../recipe-catalog/alloysRecipeCatalog.js';
import { buildFragmentTooltip, buildGearTooltip, buildIngotTooltip } from '../tooltip-model/buildGameTooltip.js';
import type { GameTooltipData } from '../tooltip-model/types.js';
import { GEAR_LAYOUT_BY_ID } from '../recipe-catalog/gearLayouts.js';
import type { IngredientView } from '../crafting-model/types.js';

export interface RecipeSelection {
  alloyId: string;
  tab: RecipeTabId;
}

export function normalizeRecipeSelection(selection: RecipeSelection): RecipeSelection | null {
  const alloy = getAlloyById(selection.alloyId);
  if (!alloy) return null;

  const tabs = recipeTabsForAlloy(alloy);
  const tab = tabs.includes(selection.tab) ? selection.tab : tabs[0];
  return { alloyId: alloy.id, tab };
}

export function recipeSelectionFromModelId(modelId: string): RecipeSelection | null {
  if (modelId.startsWith('ingot:')) {
    return normalizeRecipeSelection({ alloyId: modelId.slice(6), tab: 'ingot' });
  }
  if (modelId.startsWith('fragment:')) {
    return normalizeRecipeSelection({ alloyId: modelId.slice(9), tab: 'fragment' });
  }
  const gear = modelId.match(/^gear:([^:]+):(.+)$/);
  if (gear) {
    return normalizeRecipeSelection({ alloyId: gear[1], tab: gear[2] as RecipeTabId });
  }
  return null;
}

export function recipeSelectionFromIcon(icon: string): RecipeSelection | null {
  const path = stripAssetVersion(icon);
  const ingot = path.match(/\/guide\/ingots\/([^./]+)\.png/i);
  if (ingot) return normalizeRecipeSelection({ alloyId: ingot[1], tab: 'ingot' });

  const fragment = path.match(/\/guide\/fragments\/([^./]+)\.png/i);
  if (fragment) return normalizeRecipeSelection({ alloyId: fragment[1], tab: 'fragment' });

  const gear = path.match(/\/guide\/gear\/([^_]+)_([^.]+)\.png/i);
  if (gear) return normalizeRecipeSelection({ alloyId: gear[1], tab: gear[2] as RecipeTabId });

  return null;
}

export function recipeSelectionFromIngredientId(id: string): RecipeSelection | null {
  const ingot = id.match(/^alloy_ingot:(.+)$/);
  if (ingot) return normalizeRecipeSelection({ alloyId: ingot[1], tab: 'ingot' });

  const fragment = id.match(/^alloy_fragment:(.+)$/);
  if (fragment) return normalizeRecipeSelection({ alloyId: fragment[1], tab: 'fragment' });

  const gear = id.match(/^gear:([^:]+):(.+)$/);
  if (gear) return normalizeRecipeSelection({ alloyId: gear[1], tab: gear[2] as RecipeTabId });

  return null;
}

export function recipeSelectionFromIngredient(item: IngredientView): RecipeSelection | null {
  if (item.tooltip?.modelId) {
    const fromModel = recipeSelectionFromModelId(item.tooltip.modelId);
    if (fromModel) return fromModel;
  }
  return recipeSelectionFromIngredientId(item.id) ?? recipeSelectionFromIcon(item.icon);
}

export function recipeSelectionFromPreview(input: {
  modelId?: string;
  icon?: string;
  alloyId?: string;
  tab?: RecipeTabId;
}): RecipeSelection | null {
  if (input.alloyId) {
    return normalizeRecipeSelection({
      alloyId: input.alloyId,
      tab: input.tab ?? 'ingot',
    });
  }
  if (input.modelId) {
    const fromModel = recipeSelectionFromModelId(input.modelId);
    if (fromModel) return fromModel;
  }
  if (input.icon) return recipeSelectionFromIcon(input.icon);
  return null;
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function selectionPreviewIcon(selection: RecipeSelection, baseUrl: string): string {
  if (selection.tab === 'ingot') {
    return assetUrl(`guide/ingots/${selection.alloyId}.png`, baseUrl);
  }
  if (selection.tab === 'fragment') {
    return assetUrl(`guide/fragments/${selection.alloyId}.png`, baseUrl);
  }
  return assetUrl(`guide/gear/${selection.alloyId}_${selection.tab}.png`, baseUrl);
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
  if (tab === 'fragment') return buildFragmentTooltip(alloy.id, alloy.name, icon, alloy.obtain, baseUrl);
  const gear = GEAR_LAYOUT_BY_ID[tab];
  return buildGearTooltip(alloy.id, alloy.name, tab, gear?.label ?? tab, icon);
}
