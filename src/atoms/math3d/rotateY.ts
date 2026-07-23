import type { Vec3 } from './types.js';

/** Rotate a point around the Y axis through `origin`. */
export function rotateY(point: Vec3, angle: number, origin: Vec3 = { x: 0, y: 0, z: 0 }): Vec3 {
  const x = point.x - origin.x;
  const z = point.z - origin.z;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: origin.x + x * cos + z * sin,
    y: point.y,
    z: origin.z + -x * sin + z * cos,
  };
}
