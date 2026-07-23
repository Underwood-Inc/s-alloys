import { test, expect } from 'vitest';
import {
  buildFragmentTooltip,
  buildGearTooltip,
  buildIngotTooltip,
  buildVanillaIngredientTooltip,
  tierLineForAlloy,
} from './buildGameTooltip.js';
import { rarityStyle } from './rarityCatalog.js';

/**
 * @description Canon alloy lore must drive Legendary-style tooltip lines.
 */
test('[FR-008] ingot tooltip includes tier and craft note from canon', () => {
  const tooltip = buildIngotTooltip('nickel', 'Nickel', '/icons/nickel.png');

  expect(tooltip.title).toBe('Nickel Ingot');
  expect(tooltip.rarity).toBe('rare');
  expect(tooltip.lines[0]).toEqual({
    kind: 'tier',
    text: tierLineForAlloy('nickel'),
  });
  expect(tooltip.lines[1]?.text).toContain('iron ingots');
});

/**
 * @description Gear tooltips surface stats and intrinsic enchant lines.
 */
test('[FR-008] gear tooltip surfaces stat and intrinsic enchant lines', () => {
  const tooltip = buildGearTooltip('nickel', 'Nickel', 'pickaxe', 'Pickaxe', '/gear.png');

  expect(tooltip.title).toBe('Nickel Pickaxe');
  expect(tooltip.lines.some((line) => line.kind === 'stat' && line.text.includes('Mining'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('Fortune'))).toBe(true);
});

test('[FR-008] silver bow tooltip includes spectral projectile line', () => {
  const tooltip = buildGearTooltip('silver', 'Silver', 'bow', 'Bow', '/bow.png');

  expect(tooltip.lines.some((line) => line.text === 'Arrows: Spectral')).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('Power'))).toBe(true);
});

test('[FR-008] nickel ingot tooltip lists per-slot intrinsics passives and projectiles', () => {
  const tooltip = buildIngotTooltip('nickel', 'Nickel', '/icons/nickel.png');

  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('pickaxe') && line.text.includes('Fortune'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('bow') && line.text.includes('Power'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'passive' && line.text.includes('leggings') && line.text.includes('Absorption'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'passive' && line.text.includes('bow') && line.text.includes('Poison'))).toBe(true);
});

test('[FR-008] steel ingot tooltip lists crossbow multishot and boot slow falling', () => {
  const tooltip = buildIngotTooltip('steel', 'Steel', '/icons/steel.png');

  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('crossbow') && line.text.includes('Multishot'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'passive' && line.text.includes('boots') && line.text.includes('Slow falling'))).toBe(true);
});

test('[FR-008] steel boots tooltip includes slow falling passive', () => {
  const tooltip = buildGearTooltip('steel', 'Steel', 'boots', 'Boots', '/boots.png');

  expect(tooltip.lines.some((line) => line.text.includes('Slow falling'))).toBe(true);
});

test('[FR-008] rare tier uses cyan title and border palette', () => {
  const style = rarityStyle('rare');
  expect(style.titleColor).toBe('#55ffff');
  expect(style.borderColor).toBe('#2f8faa');
});

test('[FR-008] fragment tooltip includes obtain path and combine instructions', () => {
  const tooltip = buildFragmentTooltip(
    'nickel',
    'Nickel',
    '/frag.png',
    'Rare bonus fragment while mining iron ore — or craft from iron, gold, and copper ingots.',
    '/',
  );

  expect(tooltip.title).toBe('Nickel Fragment');
  expect(tooltip.lines.some((line) => line.text.includes('Rare bonus drop'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Drop rate: 0.156%'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Nine Nickel fragments'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Enchantability'))).toBe(true);
  expect(tooltip.oreSources?.map((source) => source.ingredientId)).toEqual(['iron_ingot']);
});

test('[FR-008] vanilla ingredient tooltip includes ore mining Y-levels', () => {
  const tooltip = buildVanillaIngredientTooltip('diamond', 'Diamond', '/diamond.png');

  expect(tooltip.lines.some((line) => line.text.includes('Best Y: Y -59'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Spawns: Y -64–16'))).toBe(true);
});

test('[FR-008] clay ingredient tooltip includes acquisition fields', () => {
  const tooltip = buildVanillaIngredientTooltip('clay_ball', 'Clay ball', '/clay.png');

  expect(tooltip.lines.some((line) => line.text.startsWith('Obtain:'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.startsWith('Found in:'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.startsWith('Best Y:'))).toBe(true);
});
