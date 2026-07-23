import { subscribeExtrusionAnimation } from './extrusionAnimationHub.js';
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
  const handle = subscribeExtrusionAnimation(ctx, model, layout, clock, periodMs);
  return () => handle.dispose();
}

export function renderExtrusionFrame(
  ctx: CanvasRenderingContext2D,
  model: ExtrusionModel,
  layout: ExtrusionLoopLayout,
): void {
  renderExtrusion(ctx, model, { ...layout, yaw: 0 });
}
