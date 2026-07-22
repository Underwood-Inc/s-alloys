/** Affine texture map for one source triangle onto one screen triangle. */
export function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  source: [number, number, number, number, number, number],
  dest: [number, number, number, number, number, number],
): void {
  const [s0x, s0y, s1x, s1y, s2x, s2y] = source;
  const [d0x, d0y, d1x, d1y, d2x, d2y] = dest;
  const denom = s0x * (s1y - s2y) + s1x * (s2y - s0y) + s2x * (s0y - s1y);
  if (Math.abs(denom) < 1e-6) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.beginPath();
  ctx.moveTo(d0x, d0y);
  ctx.lineTo(d1x, d1y);
  ctx.lineTo(d2x, d2y);
  ctx.closePath();
  ctx.clip();

  const m11 = (d0x * (s1y - s2y) + d1x * (s2y - s0y) + d2x * (s0y - s1y)) / denom;
  const m21 = (d0y * (s1y - s2y) + d1y * (s2y - s0y) + d2y * (s0y - s1y)) / denom;
  const m31 = (d0x * (s2x - s1x) + d1x * (s0x - s2x) + d2x * (s1x - s0x)) / denom;
  const m32 = (d0y * (s2x - s1x) + d1y * (s0x - s2x) + d2y * (s1x - s0x)) / denom;
  const dx = (d0x * (s1x * s2y - s2x * s1y) + d1x * (s2x * s0y - s0x * s2y) + d2x * (s0x * s1y - s1x * s0y)) / denom;
  const dy = (d0y * (s1x * s2y - s2x * s1y) + d1y * (s2x * s0y - s0x * s2y) + d2y * (s0x * s1y - s1x * s0y)) / denom;

  ctx.transform(m11, m21, m31, m32, dx, dy);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

export function drawTexturedQuad(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  points: [number, number, number, number, number, number, number, number],
): void {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = points;
  drawTexturedTriangle(ctx, image, [0, 0, imageWidth, 0, imageWidth, imageHeight], [x1, y1, x2, y2, x3, y3]);
  drawTexturedTriangle(ctx, image, [0, 0, imageWidth, imageHeight, 0, imageHeight], [x0, y0, x3, y3, x2, y2]);
}
