import { test, expect } from 'vitest';
import { renderAssetImage } from './renderAssetImage.js';

test('[FR-012] renderAssetImage emits alloys-image host with escaped attributes', () => {
  const html = renderAssetImage({
    src: '/s-alloys/guide/ingots/tin.png?v=abc',
    class: 'qa-case-icon qa-case-icon--list',
    width: 48,
    height: 48,
    loading: 'lazy',
    title: 'Tin & Co',
  });

  expect(html).toContain('<alloys-image');
  expect(html).toContain('src="/s-alloys/guide/ingots/tin.png?v=abc"');
  expect(html).toContain('class="qa-case-icon qa-case-icon--list"');
  expect(html).toContain('title="Tin &amp; Co"');
});
