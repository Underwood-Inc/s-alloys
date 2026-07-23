import { test, expect } from 'vitest';
import { resolveRecipeExplorerSearch } from './filterRecipeExplorer.js';

test('empty query keeps the current selection and shows every chip', () => {
  const outcome = resolveRecipeExplorerSearch('', { alloyId: 'steel', tab: 'pickaxe' });
  expect(outcome.hasQuery).toBe(false);
  expect(outcome.selection).toEqual({ alloyId: 'steel', tab: 'pickaxe' });
  expect(outcome.visibleAlloyIds.size).toBe(10);
  expect(outcome.visibleTabIds.has('pickaxe')).toBe(true);
});

test('alloy name query filters metals and jumps to the best match', () => {
  const outcome = resolveRecipeExplorerSearch('astral', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.selection.alloyId).toBe('astral');
  expect(outcome.visibleAlloyIds.has('tin')).toBe(false);
  expect(outcome.visibleAlloyIds.has('astral')).toBe(true);
});

test('gear label query narrows visible tabs for the active alloy', () => {
  const outcome = resolveRecipeExplorerSearch('pickaxe', { alloyId: 'steel', tab: 'ingot' });
  expect(outcome.visibleTabIds.has('pickaxe')).toBe(true);
  expect(outcome.selection.tab).toBe('pickaxe');
});

test('combined alloy and gear terms resolve to a specific recipe pair', () => {
  const outcome = resolveRecipeExplorerSearch('mythril sword', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.selection).toEqual({ alloyId: 'mythril', tab: 'sword' });
});

test('ingredient text in obtain paths matches alloy tabs', () => {
  const outcome = resolveRecipeExplorerSearch('coal', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.visibleAlloyIds.has('cobalt')).toBe(true);
  expect(outcome.visibleTabIds.has('ingot')).toBe(true);
});

test('passive trait text matches gear recipes', () => {
  const outcome = resolveRecipeExplorerSearch('night vision', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.visibleAlloyIds.has('silver')).toBe(true);
  expect(outcome.visibleTabIds.has('helmet')).toBe(true);
});

test('intrinsic enchant text matches specific gear', () => {
  const outcome = resolveRecipeExplorerSearch('silver silk touch', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.selection.alloyId).toBe('silver');
  expect(outcome.selection.tab).toBe('pickaxe');
});

test('craft material text matches ingot recipes', () => {
  const outcome = resolveRecipeExplorerSearch('netherite scrap', { alloyId: 'tin', tab: 'ingot' });
  expect(outcome.selection.alloyId).toBe('astral');
  expect(outcome.selection.tab).toBe('ingot');
});
