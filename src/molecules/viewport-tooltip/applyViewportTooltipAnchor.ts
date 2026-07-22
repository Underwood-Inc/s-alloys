import {
  computeViewportTooltipPosition,
  type ViewportTooltipOptions,
  type ViewportTooltipPlacement,
} from './viewportTooltipPosition.js';

export function parseViewportTooltipPlacement(
  value: string | undefined,
): ViewportTooltipPlacement[] | undefined {
  if (!value) return undefined;
  const allowed: ViewportTooltipPlacement[] = ['top', 'right', 'bottom', 'left'];
  const parsed = value
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is ViewportTooltipPlacement => allowed.includes(part as ViewportTooltipPlacement));
  return parsed.length ? parsed : undefined;
}

export function applyViewportTooltipAnchor(
  anchor: HTMLElement,
  panel: HTMLElement,
  options: ViewportTooltipOptions = {},
): void {
  const preferred = options.preferred ?? ['top', 'bottom', 'right', 'left'];
  const margin = options.margin ?? 12;

  panel.style.position = 'fixed';
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
  panel.style.transform = 'none';
  panel.style.visibility = 'hidden';

  const anchorRect = anchor.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const coords = computeViewportTooltipPosition(
    anchorRect,
    { width: panelRect.width, height: panelRect.height },
    { width: window.innerWidth, height: window.innerHeight },
    { ...options, preferred, margin },
  );

  panel.style.top = `${coords.top}px`;
  panel.style.left = `${coords.left}px`;
  panel.dataset.placement = coords.placement;
  panel.style.visibility = 'visible';
}

export function clearViewportTooltipAnchor(panel: HTMLElement): void {
  panel.style.visibility = '';
  panel.style.position = '';
  panel.style.top = '';
  panel.style.left = '';
  panel.style.right = '';
  panel.style.bottom = '';
  panel.style.transform = '';
  panel.removeAttribute('data-placement');
}
