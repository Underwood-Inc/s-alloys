import { test, expect } from 'vitest';
import {
  ingredientAcquisitionLore,
  ingredientSourceLabel,
  INGREDIENT_ACQUISITION_GUIDE,
} from './ingredientAcquisitionCatalog.js';

test('[FR-008] clay acquisition lore includes obtain and biome hints', () => {
  const lines = ingredientAcquisitionLore('clay_ball');

  expect(lines[0]).toContain('clay');
  expect(lines.some((line) => line.startsWith('Obtain:'))).toBe(true);
  expect(lines.some((line) => line.includes('lush caves'))).toBe(true);
  expect(lines.some((line) => line.startsWith('Best Y:'))).toBe(true);
});

test('[FR-008] acquisition guide covers every vanilla crafting ingredient', () => {
  const ids = [
    'stick', 'string', 'copper_ingot', 'clay_ball', 'brick', 'iron_nugget',
    'coal', 'iron_ingot', 'lapis', 'gold_nugget', 'gold_ingot', 'amethyst',
    'emerald', 'redstone', 'diamond', 'echo_shard', 'netherite_scrap',
  ] as const;

  for (const id of ids) {
    expect(INGREDIENT_ACQUISITION_GUIDE[id]?.summary).toBeTruthy();
    expect(ingredientAcquisitionLore(id).length).toBeGreaterThan(1);
  }
});

test('[FR-008] ore ingredients expose source labels for fragment chips', () => {
  expect(ingredientSourceLabel('coal')).toBe('Coal ore');
  expect(ingredientSourceLabel('clay_ball')).toBeUndefined();
});

test('[FR-008] diamond acquisition keeps 26.2 mining peaks', () => {
  expect(INGREDIENT_ACQUISITION_GUIDE.diamond?.bestY).toBe('Y -59');
  expect(INGREDIENT_ACQUISITION_GUIDE.diamond?.spawnRange).toBe('Y -64–16');
});
