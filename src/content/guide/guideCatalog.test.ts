import { test, expect } from 'vitest';
import { GUIDE_ARTICLES, getGuideArticle } from './guideCatalog.js';

const LEAK_TERMS = [
  'custom_data',
  'alloys_pending',
  'build/server-deploy',
  'tools/',
  'craft/resolve',
  'dispatch',
];

/**
 * @description Public guide must never expose private implementation vocabulary.
 */
test('[FR-007] guide articles avoid internal implementation terms', () => {
  for (const article of GUIDE_ARTICLES) {
    const blob = `${article.title} ${article.lede ?? ''} ${article.summary ?? ''} ${article.body}`.toLowerCase();
    for (const term of LEAK_TERMS) {
      expect(blob.includes(term.toLowerCase())).toBe(false);
    }
  }
});

test('[FR-007] getGuideArticle returns article by slug', () => {
  expect(getGuideArticle('install')?.title).toMatch(/install/i);
});
