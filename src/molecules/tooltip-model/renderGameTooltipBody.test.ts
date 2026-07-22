import { test, expect } from 'vitest';
import { renderGameTooltipBody, renderGameTooltipMeta } from './renderGameTooltipBody.js';

const sampleLines = [
  { kind: 'tier' as const, text: 'Tier: Uncommon · Step 3 · ≈iron' },
  { kind: 'body' as const, text: '2 iron ingots + coal + copper ingot' },
  { kind: 'stat' as const, text: 'Enchantability: 14' },
  { kind: 'passive' as const, text: 'boots: Swift step' },
];

test('[FR-008] renderGameTooltipMeta shows rarity tier and baseline once', () => {
  const html = renderGameTooltipMeta(sampleLines, 'uncommon');

  expect(html).toContain('game-tooltip__meta-chip--rarity');
  expect(html).toContain('Uncommon');
  expect(html).toContain('Tier 3');
  expect(html).not.toContain('Step 3');
  expect(html).toContain('≈iron');
  expect(html.match(/Uncommon/g)?.length).toBe(1);
});

test('[FR-008] renderGameTooltipBody emits structured sections without meta', () => {
  const html = renderGameTooltipBody(sampleLines);

  expect(html).not.toContain('game-tooltip__meta');
  expect(html).toContain('Recipe');
  expect(html).toContain('game-tooltip__stat-compact');
  expect(html).toContain('Enchantability');
  expect(html).toContain('game-tooltip__passive-gear');
  expect(html).toContain('Swift step');
});
