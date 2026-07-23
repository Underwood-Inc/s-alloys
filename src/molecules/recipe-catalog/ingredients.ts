import { assetUrl } from '../../lib/assetUrl.js';
import type { IngredientView } from '../crafting-model/index.js';

export type IngredientId =
  | 'alloy_ingot'
  | 'alloy_fragment'
  | 'stick'
  | 'string'
  | 'copper_ingot'
  | 'clay_ball'
  | 'brick'
  | 'iron_nugget'
  | 'coal'
  | 'iron_ingot'
  | 'lapis'
  | 'gold_nugget'
  | 'gold_ingot'
  | 'amethyst'
  | 'emerald'
  | 'redstone'
  | 'diamond'
  | 'echo_shard'
  | 'netherite_scrap';

const BASE: Record<IngredientId, Omit<IngredientView, 'icon'> & { iconFile: string }> = {
  alloy_ingot: { id: 'alloy_ingot', label: 'Alloy ingot', iconFile: 'alloy_ingot.png' },
  alloy_fragment: { id: 'alloy_fragment', label: 'Alloy fragment', iconFile: 'alloy_fragment.png' },
  stick: { id: 'stick', label: 'Stick', iconFile: 'stick.png' },
  string: { id: 'string', label: 'String', iconFile: 'string.png' },
  copper_ingot: { id: 'copper_ingot', label: 'Copper ingot', iconFile: 'copper_ingot.png' },
  clay_ball: { id: 'clay_ball', label: 'Clay ball', iconFile: 'clay_ball.png' },
  brick: { id: 'brick', label: 'Brick', iconFile: 'brick.png' },
  iron_nugget: { id: 'iron_nugget', label: 'Iron nugget', iconFile: 'iron_nugget.png' },
  coal: { id: 'coal', label: 'Coal', iconFile: 'coal.png' },
  iron_ingot: { id: 'iron_ingot', label: 'Iron ingot', iconFile: 'iron_ingot.png' },
  lapis: { id: 'lapis', label: 'Lapis lazuli', iconFile: 'lapis.png' },
  gold_nugget: { id: 'gold_nugget', label: 'Gold nugget', iconFile: 'gold_nugget.png' },
  gold_ingot: { id: 'gold_ingot', label: 'Gold ingot', iconFile: 'gold_ingot.png' },
  amethyst: { id: 'amethyst', label: 'Amethyst shard', iconFile: 'amethyst.png' },
  emerald: { id: 'emerald', label: 'Emerald', iconFile: 'emerald.png' },
  redstone: { id: 'redstone', label: 'Redstone', iconFile: 'redstone.png' },
  diamond: { id: 'diamond', label: 'Diamond', iconFile: 'diamond.png' },
  echo_shard: { id: 'echo_shard', label: 'Echo shard', iconFile: 'echo_shard.png' },
  netherite_scrap: { id: 'netherite_scrap', label: 'Netherite scrap', iconFile: 'netherite_scrap.png' },
};

export function ingredient(
  id: IngredientId,
  baseUrl: string,
  overrides: Partial<IngredientView> = {},
): IngredientView {
  const entry = BASE[id];
  return {
    id: entry.id,
    label: entry.label,
    icon: assetUrl(`guide/ingredients/${entry.iconFile}`, baseUrl),
    ...overrides,
  };
}

export function alloyIngotIngredient(
  alloyId: string,
  alloyName: string,
  baseUrl: string,
): IngredientView {
  return {
    id: `alloy_ingot:${alloyId}`,
    label: `${alloyName} ingot`,
    icon: assetUrl(`guide/ingots/${alloyId}.png`, baseUrl),
  };
}

export function alloyFragmentIngredient(
  alloyId: string,
  alloyName: string,
  baseUrl: string,
): IngredientView {
  return {
    id: `alloy_fragment:${alloyId}`,
    label: `${alloyName} fragment`,
    icon: assetUrl(`guide/fragments/${alloyId}.png`, baseUrl),
  };
}

export function gearResultIngredient(
  alloyId: string,
  alloyName: string,
  gearId: string,
  gearLabel: string,
  baseUrl: string,
): IngredientView {
  return {
    id: `gear:${alloyId}:${gearId}`,
    label: `${alloyName} ${gearLabel.toLowerCase()}`,
    icon: assetUrl(`guide/gear/${alloyId}_${gearId}.png`, baseUrl),
  };
}
