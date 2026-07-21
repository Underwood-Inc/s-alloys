import { test, expect } from 'vitest';
import { defineAlloysElement, escapeHtml } from './defineElement.js';

/**
 * @description Custom elements register once per tag name.
 */
test('[FR-006] defineAlloysElement registers a custom element', () => {
  class DemoElement extends HTMLElement {}
  defineAlloysElement('alloys-demo-element', DemoElement);
  defineAlloysElement('alloys-demo-element', DemoElement);
  expect(customElements.get('alloys-demo-element')).toBe(DemoElement);
});

test('[FR-006] escapeHtml encodes unsafe markup', () => {
  expect(escapeHtml('<script>"x"</script>')).toBe('&lt;script&gt;&quot;x&quot;&lt;/script&gt;');
});
