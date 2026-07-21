import type { CraftingRecipeView } from '../crafting-model/index.js';
import type { IngredientId } from './ingredients.js';
import {
  buildFragmentTooltip,
  buildGearTooltip,
  buildIngotTooltip,
  buildVanillaIngredientTooltip,
} from '../tooltip-model/buildGameTooltip.js';
import type { GameTooltipData } from '../tooltip-model/types.js';
import {
  alloyFragmentIngredient,
  alloyIngotIngredient,
  gearResultIngredient,
  ingredient,
} from './ingredients.js';
import { GEAR_LAYOUTS, type GearKind } from './gearLayouts.js';

export interface AlloyCatalogEntry {
  id: string;
  name: string;
  tagline: string;
  obtain: string;
  hasFragment: boolean;
}

export const ALLOY_CATALOG: AlloyCatalogEntry[] = [
  { id: 'tin', name: 'Tin', tagline: 'Early utility metal', obtain: 'Craft from copper ingots and clay.', hasFragment: false },
  { id: 'bronze', name: 'Bronze', tagline: 'Sturdy starter alloy', obtain: 'Craft from copper ingots and bricks.', hasFragment: false },
  { id: 'silver', name: 'Silver', tagline: 'Light and quick', obtain: 'Craft from iron ingots, coal, and a copper ingot.', hasFragment: false },
  { id: 'steel', name: 'Steel', tagline: 'Reliable mid-tier', obtain: 'Craft from iron ingots, coal, and brick.', hasFragment: false },
  { id: 'cobalt', name: 'Cobalt', tagline: 'Coal and copper veins', obtain: 'Rare bonus fragment while mining coal, copper, or lapis ore — or craft from iron, lapis, and coal.', hasFragment: true },
  { id: 'nickel', name: 'Nickel', tagline: 'Iron vein specialist', obtain: 'Rare bonus fragment while mining iron ore — or craft from iron, gold, and copper ingots.', hasFragment: true },
  { id: 'platinum', name: 'Platinum', tagline: 'Precious hybrid', obtain: 'Craft from gold and iron ingots plus amethyst shards.', hasFragment: false },
  { id: 'mythril', name: 'Mythril', tagline: 'Redstone and emerald depths', obtain: 'Rare bonus fragment while mining redstone or emerald ore — or craft from gold, emerald, and diamond.', hasFragment: true },
  { id: 'adamantine', name: 'Adamantine', tagline: 'Diamond-tier find', obtain: 'Very rare bonus fragment from diamond ore or ancient debris — or craft from iron, diamonds, and an echo shard.', hasFragment: true },
  { id: 'astral', name: 'Astral', tagline: 'Endgame crown', obtain: 'Shaped craft: eight diamonds around netherite scrap.', hasFragment: false },
];

type ShapelessDef = { kind: 'shapeless'; items: IngredientId[] };
type ShapedDef = { kind: 'shaped'; pattern: string[]; keys: Record<string, IngredientId> };

const INGOT_CRAFTS: Record<string, ShapelessDef | ShapedDef> = {
  tin: { kind: 'shapeless', items: ['copper_ingot', 'copper_ingot', 'copper_ingot', 'clay_ball'] },
  bronze: { kind: 'shapeless', items: ['copper_ingot', 'copper_ingot', 'copper_ingot', 'brick', 'brick'] },
  silver: { kind: 'shapeless', items: ['iron_ingot', 'iron_ingot', 'coal', 'copper_ingot'] },
  steel: { kind: 'shapeless', items: ['iron_ingot', 'iron_ingot', 'coal', 'coal', 'brick'] },
  cobalt: { kind: 'shapeless', items: ['iron_ingot', 'iron_ingot', 'lapis', 'lapis', 'coal'] },
  nickel: { kind: 'shapeless', items: ['iron_ingot', 'iron_ingot', 'gold_ingot', 'copper_ingot'] },
  platinum: { kind: 'shapeless', items: ['gold_ingot', 'gold_ingot', 'iron_ingot', 'amethyst', 'amethyst'] },
  mythril: { kind: 'shapeless', items: ['gold_ingot', 'gold_ingot', 'emerald', 'diamond'] },
  adamantine: { kind: 'shapeless', items: ['iron_ingot', 'iron_ingot', 'diamond', 'diamond', 'echo_shard'] },
  astral: {
    kind: 'shaped',
    pattern: ['DDD', 'DSD', 'DDD'],
    keys: { D: 'diamond', S: 'netherite_scrap' },
  },
};

export type RecipeTabId = 'ingot' | 'fragment' | GearKind;

export function recipeTabsForAlloy(alloy: AlloyCatalogEntry): RecipeTabId[] {
  const tabs: RecipeTabId[] = ['ingot'];
  if (alloy.hasFragment) tabs.push('fragment');
  return [...tabs, ...GEAR_LAYOUTS.map((layout) => layout.id)];
}

export function recipeTabLabel(tab: RecipeTabId): string {
  if (tab === 'ingot') return 'Ingot';
  if (tab === 'fragment') return 'Fragments';
  return GEAR_LAYOUTS.find((layout) => layout.id === tab)?.label ?? tab;
}

function withTooltip<T extends { lore?: string[]; tooltip?: GameTooltipData }>(
  item: T,
  tooltip: GameTooltipData,
): T {
  return {
    ...item,
    tooltip,
    lore: tooltip.lines.map((line) => line.text),
  };
}

function resolveKeys(
  keys: Record<string, IngredientId>,
  alloy: AlloyCatalogEntry,
  baseUrl: string,
): Record<string, ReturnType<typeof ingredient>> {
  const resolved: Record<string, ReturnType<typeof ingredient>> = {};
  for (const [symbol, id] of Object.entries(keys)) {
    if (id === 'alloy_ingot') {
      const base = alloyIngotIngredient(alloy.id, alloy.name, baseUrl);
      resolved[symbol] = withTooltip(base, buildIngotTooltip(alloy.id, alloy.name, base.icon));
    } else if (id === 'alloy_fragment') {
      const base = alloyFragmentIngredient(alloy.id, alloy.name, baseUrl);
      resolved[symbol] = withTooltip(base, buildFragmentTooltip(alloy.id, alloy.name, base.icon, alloy.obtain));
    } else {
      const base = ingredient(id, baseUrl);
      resolved[symbol] = withTooltip(base, buildVanillaIngredientTooltip(id, base.label, base.icon));
    }
  }
  return resolved;
}

export function buildRecipeForTab(
  alloy: AlloyCatalogEntry,
  tab: RecipeTabId,
  baseUrl: string,
): CraftingRecipeView {
  const ingotBase = alloyIngotIngredient(alloy.id, alloy.name, baseUrl);
  const resultIngot = withTooltip(ingotBase, buildIngotTooltip(alloy.id, alloy.name, ingotBase.icon));

  if (tab === 'ingot') {
    const def = INGOT_CRAFTS[alloy.id];
    if (def.kind === 'shaped') {
      return {
        kind: 'shaped',
        title: `${alloy.name} ingot`,
        pattern: def.pattern,
        keys: resolveKeys(def.keys, alloy, baseUrl),
        result: resultIngot,
      };
    }
    return {
      kind: 'shapeless',
      title: `${alloy.name} ingot`,
      ingredients: def.items.map((id) => {
        const base = ingredient(id, baseUrl);
        return withTooltip(base, buildVanillaIngredientTooltip(id, base.label, base.icon));
      }),
      result: resultIngot,
    };
  }

  if (tab === 'fragment') {
    const fragmentBase = alloyFragmentIngredient(alloy.id, alloy.name, baseUrl);
    const fragment = withTooltip(
      fragmentBase,
      buildFragmentTooltip(alloy.id, alloy.name, fragmentBase.icon, alloy.obtain),
    );
    return {
      kind: 'shaped',
      title: `${alloy.name} ingot from fragments`,
      pattern: ['FFF', 'FFF', 'FFF'],
      keys: { F: fragment },
      result: resultIngot,
    };
  }

  const layout = GEAR_LAYOUTS.find((entry) => entry.id === tab)!;
  const gearBase = gearResultIngredient(alloy.id, alloy.name, layout.id, layout.label, baseUrl);
  return {
    kind: 'shaped',
    title: `${alloy.name} ${layout.label.toLowerCase()}`,
    pattern: layout.pattern,
    keys: resolveKeys(layout.keys, alloy, baseUrl),
    result: withTooltip(
      gearBase,
      buildGearTooltip(alloy.id, alloy.name, layout.id, layout.label, gearBase.icon),
    ),
  };
}

export function getAlloyById(id: string): AlloyCatalogEntry | undefined {
  return ALLOY_CATALOG.find((alloy) => alloy.id === id);
}
