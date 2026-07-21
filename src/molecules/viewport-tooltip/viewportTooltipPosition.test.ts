import { test, expect } from 'vitest';
import { computeViewportTooltipPosition } from './viewportTooltipPosition.js';

const viewport = { width: 400, height: 800 };

/**
 * @description Tooltip positioning keeps content inside the viewport with sensible fallbacks.
 */
test('[FR-005] computeViewportTooltipPosition clamps a right-placed tooltip away from the left edge', () => {
  const anchor = {
    top: 40,
    left: 8,
    right: 48,
    bottom: 80,
    width: 40,
    height: 40,
    x: 8,
    y: 40,
    toJSON: () => ({}),
  } as DOMRect;

  const position = computeViewportTooltipPosition(
    anchor,
    { width: 220, height: 260 },
    viewport,
    { preferred: ['right', 'bottom', 'left', 'top'], margin: 12, gap: 10 },
  );

  expect(position.left).toBeGreaterThanOrEqual(12);
  expect(position.top).toBeGreaterThanOrEqual(12);
  expect(position.left + 220).toBeLessThanOrEqual(388);
  expect(position.top + 260).toBeLessThanOrEqual(788);
});

test('[FR-005] computeViewportTooltipPosition prefers bottom placement under compact header triggers', () => {
  const anchor = {
    top: 20,
    left: 180,
    right: 220,
    bottom: 60,
    width: 40,
    height: 40,
    x: 180,
    y: 20,
    toJSON: () => ({}),
  } as DOMRect;

  const position = computeViewportTooltipPosition(
    anchor,
    { width: 240, height: 280 },
    viewport,
    { preferred: ['bottom', 'top', 'right', 'left'], margin: 12, gap: 10 },
  );

  expect(position.placement).toBe('bottom');
  expect(position.top).toBeGreaterThanOrEqual(anchor.bottom + 10);
});
