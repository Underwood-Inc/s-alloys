import type { GearKind } from './gearLayouts.js';
import { GEAR_LAYOUTS } from './gearLayouts.js';
import { fragmentDropRateLine } from './fragmentDropCatalog.js';
import { ingredientAcquisitionLore } from './ingredientAcquisitionCatalog.js';
import { GENERATED_ALLOY_PLAYER_META, type GeneratedAlloyPlayerMeta } from './alloyPlayerLore.generated.js';

const GEAR_ORDER: GearKind[] = GEAR_LAYOUTS.map((layout) => layout.id);

export interface AlloyPlayerMeta {
  tier: number;
  tierBand: string;
  vanillaTier: string;
  craftNote: string;
  stats: GeneratedAlloyPlayerMeta['stats'];
  enchantability: number;
  passives: Partial<Record<GearKind, string[]>>;
  intrinsicByGear: Partial<Record<GearKind | 'default', string>>;
  defaultIntrinsic?: string;
  projectiles: Partial<Record<'bow' | 'crossbow', string>>;
}

const TIER_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/** Player-safe mirror of tools/alloys-source.json + gear traits (generated). */
export const ALLOY_PLAYER_META: Record<string, AlloyPlayerMeta> = GENERATED_ALLOY_PLAYER_META;

export function vanillaIngredientLore(ingredientId: string): string[] {
  const acquisition = ingredientAcquisitionLore(ingredientId);
  if (acquisition.length) return acquisition;
  return ['Crafting ingredient'];
}

export function tierLoreLine(alloyId: string): string {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return '';
  const band = TIER_LABELS[meta.tierBand] ?? meta.tierBand;
  return `Tier: ${band} · Tier ${meta.tier} · ≈${meta.vanillaTier}`;
}

export function ingotResultLore(alloyId: string): string[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return [];
  const lines = [tierLoreLine(alloyId), meta.craftNote];
  if (meta.enchantability > 0) lines.push(`Enchantability: ${meta.enchantability}`);
  return lines;
}

export interface IngotIntrinsicGroup {
  gears: GearKind[];
  text: string;
}

export interface IngotPassiveEntry {
  gear: GearKind;
  text: string;
}

/** Group identical intrinsic enchant sets across gear slots (ingot overview). */
export function ingotIntrinsicOverviewLines(alloyId: string): IngotIntrinsicGroup[] {
  const byText = new Map<string, GearKind[]>();

  for (const gear of GEAR_ORDER) {
    const text = gearIntrinsicLine(alloyId, gear);
    if (!text) continue;
    const gears = byText.get(text) ?? [];
    gears.push(gear);
    byText.set(text, gears);
  }

  return [...byText.entries()].map(([text, gears]) => ({
    gears: gears.sort((a, b) => GEAR_ORDER.indexOf(a) - GEAR_ORDER.indexOf(b)),
    text,
  }));
}

/** Every passive trait and signature projectile line, keyed by gear slot. */
export function ingotPassiveOverviewLines(alloyId: string): IngotPassiveEntry[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return [];

  const entries: IngotPassiveEntry[] = [];
  for (const gear of GEAR_ORDER) {
    for (const passive of meta.passives[gear] ?? []) {
      entries.push({
        gear,
        text: passive.replace(/^While (?:worn|held):\s*/i, ''),
      });
    }
    const projectile = gearProjectileLine(alloyId, gear);
    if (projectile) {
      entries.push({ gear, text: projectile });
    }
  }
  return entries;
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
  const dropRate = fragmentDropRateLine(alloyId);
  if (dropRate) lines.push(dropRate);
  lines.push(...fragmentIngredientLore(alloyName));
  if (meta?.enchantability) {
    lines.push(`Enchantability: ${meta.enchantability}`);
  }
  return lines;
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

export function gearIntrinsicLine(alloyId: string, gear: GearKind): string | undefined {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return undefined;
  return meta.intrinsicByGear[gear] ?? meta.intrinsicByGear.default ?? meta.defaultIntrinsic;
}

export function gearProjectileLine(alloyId: string, gear: GearKind): string | undefined {
  if (gear !== 'bow' && gear !== 'crossbow') return undefined;
  return ALLOY_PLAYER_META[alloyId]?.projectiles[gear];
}

export function gearResultLore(alloyId: string, gear: GearKind): string[] {
  const meta = ALLOY_PLAYER_META[alloyId];
  if (!meta) return [];
  const lines = [tierLoreLine(alloyId), gearStatLine(alloyId, gear)];
  const intrinsic = gearIntrinsicLine(alloyId, gear);
  if (intrinsic) lines.push(`Intrinsic: ${intrinsic}`);
  for (const passive of meta.passives[gear] ?? []) {
    lines.push(passive);
  }
  const projectile = gearProjectileLine(alloyId, gear);
  if (projectile) lines.push(projectile);
  if (meta.enchantability > 0) {
    lines.push(`Enchantability: ${meta.enchantability}`);
  }
  return lines;
}
