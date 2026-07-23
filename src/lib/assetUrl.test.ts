import { test, expect, beforeEach } from 'vitest';
import { assetUrl, normalizeAssetPath, setAssetManifest, stripAssetVersion } from './assetUrl.js';

beforeEach(() => {
  setAssetManifest({
    'guide/ingots/tin.png': 'abc123',
    'icons/icon-64.png': 'def456',
  });
});

test('[FR-011] assetUrl appends content hash when manifest entry exists', () => {
  expect(assetUrl('guide/ingots/tin.png', '/s-alloys/')).toBe(
    '/s-alloys/guide/ingots/tin.png?v=abc123',
  );
  expect(assetUrl('/icons/icon-64.png', '/s-alloys/')).toBe(
    '/s-alloys/icons/icon-64.png?v=def456',
  );
});

test('[FR-011] assetUrl leaves path unchanged when hash is unknown', () => {
  expect(assetUrl('guide/ingots/unknown.png', '/base/')).toBe('/base/guide/ingots/unknown.png');
});

test('[FR-011] stripAssetVersion removes cache-bust query for path parsing', () => {
  expect(stripAssetVersion('/base/guide/ingots/tin.png?v=abc123')).toBe('/base/guide/ingots/tin.png');
  expect(normalizeAssetPath('guide/ingots/tin.png?v=abc123')).toBe('guide/ingots/tin.png');
  const base = import.meta.env.BASE_URL.replace(/^\/+|\/+$/g, '');
  if (base) {
    expect(normalizeAssetPath(`/${base}/guide/ingots/tin.png?v=abc123`)).toBe('guide/ingots/tin.png');
  }
});
