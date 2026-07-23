import { escapeHtml } from '../dom/defineElement.js';

export interface AssetImageOptions {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
  title?: string;
  class?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  dataSrc?: string;
}

export function renderAssetImage(options: AssetImageOptions): string {
  const attrs = [
    `src="${escapeHtml(options.src)}"`,
    `alt="${escapeHtml(options.alt ?? '')}"`,
    options.width != null ? `width="${options.width}"` : '',
    options.height != null ? `height="${options.height}"` : '',
    options.loading ? `loading="${options.loading}"` : '',
    options.decoding ? `decoding="${options.decoding}"` : '',
    options.fetchpriority ? `fetchpriority="${options.fetchpriority}"` : '',
    options.title ? `title="${escapeHtml(options.title)}"` : '',
    options.class ? `class="${escapeHtml(options.class)}"` : '',
    options.fit ? `fit="${options.fit}"` : '',
    options.dataSrc ? `data-src="${escapeHtml(options.dataSrc)}"` : '',
  ].filter(Boolean);

  return `<alloys-image ${attrs.join(' ')}></alloys-image>`;
}

export function readAssetImageSrc(element: Element | null | undefined): string {
  if (!element) return '';
  if (element instanceof HTMLImageElement) return element.src;
  if (element.tagName.toLowerCase() === 'alloys-image') {
    return element.getAttribute('src')
      ?? element.querySelector<HTMLImageElement>('.asset-image__img')?.src
      ?? '';
  }
  return element.querySelector<HTMLImageElement>('img')?.src ?? '';
}
