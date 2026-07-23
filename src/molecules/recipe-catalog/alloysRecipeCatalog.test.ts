import { test, expect } from 'vitest';
import { buildRecipeForTab, recipeTabsForAlloy } from './alloysRecipeCatalog.js';

test('[FR-007] fragment alloys expose fragment tab', () => {
  const tabs = recipeTabsForAlloy({ id: 'cobalt', name: 'Cobalt', tagline: '', obtain: '', hasFragment: true });
  expect(tabs).toContain('fragment');
  expect(tabs).toContain('pickaxe');
});

test('[FR-007] buildRecipeForTab returns gear layout for pickaxe', () => {
  const recipe = buildRecipeForTab(
    { id: 'tin', name: 'Tin', tagline: '', obtain: '', hasFragment: false },
    'pickaxe',
    '/base/',
  );
  expect(recipe.kind).toBe('shaped');
  if (recipe.kind === 'shaped') {
    expect(recipe.pattern[0]).toBe('III');
    expect(recipe.result.label.toLowerCase()).toContain('pickaxe');
    expect(recipe.result.tooltip?.title).toBe('Tin Pickaxe');
    expect(recipe.result.tooltip?.lines.some((line) => line.kind === 'tier')).toBe(true);
  }
});
