import { test, expect } from 'vitest';
import { recipeNavIcon, recipeNavIconForAlloy, recipeNavTiles } from './recipeNavCatalog.js';

test('[FR-010] recipe nav tiles expose image icons per category', () => {
  const tiles = recipeNavTiles(['ingot', 'pickaxe', 'sword'], '/s-alloys/');

  expect(tiles).toHaveLength(3);
  expect(tiles[0]?.icon).toBe('/s-alloys/guide/ingots/steel.png');
  expect(tiles[1]?.icon).toBe('/s-alloys/guide/gear/steel_pickaxe.png');
  expect(tiles[2]?.label).toBe('Sword');
});

test('[FR-010] recipeNavIcon normalizes base URL', () => {
  expect(recipeNavIcon('fragment', '/base')).toBe('/base/guide/fragments/cobalt.png');
});

test('[FR-010] recipeNavIconForAlloy uses active alloy sprites', () => {
  expect(recipeNavIconForAlloy('pickaxe', 'adamantine', '/s-alloys/')).toBe(
    '/s-alloys/guide/gear/adamantine_pickaxe.png',
  );
});
