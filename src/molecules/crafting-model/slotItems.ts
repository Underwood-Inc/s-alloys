import type { CraftingRecipeView, IngredientView } from './types.js';
import { recipeToGrid } from './buildGrid.js';

/** Stable slot indices: 0–8 crafting grid, 9 result. Null slots stay indexed. */
export function slotItemsForRecipe(recipe: CraftingRecipeView): (IngredientView | null)[] {
  const cells = recipeToGrid(recipe);
  return [...cells.map((cell) => cell.ingredient), recipe.result];
}

export function resultSlotIndex(): number {
  return 9;
}
