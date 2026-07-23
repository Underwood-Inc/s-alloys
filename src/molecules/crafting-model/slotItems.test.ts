import { test, expect } from 'vitest';
import { buildRecipeForTab } from '../recipe-catalog/alloysRecipeCatalog.js';
import { resultSlotIndex, slotItemsForRecipe } from './slotItems.js';

/**
 * @description Result slot must stay at index 9 even when the grid has empty cells.
 */
test('[FR-009] slot index 9 maps to recipe result for shaped crafts', () => {
  const recipe = buildRecipeForTab(
    { id: 'tin', name: 'Tin', tagline: '', obtain: '', hasFragment: false },
    'hoe',
    '/base/',
  );
  const slots = slotItemsForRecipe(recipe);

  expect(slots).toHaveLength(10);
  expect(resultSlotIndex()).toBe(9);
  expect(slots[9]?.label.toLowerCase()).toContain('hoe');
  expect(slots.filter(Boolean).length).toBeGreaterThan(1);
});

/**
 * @description Ingredient slots keep their grid index — never compacted after filtering nulls.
 */
test('[FR-009] sparse shaped grid keeps null slots between ingredients', () => {
  const recipe = buildRecipeForTab(
    { id: 'tin', name: 'Tin', tagline: '', obtain: '', hasFragment: false },
    'pickaxe',
    '/base/',
  );
  const slots = slotItemsForRecipe(recipe);

  expect(slots[0]?.label).toContain('Tin');
  expect(slots[3]).toBeNull();
  expect(slots[4]?.label).toBe('Stick');
});
