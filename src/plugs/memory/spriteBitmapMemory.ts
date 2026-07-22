import type { SpriteBitmap } from '../../molecules/sprite-extrusion/types.js';

export interface RectRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type RgbaTuple = [number, number, number, number];

export function createFilledRectSprite(
  width: number,
  height: number,
  rect: RectRegion,
  color: RgbaTuple,
): SpriteBitmap {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (y * width + x) * 4;
      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
      data[index + 3] = color[3];
    }
  }
  return { width, height, data };
}

export function countOpaquePixels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = 8,
): number {
  const { data } = ctx.getImageData(0, 0, width, height);
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > threshold) count += 1;
  }
  return count;
}
