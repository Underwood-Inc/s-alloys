import { test, expect } from 'vitest';
import { layoutTooltipLines, parseStatToken, parseTierLine } from './layoutTooltipLines.js';

test('[FR-008] parseTierLine extracts tier step and baseline', () => {
  expect(parseTierLine('Tier: Uncommon · Tier 3 · ≈iron')).toEqual({
    tier: 'Uncommon',
    step: '3',
    baseline: 'iron',
  });
});

test('[FR-008] parseStatToken splits gear stat tokens', () => {
  expect(parseStatToken('Armor 1.0')).toEqual({ key: 'Armor', value: '1.0' });
  expect(parseStatToken('Enchantability: 13')).toEqual({ key: 'Enchantability', value: '13' });
  expect(parseStatToken('4 ingot(s)')).toEqual({ key: 'Cost', value: '4 ingots' });
});

test('[FR-008] layoutTooltipLines groups lore into sections', () => {
  const layout = layoutTooltipLines([
    { kind: 'tier', text: 'Tier: Common · Tier 1 · ≈copper' },
    { kind: 'body', text: '3 copper ingots + clay' },
    { kind: 'stat', text: 'Armor 1.0 · Tough 0.0 · Dur 216 · 4 ingot(s)' },
    { kind: 'stat', text: 'Enchantability: 13' },
    { kind: 'enchant', text: 'Fortune I' },
    { kind: 'passive', text: 'boots: Swift step' },
  ]);

  expect(layout.tier?.tier).toBe('Common');
  expect(layout.descriptions).toEqual(['3 copper ingots + clay']);
  expect(layout.stats.map((stat) => stat.key)).toContain('Armor');
  expect(layout.stats.map((stat) => stat.key)).toContain('Enchantability');
  expect(layout.enchants).toEqual(['Fortune I']);
  expect(layout.passives[0]).toEqual({ gear: 'boots', text: 'Swift step' });
});
