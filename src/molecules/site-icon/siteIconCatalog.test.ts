import { test, expect } from 'vitest';
import {
  heroFrameUrl,
  staticIconUrl,
  displayPixelsForSize,
  defaultStaticPixelsForSize,
} from './siteIconCatalog.js';

test('[FR-006] site icon catalog resolves frame and static asset URLs', () => {
  expect(heroFrameUrl('astral')).toContain('icons/frames/astral.png');
  expect(staticIconUrl(64)).toContain('icons/icon-64.png');
  expect(staticIconUrl(512)).toContain('icons/icon-512.png');
});

test('[FR-006] site icon catalog maps display sizes', () => {
  expect(displayPixelsForSize('nav')).toBe(48);
  expect(displayPixelsForSize('hero')).toBe(360);
  expect(defaultStaticPixelsForSize('nav')).toBe(64);
  expect(defaultStaticPixelsForSize('hero')).toBe(512);
});
