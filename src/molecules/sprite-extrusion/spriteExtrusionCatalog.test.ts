import { test, expect } from 'vitest';
import {
  SPRITE_EXTRUSION_CATALOG,
  depthRatioForKind,
  extrusionDepthPx,
  isSpriteExtrusionKind,
  parseSpriteExtrusionKind,
} from './spriteExtrusionCatalog.js';

/**
 * @description Canon catalog must list every extrusion kind with a stable depth ratio.
 * @priority high
 */
test('[FR-009] sprite extrusion catalog lists item and block kinds with depth ratios', () => {
  const kinds = SPRITE_EXTRUSION_CATALOG.map((row) => row.kind);
  expect(kinds).toEqual(['item', 'block']);
  expect(depthRatioForKind('item')).toBe(0.15);
  expect(depthRatioForKind('block')).toBe(1);
});

/**
 * @description Item extrusions are thinner than block extrusions at the same sprite width.
 * @priority high
 */
test('[FR-009] extrusionDepthPx scales sprite width by catalog ratio', () => {
  expect(extrusionDepthPx(32, 'item')).toBe(5);
  expect(extrusionDepthPx(32, 'block')).toBe(32);
  expect(extrusionDepthPx(10, 'item')).toBe(2);
});

/**
 * @description Unknown kind strings fall back to item so hosts stay agnostic.
 */
test('[FR-009] parseSpriteExtrusionKind defaults to item', () => {
  expect(parseSpriteExtrusionKind('block')).toBe('block');
  expect(parseSpriteExtrusionKind('item')).toBe('item');
  expect(parseSpriteExtrusionKind(undefined)).toBe('item');
  expect(parseSpriteExtrusionKind('unknown')).toBe('item');
  expect(isSpriteExtrusionKind('block')).toBe(true);
  expect(isSpriteExtrusionKind('gear')).toBe(false);
});
