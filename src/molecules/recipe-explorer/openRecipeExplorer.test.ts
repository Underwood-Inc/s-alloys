import { test, expect } from 'vitest';
import { recipeExplorerQueryFromSelection } from './openRecipeExplorer.js';

test('[FR-010] recipeExplorerQueryFromSelection encodes alloy and tab', () => {
  const params = recipeExplorerQueryFromSelection({ alloyId: 'cobalt', tab: 'pickaxe' });
  expect(params.get('alloy')).toBe('cobalt');
  expect(params.get('tab')).toBe('pickaxe');
});
