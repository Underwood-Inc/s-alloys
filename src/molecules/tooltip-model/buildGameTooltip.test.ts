import { test, expect } from 'vitest';
import {
  buildFragmentTooltip,
  buildGearTooltip,
  buildIngotTooltip,
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
  );

  expect(tooltip.title).toBe('Nickel Fragment');
  expect(tooltip.lines.some((line) => line.text.includes('Rare bonus drop'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Nine Nickel fragments'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Enchantability'))).toBe(true);
});
