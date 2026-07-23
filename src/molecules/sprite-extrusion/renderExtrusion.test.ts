import { test, expect } from 'vitest';
import { buildExtrusionModel } from './buildExtrusionModel.js';
import { projectExtrusionFaces, quadArea } from './renderExtrusion.js';
import { createFilledRectSprite } from '../../plugs/memory/spriteBitmapMemory.js';

/**
 * @description Side faces project with visible area when rotated.
 * @priority critical
 */
test('[FR-009] projectExtrusionFaces exposes side area at ninety degree yaw', () => {
  const sprite = createFilledRectSprite(8, 8, { x: 1, y: 1, w: 6, h: 6 }, [220, 60, 60, 255]);
  const model = buildExtrusionModel(sprite, { kind: 'item' });
  const faces = projectExtrusionFaces(model, { yaw: Math.PI / 2, width: 64, height: 64 });
  const sideArea = faces.reduce((sum, face) => sum + quadArea(face.points), 0);

  expect(sideArea).toBeGreaterThan(0);
});

/**
 * @description Side faces still exist at forward yaw for edge pixels.
 */
test('[FR-009] projectExtrusionFaces keeps perimeter sides at yaw zero', () => {
  const sprite = createFilledRectSprite(8, 8, { x: 2, y: 2, w: 4, h: 4 }, [220, 60, 60, 255]);
  const model = buildExtrusionModel(sprite, { kind: 'item' });
  const faces = projectExtrusionFaces(model, { yaw: 0, width: 64, height: 64 });

  expect(faces.length).toBeGreaterThan(0);
});
