import { test, expect } from 'vitest';
import { ALLOY_CATALOG } from '../recipe-catalog/alloysRecipeCatalog.js';
import {
  normalizeRecipeSelection,
  recipeSelectionFromIcon,
  recipeSelectionFromIngredientId,
  recipeSelectionFromModelId,
  recipeSelectionFromPreview,
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

test('[FR-010] recipeSelectionFromModelId maps ingot fragment and gear ids', () => {
  expect(recipeSelectionFromModelId('ingot:steel')).toEqual({ alloyId: 'steel', tab: 'ingot' });
  expect(recipeSelectionFromModelId('fragment:cobalt')).toEqual({ alloyId: 'cobalt', tab: 'fragment' });
  expect(recipeSelectionFromModelId('gear:nickel:pickaxe')).toEqual({ alloyId: 'nickel', tab: 'pickaxe' });
});

test('[FR-010] recipeSelectionFromIcon parses public asset paths', () => {
  expect(recipeSelectionFromIcon('/base/guide/ingots/tin.png')).toEqual({ alloyId: 'tin', tab: 'ingot' });
  expect(recipeSelectionFromIcon('/base/guide/fragments/mythril.png')).toEqual({ alloyId: 'mythril', tab: 'fragment' });
  expect(recipeSelectionFromIcon('/base/guide/gear/adamantine_sword.png')).toEqual({
    alloyId: 'adamantine',
    tab: 'sword',
  });
});

test('[FR-010] normalizeRecipeSelection falls back when tab is unavailable', () => {
  expect(normalizeRecipeSelection({ alloyId: 'tin', tab: 'fragment' })).toEqual({ alloyId: 'tin', tab: 'ingot' });
  expect(normalizeRecipeSelection({ alloyId: 'cobalt', tab: 'fragment' })).toEqual({
    alloyId: 'cobalt',
    tab: 'fragment',
  });
});

test('[FR-010] recipeSelectionFromIngredientId handles crafting ingredient ids', () => {
  expect(recipeSelectionFromIngredientId('alloy_ingot:platinum')).toEqual({ alloyId: 'platinum', tab: 'ingot' });
  expect(recipeSelectionFromIngredientId('gear:astral:bow')).toEqual({ alloyId: 'astral', tab: 'bow' });
});

test('[FR-010] recipeSelectionFromPreview prefers explicit alloy override', () => {
  expect(recipeSelectionFromPreview({
    alloyId: 'nickel',
    tab: 'fragment',
    modelId: 'ingot:steel',
  })).toEqual({ alloyId: 'nickel', tab: 'fragment' });
});
