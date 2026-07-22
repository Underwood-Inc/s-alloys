import { test, expect } from 'vitest';
import { renderGameTooltipBody, renderGameTooltipMeta } from './renderGameTooltipBody.js';

const sampleLines = [
  { kind: 'tier' as const, text: 'Tier: Uncommon · Step 3 · ≈iron' },
  { kind: 'body' as const, text: '2 iron ingots + coal + copper ingot' },
  { kind: 'stat' as const, text: 'Enchantability: 14' },
  { kind: 'passive' as const, text: 'boots: Swift step' },
];

test('[FR-008] renderGameTooltipMeta splits tier and detail rows', () => {
  const html = renderGameTooltipMeta(sampleLines, 'uncommon');

  expect(html).toContain('game-tooltip__meta-row--detail');
  expect(html).toContain('Uncommon');
  expect(html).toContain('Tier 3');
  expect(html).not.toContain('Step 3');
  expect(html).toContain('Enchantability');
  expect(html).toContain('<strong class="game-tooltip__meta-chip-value">14</strong>');
  expect(html).not.toContain('≈iron');
});

test('[FR-008] renderGameTooltipBody omits enchantability from scroll body', () => {
  const html = renderGameTooltipBody(sampleLines);

  expect(html).not.toContain('game-tooltip__meta');
  expect(html).not.toContain('Enchantability');
  expect(html).toContain('Recipe');
  expect(html).toContain('Swift step');
});

test('[FR-008] renderGameTooltipBody groups acquisition stats', () => {
  const html = renderGameTooltipBody([
    { kind: 'body', text: 'Soft clay used in alloys and bricks.' },
    { kind: 'stat', text: 'Obtain: Break clay blocks with a shovel' },
    { kind: 'stat', text: 'Found in: Riverbeds, swamps, lush caves' },
    { kind: 'stat', text: 'Best Y: Y 0–160' },
  ]);

  expect(html).toContain('game-tooltip__section--acquisition');
  expect(html).toContain('How to get');
  expect(html).toContain('lush caves');
  expect(html).toContain('game-tooltip__section--mining');
});

test('[FR-008] renderGameTooltipBody renders fragment ore source chips', () => {
  const html = renderGameTooltipBody(
    [
      { kind: 'body', text: 'Rare bonus drop while mining.' },
      { kind: 'stat', text: 'Drop rate: 0.125% per ore block mined' },
    ],
    [{ ingredientId: 'coal', label: 'Coal ore', icon: '/coal.png' }],
  );

  expect(html).toContain('game-tooltip__section--drop');
  expect(html).toContain('0.125% per ore block mined');
  expect(html).toContain('game-tooltip__ore-chip');
  expect(html).toContain('Coal ore');
});
