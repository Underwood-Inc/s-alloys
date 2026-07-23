import { renderExtrusion } from './renderExtrusion.js';
import { yawFromElapsed, type ExtrusionClock, wallExtrusionClock } from './spriteExtrusionRunner.js';
import type { ExtrusionModel } from './types.js';

export interface ExtrusionLoopLayout {
  width: number;
  height: number;
  padding?: number;
}

interface ExtrusionSubscriber {
  ctx: CanvasRenderingContext2D;
  model: ExtrusionModel;
  layout: ExtrusionLoopLayout;
  clock: ExtrusionClock;
  periodMs: number;
  startMs: number;
  visible: boolean;
}

const subscribers = new Map<number, ExtrusionSubscriber>();
let nextId = 0;
let frameId = 0;

function tick(now: number): void {
  for (const subscriber of subscribers.values()) {
    if (!subscriber.visible) continue;
    const yaw = yawFromElapsed(now - subscriber.startMs, subscriber.periodMs);
    renderExtrusion(subscriber.ctx, subscriber.model, {
      width: subscriber.layout.width,
      height: subscriber.layout.height,
      padding: subscriber.layout.padding,
      yaw,
    });
  }
  frameId = requestAnimationFrame(tick);
}

function ensureLoop(): void {
  if (frameId === 0) {
    frameId = requestAnimationFrame(tick);
  }
}

function stopLoopIfIdle(): void {
  if (subscribers.size === 0 && frameId !== 0) {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }
}

export interface ExtrusionAnimationHandle {
  setVisible(visible: boolean): void;
  dispose(): void;
}

export function subscribeExtrusionAnimation(
  ctx: CanvasRenderingContext2D,
  model: ExtrusionModel,
  layout: ExtrusionLoopLayout,
  clock: ExtrusionClock = wallExtrusionClock,
  periodMs = 4000,
): ExtrusionAnimationHandle {
  const id = nextId;
  nextId += 1;
  subscribers.set(id, {
    ctx,
    model,
    layout,
    clock,
    periodMs,
    startMs: clock.now(),
    visible: true,
  });
  ensureLoop();

  return {
    setVisible(visible: boolean) {
      const subscriber = subscribers.get(id);
      if (subscriber) subscriber.visible = visible;
    },
    dispose() {
      subscribers.delete(id);
      stopLoopIfIdle();
    },
  };
}

export function resetExtrusionAnimationHub(): void {
  subscribers.clear();
  if (frameId !== 0) {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }
}
