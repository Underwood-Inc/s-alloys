import {
  ALLOY_PLAYER_META,
  fragmentTabLore,
  gearResultLore,
  ingotResultLore,
  tierLoreLine,
  vanillaIngredientLore,
} from '../recipe-catalog/alloyPlayerLore.js';
import { FRAGMENT_DROP_META } from '../recipe-catalog/fragmentDropCatalog.js';
import { ingredient, type IngredientId } from '../recipe-catalog/ingredients.js';
import { ingredientSourceLabel } from '../recipe-catalog/ingredientAcquisitionCatalog.js';
import type { GearKind } from '../recipe-catalog/gearLayouts.js';
import type { GameTooltipData, TooltipLine, TooltipOreSource, TooltipRarity } from './types.js';

function rarityForAlloy(alloyId: string): TooltipRarity {
  const band = ALLOY_PLAYER_META[alloyId]?.tierBand;
  if (!band) return 'common';
  return band as TooltipRarity;
}

function loreStringsToLines(lore: string[]): TooltipLine[] {
  const lines: TooltipLine[] = [];

  for (const [index, text] of lore.entries()) {
    if (index === 0 && text.startsWith('Tier:')) {
      lines.push({ kind: 'tier', text });
      continue;
    }
    if (text.startsWith('Intrinsic:')) {
      const enchantText = text.replace(/^Intrinsic:\s*/, '');
      for (const part of enchantText.split(/,\s*/)) {
        if (part) lines.push({ kind: 'enchant', text: part });
      }
      continue;
    }
    if (text.startsWith('While ')) {
      lines.push({ kind: 'passive', text });
      continue;
    }
    if (text.startsWith('Passives:')) {
      const passiveText = text.replace(/^Passives:\s*/, '');
      for (const part of passiveText.split(/\s*·\s*/)) {
        if (part && part !== '…') lines.push({ kind: 'passive', text: part });
      }
      continue;
    }
    if (
      text.startsWith('Drop rate:')
      || text.startsWith('Obtain:')
      || text.startsWith('Found in:')
      || text.startsWith('Best Y:')
      || text.startsWith('Spawns:')
      || text.startsWith('Enchantability:')
      || text.includes('Dur ')
      || text.includes('Armor ')
      || text.includes('Mining')
    ) {
      for (const part of text.split(/\s*·\s*/)) {
        if (part) lines.push({ kind: 'stat', text: part });
      }
      continue;
    }
    lines.push({ kind: 'body', text });
  }

  return lines;
}

export function buildIngotTooltip(alloyId: string, alloyName: string, icon: string): GameTooltipData {
  return {
    title: `${alloyName} Ingot`,
    icon,
    rarity: rarityForAlloy(alloyId),
    modelId: `ingot:${alloyId}`,
    lines: loreStringsToLines(ingotResultLore(alloyId)),
  };
}

function fragmentOreSources(alloyId: string, baseUrl: string): TooltipOreSource[] | undefined {
  const drop = FRAGMENT_DROP_META[alloyId];
  if (!drop) return undefined;

  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return drop.oreIngredients.map((id) => {
    const base = ingredient(id, root);
    const guide = ingredientSourceLabel(id);
    return {
      ingredientId: id,
      label: guide ?? base.label,
      icon: base.icon,
    };
  });
}

export function buildFragmentTooltip(
  alloyId: string,
  alloyName: string,
  icon: string,
  obtain = '',
  baseUrl = '/',
): GameTooltipData {
  return {
    title: `${alloyName} Fragment`,
    icon,
    rarity: rarityForAlloy(alloyId),
    modelId: `fragment:${alloyId}`,
    lines: loreStringsToLines(fragmentTabLore(alloyId, alloyName, obtain)),
    oreSources: fragmentOreSources(alloyId, baseUrl),
  };
}

export function buildGearTooltip(
  alloyId: string,
  alloyName: string,
  gear: GearKind,
  gearLabel: string,
  icon: string,
): GameTooltipData {
  const title = `${alloyName} ${gearLabel}`;
  return {
    title,
    icon,
    rarity: rarityForAlloy(alloyId),
    modelId: `gear:${alloyId}:${gear}`,
    lines: loreStringsToLines(gearResultLore(alloyId, gear)),
  };
}

export function buildVanillaIngredientTooltip(
  ingredientId: IngredientId,
  label: string,
  icon: string,
): GameTooltipData {
  return {
    title: label,
    icon,
    rarity: 'ingredient',
    modelId: `ingredient:${ingredientId}`,
    lines: loreStringsToLines(vanillaIngredientLore(ingredientId)),
  };
}

export function buildTooltipFromLore(
  title: string,
  icon: string,
  rarity: TooltipRarity,
  lore: string[],
  modelId?: string,
): GameTooltipData {
  return { title, icon, rarity, modelId, lines: loreStringsToLines(lore) };
}

export function alloyIdFromIngredientId(ingredientId: string): string | undefined {
  const match = ingredientId.match(/^(?:alloy_ingot|alloy_fragment|gear):([^:]+)/);
  return match?.[1];
}

export function tierLineForAlloy(alloyId: string): string {
  return tierLoreLine(alloyId);
}
