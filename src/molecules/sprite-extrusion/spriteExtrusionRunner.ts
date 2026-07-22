import { renderExtrusion } from './renderExtrusion.js';
import type { ExtrusionModel } from './types.js';

export interface ExtrusionClock {
  now(): number;
}

export const wallExtrusionClock: ExtrusionClock = {
  now: () => performance.now(),
};

export interface ExtrusionLoopLayout {
  width: number;
  height: number;
  padding?: number;
}

export function yawFromElapsed(elapsedMs: number, periodMs = 4000): number {
  return (elapsedMs / periodMs) * Math.PI * 2;
}

export function startExtrusionLoop(
  ctx: CanvasRenderingContext2D,
  model: ExtrusionModel,
  layout: ExtrusionLoopLayout,
  clock: ExtrusionClock = wallExtrusionClock,
  periodMs = 4000,
): () => void {
  const start = clock.now();
  let frame = 0;

  const tick = () => {
    const yaw = yawFromElapsed(clock.now() - start, periodMs);
    renderExtrusion(ctx, model, { ...layout, yaw });
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
