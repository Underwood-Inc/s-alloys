import type { SpriteBitmap } from './types.js';
import { extrusionDepthPx } from './spriteExtrusionCatalog.js';
import type {
  BuildExtrusionOptions,
  ExtrusionFace,
  ExtrusionModel,
  Rgba,
} from './types.js';

const DEFAULT_ALPHA_THRESHOLD = 160;

function readRgba(sprite: SpriteBitmap, x: number, y: number): Rgba {
  const index = (y * sprite.width + x) * 4;
  return {
    r: sprite.data[index],
    g: sprite.data[index + 1],
    b: sprite.data[index + 2],
    a: sprite.data[index + 3],
  };
}

function isOpaque(sprite: SpriteBitmap, x: number, y: number, threshold: number): boolean {
  if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) return false;
  return readRgba(sprite, x, y).a > threshold;
}

function silhouetteWidth(sprite: SpriteBitmap, threshold: number): number {
  let minX = sprite.width;
  let maxX = -1;
  for (let y = 0; y < sprite.height; y += 1) {
    for (let x = 0; x < sprite.width; x += 1) {
      if (!isOpaque(sprite, x, y, threshold)) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }
  if (maxX < minX) return sprite.width;
  return maxX - minX + 1;
}

function localPoint(sprite: SpriteBitmap, x: number, y: number, z: number) {
  return {
    x: x - sprite.width / 2,
    y: y - sprite.height / 2,
    z,
  };
}

function opaqueSideColor(color: Rgba): Rgba {
  return { r: color.r, g: color.g, b: color.b, a: 255 };
}

function pushSideFace(
  faces: ExtrusionFace[],
  id: string,
  corners: [ReturnType<typeof localPoint>, ReturnType<typeof localPoint>, ReturnType<typeof localPoint>, ReturnType<typeof localPoint>],
  color: Rgba,
): void {
  faces.push({
    id,
    kind: 'side',
    corners,
    fill: { kind: 'color', color: opaqueSideColor(color) },
  });
}

export function buildExtrusionModel(sprite: SpriteBitmap, options: BuildExtrusionOptions): ExtrusionModel {
  const threshold = options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD;
  const width = silhouetteWidth(sprite, threshold);
  const depth = extrusionDepthPx(width, options.kind);
  const half = depth / 2;
  const frontZ = half;
  const backZ = -half;
  const faces: ExtrusionFace[] = [];

  for (let y = 0; y < sprite.height; y += 1) {
    for (let x = 0; x < sprite.width; x += 1) {
      if (!isOpaque(sprite, x, y, threshold)) continue;
      const color = readRgba(sprite, x, y);

      if (!isOpaque(sprite, x - 1, y, threshold)) {
        pushSideFace(faces, `side-left-${x}-${y}`, [
          localPoint(sprite, x, y, frontZ),
          localPoint(sprite, x, y + 1, frontZ),
          localPoint(sprite, x, y + 1, backZ),
          localPoint(sprite, x, y, backZ),
        ], color);
      }

      if (!isOpaque(sprite, x + 1, y, threshold)) {
        pushSideFace(faces, `side-right-${x}-${y}`, [
          localPoint(sprite, x + 1, y, frontZ),
          localPoint(sprite, x + 1, y + 1, frontZ),
          localPoint(sprite, x + 1, y + 1, backZ),
          localPoint(sprite, x + 1, y, backZ),
        ], color);
      }

      if (!isOpaque(sprite, x, y - 1, threshold)) {
        pushSideFace(faces, `side-top-${x}-${y}`, [
          localPoint(sprite, x, y, frontZ),
          localPoint(sprite, x + 1, y, frontZ),
          localPoint(sprite, x + 1, y, backZ),
          localPoint(sprite, x, y, backZ),
        ], color);
      }

      if (!isOpaque(sprite, x, y + 1, threshold)) {
        pushSideFace(faces, `side-bottom-${x}-${y}`, [
          localPoint(sprite, x, y + 1, frontZ),
          localPoint(sprite, x + 1, y + 1, frontZ),
          localPoint(sprite, x + 1, y + 1, backZ),
          localPoint(sprite, x, y + 1, backZ),
        ], color);
      }
    }
  }

  return {
    sprite,
    depth,
    center: { x: 0, y: 0, z: 0 },
    faces,
  };
}
