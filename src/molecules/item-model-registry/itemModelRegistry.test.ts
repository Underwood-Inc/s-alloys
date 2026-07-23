import { test, expect, beforeEach } from 'vitest';
import {
  clearItemModels,
  getItemModel,
  registerItemModel,
  unregisterItemModel,
} from './itemModelRegistry.js';

beforeEach(() => {
  clearItemModels();
});

test('[FR-008] item model registry supports glTF entries with sprite fallback', () => {
  registerItemModel({
    id: 'ingot:nickel',
    kind: 'gltf',
    src: '/models/nickel.glb',
    sprite: '/guide/ingots/nickel.png',
  });

  const entry = getItemModel('ingot:nickel');
  expect(entry?.kind).toBe('gltf');
  expect(entry?.src).toContain('.glb');
  expect(entry?.sprite).toContain('nickel.png');
});

test('[FR-008] item models can be removed from the registry', () => {
  registerItemModel({ id: 'gear:tin:pickaxe', kind: 'sprite', sprite: '/gear.png' });
  expect(unregisterItemModel('gear:tin:pickaxe')).toBe(true);
  expect(getItemModel('gear:tin:pickaxe')).toBeUndefined();
});
