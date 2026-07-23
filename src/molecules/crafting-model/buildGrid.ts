import type { CraftingGridCell, CraftingRecipeView, IngredientView } from './types.js';

const GRID_SIZE = 9;

export function expandShapedPattern(
  pattern: string[],
  keys: Record<string, IngredientView>,
): CraftingGridCell[] {
  const rows = pattern.map((row) => row.padEnd(3, ' ').slice(0, 3));
  while (rows.length < 3) rows.push('   ');

  const cells: CraftingGridCell[] = [];
  for (const row of rows) {
    for (const symbol of row) {
      if (symbol === ' ') {
        cells.push({ ingredient: null });
        continue;
      }
      cells.push({ ingredient: keys[symbol] ?? null });
    }
  }

  return cells.slice(0, GRID_SIZE);
}

export function packShapelessIngredients(ingredients: IngredientView[]): CraftingGridCell[] {
  const cells: CraftingGridCell[] = ingredients.map((ingredient) => ({ ingredient }));
  while (cells.length < GRID_SIZE) cells.push({ ingredient: null });
  return cells.slice(0, GRID_SIZE);
}

export function recipeToGrid(recipe: CraftingRecipeView): CraftingGridCell[] {
  if (recipe.kind === 'shaped') {
    return expandShapedPattern(recipe.pattern, recipe.keys);
  }
  return packShapelessIngredients(recipe.ingredients);
}
