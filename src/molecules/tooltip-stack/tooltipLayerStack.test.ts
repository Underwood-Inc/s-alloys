import { test, expect, beforeEach } from 'vitest';
import {
  canCloseTooltipLayer,
  closeTooltipLayer,
  getTooltipLayer,
  openTooltipLayer,
  resetTooltipLayerStack,
  tooltipLayerStackDepth,
} from './tooltipLayerStack.js';

beforeEach(() => {
  resetTooltipLayerStack();
});

test('[FR-009] nested tooltip layers block parent close until child closes', () => {
  const parentAnchor = document.createElement('button');
  const parentSurface = document.createElement('div');
  parentSurface.append(parentAnchor);
  document.body.append(parentSurface);

  const childAnchor = document.createElement('button');
  parentSurface.append(childAnchor);
  const childSurface = document.createElement('div');
  document.body.append(childSurface);

  const parentId = openTooltipLayer({
    kind: 'viewport-panel',
    anchor: parentAnchor,
    surface: parentSurface,
  });
  const childId = openTooltipLayer({
    kind: 'game-tooltip',
    anchor: childAnchor,
    surface: childSurface,
  });

  expect(tooltipLayerStackDepth()).toBe(2);
  expect(canCloseTooltipLayer(parentId)).toBe(false);
  expect(closeTooltipLayer(parentId)).toBe(false);
  expect(closeTooltipLayer(childId)).toBe(true);
  expect(canCloseTooltipLayer(parentId)).toBe(true);
  expect(closeTooltipLayer(parentId)).toBe(true);
  expect(tooltipLayerStackDepth()).toBe(0);

  parentSurface.remove();
  childSurface.remove();
});

test('[FR-009] opening a root tooltip layer closes previous root layers', () => {
  const firstAnchor = document.createElement('button');
  const firstSurface = document.createElement('div');
  const secondAnchor = document.createElement('button');
  const secondSurface = document.createElement('div');

  const firstId = openTooltipLayer({
    kind: 'game-tooltip',
    anchor: firstAnchor,
    surface: firstSurface,
  });
  const secondId = openTooltipLayer({
    kind: 'game-tooltip',
    anchor: secondAnchor,
    surface: secondSurface,
  });

  expect(secondId).toBeGreaterThan(firstId);
  expect(tooltipLayerStackDepth()).toBe(1);
  expect(getTooltipLayer(firstId)).toBeUndefined();
});
