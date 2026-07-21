import { test, expect } from 'vitest';
import { renderTooltipBottomBar, renderTooltipTopBar } from './tooltipChrome.js';

test('[FR-009] tooltip chrome is CSS-only — no image assets', () => {
  const top = renderTooltipTopBar();
  const bottom = renderTooltipBottomBar();

  expect(top).toContain('game-tooltip__bar--top');
  expect(bottom).toContain('game-tooltip__bar--bottom');
  expect(top).not.toContain('<img');
  expect(top).not.toContain('.png');
  expect(bottom).not.toContain('.png');
});

test('[FR-009] top bar includes center jewel ornament', () => {
  expect(renderTooltipTopBar()).toContain('game-tooltip__jewel');
});
