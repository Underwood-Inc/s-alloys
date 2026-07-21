import { test, expect } from 'vitest';
import { ALLOY_CATALOG } from '../recipe-catalog/alloysRecipeCatalog.js';
import {
  selectionPreviewIcon,
  selectionSubtitle,
  selectionTitle,
  selectionTooltip,
} from './recipeSelection.js';

test('[FR-010] preview icon follows alloy and tab filters', () => {
  expect(selectionPreviewIcon({ alloyId: 'cobalt', tab: 'ingot' }, '/base/')).toBe(
    '/base/guide/ingots/cobalt.png',
  );
  expect(selectionPreviewIcon({ alloyId: 'cobalt', tab: 'fragment' }, '/base')).toBe(
    '/base/guide/fragments/cobalt.png',
  );
  expect(selectionPreviewIcon({ alloyId: 'nickel', tab: 'pickaxe' }, '/base/')).toBe(
    '/base/guide/gear/nickel_pickaxe.png',
  );
});

test('[FR-010] selection title and tooltip include fragment metadata', () => {
  const cobalt = ALLOY_CATALOG.find((alloy) => alloy.id === 'cobalt');
  expect(cobalt).toBeTruthy();
  if (!cobalt) return;

  expect(selectionTitle(cobalt, 'fragment')).toBe('Cobalt Fragments');
  expect(selectionSubtitle(cobalt, 'fragment')).toContain('Nine');

  const tooltip = selectionTooltip(cobalt, 'fragment', '/');
  expect(tooltip.title).toBe('Cobalt Fragment');
  expect(tooltip.lines.some((line) => line.text.includes('Rare bonus drop'))).toBe(true);
  expect(tooltip.lines.some((line) => line.text.includes('Enchantability'))).toBe(true);
});

test('[FR-010] ingot tooltip surfaces intrinsic and enchantability from canon', () => {
  const steel = ALLOY_CATALOG.find((alloy) => alloy.id === 'steel');
  expect(steel).toBeTruthy();
  if (!steel) return;

  const tooltip = selectionTooltip(steel, 'ingot', '/');
  expect(tooltip.lines.some((line) => line.kind === 'enchant' && line.text.includes('Unbreaking'))).toBe(true);
  expect(tooltip.lines.some((line) => line.kind === 'stat' && line.text.includes('Enchantability'))).toBe(true);
});
