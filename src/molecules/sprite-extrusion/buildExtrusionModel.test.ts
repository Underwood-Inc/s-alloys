import { test, expect } from 'vitest';
import { depthRatioForKind } from './spriteExtrusionCatalog.js';
import { buildExtrusionModel } from './buildExtrusionModel.js';
import { createFilledRectSprite } from '../../plugs/memory/spriteBitmapMemory.js';

/**
 * @description A solid sprite produces connected perimeter side faces.
 * @priority critical
 */
test('[FR-009] buildExtrusionModel emits connected side faces', () => {
  const sprite = createFilledRectSprite(8, 8, { x: 2, y: 2, w: 4, h: 4 }, [200, 40, 40, 255]);
  const model = buildExtrusionModel(sprite, { kind: 'item' });

  expect(model.faces.filter((face) => face.kind === 'side').length).toBeGreaterThan(0);
  expect(model.depth).toBe(1);
});

/**
 * @description Side faces span the full depth with no Z gap between caps.
 * @priority critical
 */
test('[FR-009] buildExtrusionModel side faces connect front and back planes', () => {
  const sprite = createFilledRectSprite(6, 6, { x: 1, y: 1, w: 4, h: 4 }, [80, 160, 220, 255]);
  const model = buildExtrusionModel(sprite, { kind: 'item' });
  const half = model.depth / 2;

  for (const face of model.faces.filter((entry) => entry.kind === 'side')) {
    const zs = face.corners.map((corner) => corner.z);
    expect(Math.min(...zs)).toBeCloseTo(-half, 5);
    expect(Math.max(...zs)).toBeCloseTo(half, 5);
  }
});

/**
 * @description Item kind is thinner than block at identical sprite width.
 */
test('[FR-009] buildExtrusionModel item depth is thinner than block depth', () => {
  const sprite = createFilledRectSprite(10, 10, { x: 0, y: 0, w: 10, h: 10 }, [255, 255, 255, 255]);
  const item = buildExtrusionModel(sprite, { kind: 'item' });
  const block = buildExtrusionModel(sprite, { kind: 'block' });
  expect(item.depth).toBeLessThan(block.depth);
  expect(item.depth).toBe(Math.round(10 * depthRatioForKind('item')));
  expect(block.depth).toBe(10);
});
