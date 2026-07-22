import { test, expect } from 'vitest';
import { FRAGMENT_DROP_META, fragmentDropRateLine } from './fragmentDropCatalog.js';

test('[FR-008] fragmentDropRateLine matches guidebook rates', () => {
  expect(fragmentDropRateLine('cobalt')).toBe('Drop rate: 0.125% per ore block mined');
  expect(fragmentDropRateLine('nickel')).toBe('Drop rate: 0.156% per ore block mined');
  expect(fragmentDropRateLine('mythril')).toBe('Drop rate: 0.0625% per ore block mined');
  expect(fragmentDropRateLine('adamantine')).toBe('Drop rate: 0.031% per ore block mined');
});

test('[FR-008] fragment drop meta lists ore ingredient ids for child tooltips', () => {
  expect(FRAGMENT_DROP_META.cobalt.oreIngredients).toEqual(['coal', 'copper_ingot', 'lapis']);
  expect(FRAGMENT_DROP_META.adamantine.oreIngredients).toEqual(['diamond', 'netherite_scrap']);
});
