/** Agnostic crafting UI model — reusable across datapack marketing sites. */

import type { GameTooltipData } from '../tooltip-model/types.js';

export interface IngredientView {
  id: string;
  label: string;
  icon: string;
  lore?: string[];
  tooltip?: GameTooltipData;
}

export interface ShapedRecipeView {
  kind: 'shaped';
  title: string;
  pattern: string[];
  keys: Record<string, IngredientView>;
  result: IngredientView;
}

export interface ShapelessRecipeView {
  kind: 'shapeless';
  title: string;
  ingredients: IngredientView[];
  result: IngredientView;
}

export type CraftingRecipeView = ShapedRecipeView | ShapelessRecipeView;

export interface CraftingGridCell {
  ingredient: IngredientView | null;
}
