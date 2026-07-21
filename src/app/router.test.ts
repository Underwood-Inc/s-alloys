import { test, expect } from 'vitest';
import { currentAppPath, resolveRoute, routeToPath } from './router.js';

/**
 * @description Public site routing must stay simple and path-safe for GitHub Pages.
 */
test('[FR-006] resolves home checklist and guide routes', () => {
  expect(resolveRoute('/')).toEqual({ view: 'home' });
  expect(resolveRoute('/checklist')).toEqual({ view: 'checklist' });
  expect(resolveRoute('/qa')).toEqual({ view: 'checklist' });
  expect(resolveRoute('/guide')).toEqual({ view: 'guide', slug: null });
  expect(resolveRoute('/guide/install')).toEqual({ view: 'guide', slug: 'install' });
});

test('[FR-006] unknown paths fall back to home', () => {
  expect(resolveRoute('/nope')).toEqual({ view: 'home' });
});

test('[FR-006] routeToPath maps routes to paths', () => {
  expect(routeToPath({ view: 'home' })).toBe('/');
  expect(routeToPath({ view: 'checklist' })).toBe('/checklist');
  expect(routeToPath({ view: 'guide', slug: null })).toBe('/guide');
  expect(routeToPath({ view: 'guide', slug: 'install' })).toBe('/guide/install');
});

test('[FR-006] currentAppPath strips the site base prefix', () => {
  Object.defineProperty(window, 'location', {
    value: { pathname: '/s-alloys/qa' },
    configurable: true,
  });
  expect(currentAppPath()).toBe('/qa');
});
