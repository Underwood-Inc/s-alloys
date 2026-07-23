import type { IngredientId } from './ingredients.js';

export interface IngredientAcquisitionGuide {
  summary: string;
  /** Ore block name for fragment source chips. */
  sourceLabel?: string;
  obtain?: string;
  foundIn?: string;
  bestY?: string;
  spawnRange?: string;
  note?: string;
}

/**
 * Player-safe acquisition facts for crafting-grid ingredient tooltips.
 * Ore Y-levels match Minecraft 26.2 worldgen (same as 1.21).
 * @see https://www.minecraftmaps.com/tools/ore-distribution
 */
export const INGREDIENT_ACQUISITION_GUIDE: Partial<Record<IngredientId, IngredientAcquisitionGuide>> = {
  stick: {
    summary: 'Basic crafting rod from wood.',
    obtain: 'Two planks in a vertical column',
    foundIn: 'Crafting table',
  },
  string: {
    summary: 'Silk thread for bows and tools.',
    obtain: 'Kill spiders or break cobwebs',
    foundIn: 'Caves, mineshafts, strongholds',
    note: 'Cobwebs drop string without silk touch.',
  },
  copper_ingot: {
    summary: 'Orange metal smelted from copper ore.',
    sourceLabel: 'Copper ore',
    obtain: 'Smelt raw copper or copper ore',
    bestY: 'Y 48',
    spawnRange: 'Y -16–112',
    note: 'Extra veins in dripstone caves.',
  },
  clay_ball: {
    summary: 'Soft clay used in alloys and bricks.',
    obtain: 'Break clay blocks with a shovel',
    foundIn: 'Riverbeds, swamps, lush caves, mangrove swamps',
    bestY: 'Y 0–160',
    note: 'Four clay balls per block; silk touch keeps the block.',
  },
  brick: {
    summary: 'Fired clay block for sturdy crafts.',
    obtain: 'Smelt clay balls in a furnace',
    foundIn: 'Furnace fuel + clay balls',
  },
  iron_nugget: {
    summary: 'Small iron pieces from recycling or combat.',
    obtain: 'Smelt iron tools/armor, or kill iron golems/zombies',
    foundIn: 'Villages, bastion remnants, shipwrecks',
    note: 'Nine nuggets craft one iron ingot.',
  },
  coal: {
    summary: 'Fuel and crafting ingredient.',
    sourceLabel: 'Coal ore',
    obtain: 'Mine coal ore',
    bestY: 'Y 96',
    spawnRange: 'Y 0–320',
    note: 'Upper batches peak high; buried coal is deeper underground.',
  },
  iron_ingot: {
    summary: 'Workhorse metal from iron ore.',
    sourceLabel: 'Iron ore',
    obtain: 'Smelt raw iron or iron ore',
    bestY: 'Y 16',
    spawnRange: 'Y -64–320',
    note: 'Mountain strip mine ~Y 232 for a second peak.',
  },
  lapis: {
    summary: 'Blue dye and enchanting fuel.',
    sourceLabel: 'Lapis ore',
    obtain: 'Mine lapis ore',
    bestY: 'Y 0',
    spawnRange: 'Y -64–64',
    note: 'Buried batches away from open caves.',
  },
  gold_nugget: {
    summary: 'Tiny gold pieces for crafts and barter.',
    obtain: 'Smelt gold gear, mine nether gold, or piglin barter',
    foundIn: 'Nether, bastions, badlands',
    note: 'Nine nuggets craft one gold ingot.',
  },
  gold_ingot: {
    summary: 'Precious ingot from gold ore.',
    sourceLabel: 'Gold ore',
    obtain: 'Smelt raw gold or gold ore',
    bestY: 'Y -16',
    spawnRange: 'Y -64–32',
    note: 'Badlands add extra gold veins near the surface.',
  },
  amethyst: {
    summary: 'Crystal shard from underground geodes.',
    obtain: 'Break amethyst clusters inside geodes',
    foundIn: 'Amethyst geodes underground',
    bestY: 'Y -58–30',
    note: 'Mine the budding cluster blocks for regrowth.',
  },
  emerald: {
    summary: 'Mountain gem and villager currency.',
    sourceLabel: 'Emerald ore',
    obtain: 'Mine emerald ore or trade with villagers',
    bestY: 'Y 232',
    spawnRange: 'Y -16–320',
    foundIn: 'Mountains and windswept hills',
    note: 'Ore only generates in mountain biomes.',
  },
  redstone: {
    summary: 'Dust for redstone circuits.',
    sourceLabel: 'Redstone ore',
    obtain: 'Mine redstone ore',
    bestY: 'Y -59',
    spawnRange: 'Y -64–15',
    note: 'Deep branch mining near deepslate.',
  },
  diamond: {
    summary: 'Rare gem for top-tier gear.',
    sourceLabel: 'Diamond ore',
    obtain: 'Mine diamond ore',
    bestY: 'Y -59',
    spawnRange: 'Y -64–16',
    note: 'Branch mine; avoid air-exposed caves.',
  },
  echo_shard: {
    summary: 'Resonant shard from the Deep Dark.',
    obtain: 'Break sculk shriekers in ancient cities',
    foundIn: 'Ancient cities (Deep Dark)',
    bestY: 'Y -51',
    spawnRange: 'Y -64–-40',
    note: 'Watch for the Warden when looting cities.',
  },
  netherite_scrap: {
    summary: 'Nether salvage for netherite crafts.',
    sourceLabel: 'Ancient debris',
    obtain: 'Mine ancient debris in the Nether',
    bestY: 'Y 15',
    spawnRange: 'Nether Y 8–119',
    note: 'Buried in the Nether; blast mining works.',
  },
};

export function hasIngredientAcquisitionGuide(ingredientId: string): ingredientId is IngredientId {
  return ingredientId in INGREDIENT_ACQUISITION_GUIDE;
}

export function ingredientSourceLabel(ingredientId: string): string | undefined {
  if (!hasIngredientAcquisitionGuide(ingredientId)) return undefined;
  return INGREDIENT_ACQUISITION_GUIDE[ingredientId]?.sourceLabel;
}

export function ingredientAcquisitionLore(ingredientId: string): string[] {
  if (!hasIngredientAcquisitionGuide(ingredientId)) return [];

  const guide = INGREDIENT_ACQUISITION_GUIDE[ingredientId]!;
  const lines: string[] = [guide.summary];

  if (guide.obtain) lines.push(`Obtain: ${guide.obtain}`);
  if (guide.foundIn) lines.push(`Found in: ${guide.foundIn}`);
  if (guide.bestY) lines.push(`Best Y: ${guide.bestY}`);
  if (guide.spawnRange) lines.push(`Spawns: ${guide.spawnRange}`);
  if (guide.note) lines.push(guide.note);

  return lines;
}
