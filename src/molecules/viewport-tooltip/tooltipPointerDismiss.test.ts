import { test, expect } from 'vitest';
import { ensureTooltipPointerTracking, isPointerOverElement, shouldDismissHoveredTooltip } from './tooltipPointerDismiss.js';

test('[FR-009] shouldDismissHoveredTooltip is false while anchor reports hover', () => {
  const anchor = document.createElement('button');
  anchor.matches = (selector) => selector === ':hover';
  expect(shouldDismissHoveredTooltip(anchor, [])).toBe(false);
});

test('[FR-009] shouldDismissHoveredTooltip is true when anchor and surfaces are not hovered', () => {
  const anchor = document.createElement('button');
  const panel = document.createElement('div');
  expect(shouldDismissHoveredTooltip(anchor, [panel])).toBe(true);
});

test('[FR-009] isPointerOverElement falls back to elementFromPoint when :hover is false', () => {
  ensureTooltipPointerTracking();
  const anchor = document.createElement('button');
  const child = document.createElement('span');
  anchor.append(child);
  document.body.append(anchor);

  const original = document.elementFromPoint;
  document.elementFromPoint = () => child;
  document.dispatchEvent(new PointerEvent('pointermove', { clientX: 8, clientY: 8, bubbles: true }));
  expect(isPointerOverElement(anchor)).toBe(true);

  document.elementFromPoint = original;
  anchor.remove();
});
