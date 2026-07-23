import type { IngredientId } from './ingredients.js';

export type GearKind =
  | 'pickaxe'
  | 'shovel'
  | 'axe'
  | 'sword'
  | 'hoe'
  | 'bow'
  | 'crossbow'
  | 'helmet'
  | 'chestplate'
  | 'leggings'
  | 'boots';

export interface GearLayoutDef {
  id: GearKind;
  label: string;
  pattern: string[];
  keys: Record<string, IngredientId>;
}

/** Mirrors plugin GearRecipeLayout — layout is identical for every alloy. */
export const GEAR_LAYOUTS: GearLayoutDef[] = [
  { id: 'pickaxe', label: 'Pickaxe', pattern: ['III', ' S ', ' S '], keys: { I: 'alloy_ingot', S: 'stick' } },
  { id: 'shovel', label: 'Shovel', pattern: [' I ', ' S ', ' S '], keys: { I: 'alloy_ingot', S: 'stick' } },
  { id: 'axe', label: 'Axe', pattern: ['II ', 'IS ', ' S '], keys: { I: 'alloy_ingot', S: 'stick' } },
  { id: 'sword', label: 'Sword', pattern: [' I ', ' I ', ' S '], keys: { I: 'alloy_ingot', S: 'stick' } },
  { id: 'hoe', label: 'Hoe', pattern: ['II ', ' S ', ' S '], keys: { I: 'alloy_ingot', S: 'stick' } },
  { id: 'bow', label: 'Bow', pattern: [' #S', '#I#', ' #S'], keys: { I: 'alloy_ingot', S: 'stick', '#': 'string' } },
  { id: 'crossbow', label: 'Crossbow', pattern: ['#I#', 'ISI', ' #S'], keys: { I: 'alloy_ingot', S: 'stick', '#': 'string' } },
  { id: 'helmet', label: 'Helmet', pattern: ['III', 'I I'], keys: { I: 'alloy_ingot' } },
  { id: 'chestplate', label: 'Chestplate', pattern: ['I I', 'III', 'III'], keys: { I: 'alloy_ingot' } },
  { id: 'leggings', label: 'Leggings', pattern: ['III', 'I I', 'I I'], keys: { I: 'alloy_ingot' } },
  { id: 'boots', label: 'Boots', pattern: ['I I', 'I I'], keys: { I: 'alloy_ingot' } },
];

export const GEAR_LAYOUT_BY_ID = Object.fromEntries(
  GEAR_LAYOUTS.map((layout) => [layout.id, layout]),
) as Record<GearKind, GearLayoutDef>;
