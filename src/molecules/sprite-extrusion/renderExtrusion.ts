import { projectOrthographic } from '../../atoms/math3d/projectOrthographic.js';
import { rotateY } from '../../atoms/math3d/rotateY.js';
import type { Vec2, Vec3 } from '../../atoms/math3d/types.js';
import type { ExtrusionFace, ExtrusionModel, RenderExtrusionOptions, SpriteBitmap } from './types.js';

export interface ProjectedFace {
  face: ExtrusionFace;
  depth: number;
  points: [Vec2, Vec2, Vec2, Vec2];
}

const projectedScratch: ProjectedFace[] = [];

function averageZ(corners: Vec3[]): number {
  return corners.reduce((sum, corner) => sum + corner.z, 0) / corners.length;
}

function layoutScale(model: ExtrusionModel, width: number, height: number, padding: number): number {
  const span = Math.max(model.depth, model.sprite.width, model.sprite.height);
  const usable = Math.min(width, height) - padding * 2;
  return usable / span;
}

function snap(value: number): number {
  return Math.round(value * 2) / 2;
}

function fillProjectedFaces(
  model: ExtrusionModel,
  options: RenderExtrusionOptions,
  out: ProjectedFace[],
): void {
  const padding = options.padding ?? 4;
  const scale = layoutScale(model, options.width, options.height, padding);
  const offset = { x: options.width / 2, y: options.height / 2 };
  out.length = 0;

  for (const face of model.faces) {
    const rotated = face.corners.map((corner) => rotateY(corner, options.yaw)) as [Vec3, Vec3, Vec3, Vec3];
    const points = rotated.map((corner) => ({
      x: snap(projectOrthographic(corner, scale, offset).x),
      y: snap(projectOrthographic(corner, scale, offset).y),
    })) as [Vec2, Vec2, Vec2, Vec2];
    out.push({ face, depth: averageZ(rotated), points });
  }
}

export function projectExtrusionFaces(
  model: ExtrusionModel,
  options: RenderExtrusionOptions,
): ProjectedFace[] {
  fillProjectedFaces(model, options, projectedScratch);
  return projectedScratch.map((entry) => ({
    face: entry.face,
    depth: entry.depth,
    points: [
      { x: entry.points[0].x, y: entry.points[0].y },
      { x: entry.points[1].x, y: entry.points[1].y },
      { x: entry.points[2].x, y: entry.points[2].y },
      { x: entry.points[3].x, y: entry.points[3].y },
    ] as [Vec2, Vec2, Vec2, Vec2],
  }));
}

export function quadArea(points: [Vec2, Vec2, Vec2, Vec2]): number {
  let area = 0;
  for (let i = 0; i < 4; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % 4];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area / 2);
}

let spriteSourceCache = new WeakMap<SpriteBitmap, HTMLCanvasElement>();

function spriteCanvas(sprite: SpriteBitmap): HTMLCanvasElement {
  const cached = spriteSourceCache.get(sprite);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const patch = canvas.getContext('2d');
  if (!patch) throw new Error('2d context unavailable');
  patch.putImageData(
    new ImageData(new Uint8ClampedArray(sprite.data), sprite.width, sprite.height),
    0,
    0,
  );
  spriteSourceCache.set(sprite, canvas);
  return canvas;
}

function rgbaCss(color: { r: number; g: number; b: number }): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function drawSolidQuad(ctx: CanvasRenderingContext2D, points: [Vec2, Vec2, Vec2, Vec2], color: string): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawBillboardCap(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteBitmap,
  model: ExtrusionModel,
  yaw: number,
  scale: number,
  centerX: number,
  centerY: number,
  facing: 'front' | 'back',
): void {
  const cos = Math.cos(yaw);
  if (facing === 'front' && cos <= 0.08) return;
  if (facing === 'back' && cos >= -0.08) return;

  const sin = Math.sin(yaw);
  const w = sprite.width * scale;
  const h = sprite.height * scale;
  const depthPx = model.depth * scale;
  const sign = facing === 'front' ? 1 : -1;
  const cosUse = facing === 'front' ? Math.max(cos, 0.08) : Math.min(cos, -0.08);
  const drawW = Math.abs(w * cosUse) + depthPx * Math.abs(sin) * 0.35;
  const shiftX = sin * depthPx * 0.5 * sign;
  const drawX = snap(centerX - drawW / 2 + shiftX);
  const drawY = snap(centerY - h / 2);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(drawX + drawW / 2, drawY + h / 2);
  ctx.scale(facing === 'front' ? 1 : -1, 1);
  ctx.drawImage(spriteCanvas(sprite), -drawW / 2, -h / 2, drawW, h);
  ctx.restore();
}

export function renderExtrusion(
  ctx: CanvasRenderingContext2D,
  model: ExtrusionModel,
  options: RenderExtrusionOptions,
): void {
  const padding = options.padding ?? 4;
  const scale = layoutScale(model, options.width, options.height, padding);
  const centerX = options.width / 2;
  const centerY = options.height / 2;
  const cos = Math.cos(options.yaw);
  fillProjectedFaces(model, options, projectedScratch);
  projectedScratch.sort((a, b) => a.depth - b.depth);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, options.width, options.height);

  for (const entry of projectedScratch) {
    if (entry.face.fill.kind !== 'color') continue;
    drawSolidQuad(ctx, entry.points, rgbaCss(entry.face.fill.color));
  }

  // Cap facing the camera is drawn after sides so it is not overpainted by the hull.
  if (cos > 0.08) {
    drawBillboardCap(ctx, model.sprite, model, options.yaw, scale, centerX, centerY, 'front');
  } else if (cos < -0.08) {
    drawBillboardCap(ctx, model.sprite, model, options.yaw, scale, centerX, centerY, 'back');
  }

  ctx.restore();
}
