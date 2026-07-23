import type { Vec2, Vec3 } from './types.js';

export function projectOrthographic(
  point: Vec3,
  scale: number,
  offset: Vec2,
): Vec2 {
  return {
    x: offset.x + point.x * scale,
    y: offset.y + point.y * scale,
  };
}
