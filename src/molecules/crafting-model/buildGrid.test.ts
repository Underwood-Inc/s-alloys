import { test, expect } from 'vitest';
import { expandShapedPattern, recipeToGrid } from './buildGrid.js';
import type { IngredientView } from './types.js';

const ingot = (id: string): IngredientView => ({ id, label: id, icon: `${id}.png` });

test('[FR-007] expandShapedPattern pads short rows to 3x3', () => {
  const grid = expandShapedPattern(['III', ' S '], { I: ingot('alloy'), S: ingot('stick') });
  expect(grid).toHaveLength(9);
  expect(grid[0].ingredient?.id).toBe('alloy');
  expect(grid[4].ingredient?.id).toBe('stick');
  expect(grid[8].ingredient).toBeNull();
});

test('[FR-007] recipeToGrid handles shapeless recipes', () => {
  const grid = recipeToGrid({
    kind: 'shapeless',
    title: 'Tin',
    ingredients: [ingot('copper'), ingot('clay')],
    result: ingot('tin'),
  });
  expect(grid[0].ingredient?.id).toBe('copper');
  expect(grid[2].ingredient).toBeNull();
});
