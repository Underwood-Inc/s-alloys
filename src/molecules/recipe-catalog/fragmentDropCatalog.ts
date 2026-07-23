import type { IngredientId } from './ingredients.js';

export interface FragmentDropMeta {
  /** Player-facing rate per ore block (matches guidebook + loot tables). */
  dropRate: string;
  oreIngredients: IngredientId[];
}

/** Canon fragment bonus rolls — `data/minecraft/loot_table/blocks/*_ore.json`. */
export const FRAGMENT_DROP_META: Record<string, FragmentDropMeta> = {
  cobalt: {
    dropRate: '0.125%',
    oreIngredients: ['coal', 'copper_ingot', 'lapis'],
  },
  nickel: {
    dropRate: '0.156%',
    oreIngredients: ['iron_ingot'],
  },
  mythril: {
    dropRate: '0.0625%',
    oreIngredients: ['redstone', 'emerald'],
  },
  adamantine: {
    dropRate: '0.031%',
    oreIngredients: ['diamond', 'netherite_scrap'],
  },
};

export function fragmentDropRateLine(alloyId: string): string | undefined {
  const meta = FRAGMENT_DROP_META[alloyId];
  if (!meta) return undefined;
  return `Drop rate: ${meta.dropRate} per ore block mined`;
}
