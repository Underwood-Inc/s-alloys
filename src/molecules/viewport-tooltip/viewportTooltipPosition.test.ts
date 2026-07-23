import { test, expect } from 'vitest';
import {
  anchorOverlapArea,
  computeViewportTooltipPosition,
  rectsOverlap,
} from './viewportTooltipPosition.js';

const viewport = { width: 400, height: 800 };

function mockAnchor(top: number, left: number, size = 40): DOMRect {
  return {
    top,
    left,
    right: left + size,
    bottom: top + size,
    width: size,
    height: size,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function tooltipOverlapsAnchor(
  position: { top: number; left: number },
  tooltipSize: { width: number; height: number },
  anchor: DOMRect,
): boolean {
  return rectsOverlap(
    { top: position.top, left: position.left, width: tooltipSize.width, height: tooltipSize.height },
    anchor,
  );
}

/**
 * @description Tooltip positioning keeps content inside the viewport with sensible fallbacks.
 */
test('[FR-005] computeViewportTooltipPosition clamps a right-placed tooltip away from the left edge', () => {
  const anchor = mockAnchor(40, 8);

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
  expect(tooltipOverlapsAnchor(position, { width: 220, height: 260 }, anchor)).toBe(false);
});

test('[FR-005] computeViewportTooltipPosition prefers bottom placement under compact header triggers', () => {
  const anchor = mockAnchor(20, 180);

  const position = computeViewportTooltipPosition(
    anchor,
    { width: 240, height: 280 },
    viewport,
    { preferred: ['bottom', 'top', 'right', 'left'], margin: 12, gap: 10 },
  );

  expect(position.placement).toBe('bottom');
  expect(position.top).toBeGreaterThanOrEqual(anchor.bottom + 10);
  expect(tooltipOverlapsAnchor(position, { width: 240, height: 280 }, anchor)).toBe(false);
});

test('[FR-005] computeViewportTooltipPosition avoids covering the anchor when top placement would clamp', () => {
  const anchor = mockAnchor(180, 120);
  const tooltipSize = { width: 280, height: 320 };

  const position = computeViewportTooltipPosition(anchor, tooltipSize, { width: 500, height: 420 }, {
    preferred: ['top', 'bottom', 'right', 'left'],
    margin: 12,
    gap: 10,
  });

  expect(anchorOverlapArea(position.top, position.left, tooltipSize, anchor)).toBe(0);
  expect(tooltipOverlapsAnchor(position, tooltipSize, anchor)).toBe(false);
});

test('[FR-005] computeViewportTooltipPosition nudges wide tooltips beside grid icons instead of over them', () => {
  const anchor = mockAnchor(260, 210, 48);
  const tooltipSize = { width: 300, height: 340 };

  const position = computeViewportTooltipPosition(anchor, tooltipSize, { width: 720, height: 640 }, {
    preferred: ['bottom', 'top', 'right', 'left'],
    margin: 12,
    gap: 10,
  });

  expect(tooltipOverlapsAnchor(position, tooltipSize, anchor)).toBe(false);
});
