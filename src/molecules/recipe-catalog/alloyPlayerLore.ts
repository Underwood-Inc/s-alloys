import type { GearKind } from './gearLayouts.js';

export interface AlloyPlayerMeta {
  tier: number;
  tierBand: string;
  vanillaTier: string;
  craftNote: string;
  stats: {
    attackBonus: number;
    miningSpeedMult: number;
    durability: number;
    armor: number;
    toughness: number;
  };
  enchantability: number;
  passives: Partial<Record<GearKind, string[]>>;
  intrinsic?: Partial<Record<GearKind | 'default', string>>;
}

const TIER_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/** Player-safe mirror of tools/alloys-source.json + guidebook tooltip lines. */
export const ALLOY_PLAYER_META: Record<string, AlloyPlayerMeta> = {
  tin: {
    tier: 1, tierBand: 'common', vanillaTier: 'copper', craftNote: '3 copper ingots + clay',
    stats: { attackBonus: 0, miningSpeedMult: 1.05, durability: 180, armor: 1, toughness: 0 },
    enchantability: 13, passives: {},
  },
  bronze: {
    tier: 2, tierBand: 'common', vanillaTier: 'copper', craftNote: '3 copper ingots + 2 bricks',
    stats: { attackBonus: 0.5, miningSpeedMult: 1.08, durability: 220, armor: 2, toughness: 0 },
    enchantability: 13, passives: {}, intrinsic: { default: 'Unbreaking I' },
  },
  silver: {
    tier: 3, tierBand: 'uncommon', vanillaTier: 'iron', craftNote: '2 iron ingots + coal + copper ingot',
    stats: { attackBonus: 0.5, miningSpeedMult: 1.1, durability: 300, armor: 2.5, toughness: 0 },
    enchantability: 14,
    passives: { boots: ['While worn: Swift step'], helmet: ['While worn: Night vision'] },
    intrinsic: {
      pickaxe: 'Unbreaking I, Efficiency I', shovel: 'Unbreaking I, Efficiency I',
      sword: 'Unbreaking I, Smite I', bow: 'Unbreaking I, Power I', helmet: 'Unbreaking I',
    },
  },
  steel: {
    tier: 4, tierBand: 'uncommon', vanillaTier: 'iron', craftNote: '2 iron ingots + 2 coal + brick',
    stats: { attackBonus: 1, miningSpeedMult: 1.12, durability: 400, armor: 3, toughness: 0.5 },
    enchantability: 14, passives: { chestplate: ['While worn: Resistance'] },
    intrinsic: { default: 'Unbreaking II' },
  },
  cobalt: {
    tier: 5, tierBand: 'uncommon', vanillaTier: 'iron', craftNote: '2 iron ingots + 2 lapis + coal — or 9 fragments',
    stats: { attackBonus: 1, miningSpeedMult: 1.15, durability: 500, armor: 3.5, toughness: 1 },
    enchantability: 15, passives: { pickaxe: ['While held: Haste'] },
    intrinsic: {
      pickaxe: 'Unbreaking II, Efficiency I', sword: 'Unbreaking II', bow: 'Unbreaking II', helmet: 'Unbreaking II',
    },
  },
  nickel: {
    tier: 6, tierBand: 'rare', vanillaTier: 'iron', craftNote: '2 iron ingots + gold ingot + copper ingot — or 9 fragments',
    stats: { attackBonus: 1.5, miningSpeedMult: 1.18, durability: 600, armor: 4, toughness: 1 },
    enchantability: 16, passives: {},
    intrinsic: {
      pickaxe: 'Unbreaking II, Fortune I', sword: 'Unbreaking II, Sharpness I',
      bow: 'Unbreaking II, Power I', helmet: 'Unbreaking II, Thorns I',
    },
  },
  platinum: {
    tier: 7, tierBand: 'rare', vanillaTier: 'gold', craftNote: '2 gold ingots + iron ingot + 2 amethyst',
    stats: { attackBonus: 2, miningSpeedMult: 1.2, durability: 700, armor: 4.5, toughness: 1.5 },
    enchantability: 18, passives: { sword: ['While held: +1 Luck'] },
    intrinsic: {
      pickaxe: 'Unbreaking III, Fortune I', sword: 'Unbreaking III, Sharpness I',
      bow: 'Unbreaking III, Power II', helmet: 'Unbreaking III, Protection I',
    },
  },
  mythril: {
    tier: 8, tierBand: 'epic', vanillaTier: 'diamond', craftNote: '2 gold ingots + emerald + diamond — or 9 fragments',
    stats: { attackBonus: 2.5, miningSpeedMult: 1.25, durability: 900, armor: 5, toughness: 2 },
    enchantability: 20,
    passives: { sword: ['While held: Strength'], chestplate: ['While worn: Fire resistance'] },
    intrinsic: {
      pickaxe: 'Unbreaking III, Efficiency II', sword: 'Unbreaking III, Sharpness II',
      bow: 'Unbreaking III, Power II, Flame I', helmet: 'Unbreaking III, Protection II',
    },
  },
  adamantine: {
    tier: 9, tierBand: 'legendary', vanillaTier: 'diamond', craftNote: '2 iron ingots + 2 diamonds + echo shard — or 9 fragments',
    stats: { attackBonus: 3, miningSpeedMult: 1.3, durability: 1200, armor: 6, toughness: 3 },
    enchantability: 22,
    passives: { boots: ['While worn: Steadfast'], leggings: ['While worn: Resistance'] },
    intrinsic: {
      pickaxe: 'Unbreaking III, Efficiency III, Fortune II', sword: 'Unbreaking III, Sharpness III',
      bow: 'Unbreaking III, Power III', helmet: 'Unbreaking III, Protection II, Thorns I',
    },
  },
  astral: {
    tier: 10, tierBand: 'mythic', vanillaTier: 'netherite', craftNote: '8 diamonds around netherite scrap (shaped)',
    stats: { attackBonus: 4, miningSpeedMult: 1.35, durability: 1500, armor: 8, toughness: 4 },
    enchantability: 25,
    passives: { boots: ['While worn: Swift step'], helmet: ['While worn: Water breathing'], chestplate: ['While worn: Regeneration'] },
    intrinsic: {
      pickaxe: 'Unbreaking III, Efficiency IV, Fortune II', sword: 'Unbreaking III, Sharpness IV',
      bow: 'Unbreaking III, Power IV, Flame I', crossbow: 'Unbreaking III, Quick Charge II, Piercing II',
      helmet: 'Unbreaking III, Protection III',
    },
  },
};

const VANILLA_INGREDIENT_LORE: Record<string, string[]> = {
  stick: ['Crafting material'],
  string: ['Dropped by spiders'],
  copper_ingot: ['Smelted from copper ore'],
  clay_ball: ['Mined from clay blocks'],
  brick: ['Smelted from clay balls'],
  iron_nugget: ['Iron fragment'],
  coal: ['Fuel and crafting ingredient'],
  iron_ingot: ['Smelted from iron ore'],
  lapis: ['Mined from lapis ore'],
  gold_nugget: ['Gold fragment'],
  gold_ingot: ['Smelted from gold ore'],
  amethyst: ['Found in geodes'],
  emerald: ['Villager currency'],
  redstone: ['Mined from redstone ore'],
  diamond: ['Rare gem'],
  echo_shard: ['Found in ancient cities'],
  netherite_scrap: ['Salvaged from ancient debris'],
};

export function tierLoreLine(alloyId: string): string {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return '';
  const band = TIER_LABELS[meta.tierBand] ?? meta.tierBand;
  return `Tier: ${band} · Step ${meta.tier} · ≈${meta.vanillaTier}`;
}

export function ingotResultLore(alloyId: string): string[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return [];
  const lines = [tierLoreLine(alloyId), meta.craftNote];
  const intrinsic = meta.intrinsic?.default;
  if (intrinsic) lines.push(`Intrinsic: ${intrinsic}`);
  if (meta.enchantability > 0) lines.push(`Enchantability: ${meta.enchantability}`);
  const passiveSummary = summarizePassives(meta);
  if (passiveSummary) lines.push(passiveSummary);
  return lines;
}

export function fragmentIngredientLore(alloyName: string): string[] {
  return [
    `Nine ${alloyName} fragments combine into one ingot.`,
    'Place nine fragments in a crafting grid.',
  ];
}

export function fragmentTabLore(alloyId: string, alloyName: string, obtain: string): string[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  const lines: string[] = [];
  if (meta) lines.push(tierLoreLine(alloyId));
  const source = obtain.split('—')[0]?.trim() ?? obtain;
  lines.push(`Rare bonus drop while mining (${source}).`);
  lines.push(...fragmentIngredientLore(alloyName));
  if (meta?.enchantability) {
    lines.push(`Enchantability: ${meta.enchantability}`);
  }
  return lines;
}

function summarizePassives(meta: AlloyPlayerMeta): string | undefined {
  const entries = Object.entries(meta.passives).flatMap(([gear, lines]) =>
    (lines ?? []).map((line) => `${gear}: ${line.replace(/^While (worn|held): /i, '')}`),
  );
  if (entries.length === 0) return undefined;
  return `Passives: ${entries.slice(0, 3).join(' · ')}${entries.length > 3 ? ' · …' : ''}`;
}

export function vanillaIngredientLore(ingredientId: string): string[] {
  return VANILLA_INGREDIENT_LORE[ingredientId] ?? ['Crafting ingredient'];
}

function gearCategory(gear: GearKind): 'mining' | 'weapon' | 'bow' | 'armor' {
  if (gear === 'pickaxe' || gear === 'shovel') return 'mining';
  if (gear === 'sword' || gear === 'axe' || gear === 'hoe') return 'weapon';
  if (gear === 'bow' || gear === 'crossbow') return 'bow';
  return 'armor';
}

function gearStatLine(alloyId: string, gear: GearKind): string {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return '';
  const s = meta.stats;
  const ingots = gear === 'pickaxe' || gear === 'axe' || gear === 'sword' || gear === 'hoe' || gear === 'crossbow' ? 3
    : gear === 'shovel' ? 1
    : gear === 'bow' ? 3
    : gear === 'helmet' ? 5 : gear === 'chestplate' ? 8 : gear === 'leggings' ? 7 : 4;
  const dur = Math.max(1, Math.round(s.durability * ingots / 3 * (gear === 'bow' || gear === 'crossbow' ? 1.15 : gear.includes('plate') || gear === 'helmet' || gear === 'boots' ? 0.9 : 1)));

  if (gearCategory(gear) === 'mining') {
    return `Mining x${s.miningSpeedMult.toFixed(2)} · Dur ${dur} · ${ingots} ingot(s)`;
  }
  if (gearCategory(gear) === 'weapon') {
    const atk = s.attackBonus > 0 ? `+${s.attackBonus.toFixed(1)} bonus attack` : `≈${meta.vanillaTier} weapon baseline`;
    return `${atk} · Dur ${dur} · ${ingots} ingot(s)`;
  }
  if (gearCategory(gear) === 'bow') {
    return `Dur ${dur} · ${ingots} ingot(s)`;
  }
  return `Armor ${s.armor.toFixed(1)} · Tough ${s.toughness.toFixed(1)} · Dur ${dur} · ${ingots} ingot(s)`;
}

export function gearResultLore(alloyId: string, gear: GearKind): string[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return [];
  const lines = [tierLoreLine(alloyId), gearStatLine(alloyId, gear)];
  const intrinsic = meta.intrinsic?.[gear] ?? meta.intrinsic?.default;
  if (intrinsic) lines.push(`Intrinsic: ${intrinsic}`);
  for (const passive of meta.passives[gear] ?? []) {
    lines.push(passive);
  }
  if (meta.enchantability > 0) {
    lines.push(`Enchantability: ${meta.enchantability}`);
  }
  return lines;
}
