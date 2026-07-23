export type ViewportTooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportTooltipPosition {
  top: number;
  left: number;
  placement: ViewportTooltipPlacement;
}

export interface ViewportTooltipOptions {
  gap?: number;
  margin?: number;
  preferred?: ViewportTooltipPlacement[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function coordsForPlacement(
  placement: ViewportTooltipPlacement,
  anchor: DOMRectReadOnly,
  size: ViewportSize,
  gap: number,
): { top: number; left: number } {
  switch (placement) {
    case 'top':
      return {
        top: anchor.top - gap - size.height,
        left: anchor.left + anchor.width / 2 - size.width / 2,
      };
    case 'bottom':
      return {
        top: anchor.bottom + gap,
        left: anchor.left + anchor.width / 2 - size.width / 2,
      };
    case 'left':
      return {
        top: anchor.top + anchor.height / 2 - size.height / 2,
        left: anchor.left - gap - size.width,
      };
    case 'right':
    default:
      return {
        top: anchor.top + anchor.height / 2 - size.height / 2,
        left: anchor.right + gap,
      };
  }
}

function overflowAmount(
  top: number,
  left: number,
  size: ViewportSize,
  viewport: ViewportSize,
  margin: number,
): number {
  const overflowTop = Math.max(0, margin - top);
  const overflowLeft = Math.max(0, margin - left);
  const overflowBottom = Math.max(0, top + size.height + margin - viewport.height);
  const overflowRight = Math.max(0, left + size.width + margin - viewport.width);
  return overflowTop + overflowLeft + overflowBottom + overflowRight;
}

export function computeViewportTooltipPosition(
  anchor: DOMRectReadOnly,
  size: ViewportSize,
  viewport: ViewportSize,
  options: ViewportTooltipOptions = {},
): ViewportTooltipPosition {
  const gap = options.gap ?? 10;
  const margin = options.margin ?? 12;
  const preferred = options.preferred ?? ['bottom', 'right', 'top', 'left'];

  const candidates = preferred.map((placement) => {
    const raw = coordsForPlacement(placement, anchor, size, gap);
    const left = clamp(raw.left, margin, Math.max(margin, viewport.width - size.width - margin));
    const top = clamp(raw.top, margin, Math.max(margin, viewport.height - size.height - margin));
    return {
      placement,
      top,
      left,
      overflow: overflowAmount(top, left, size, viewport, margin),
    };
  });

  candidates.sort((a, b) => a.overflow - b.overflow);
  const best = candidates[0] ?? {
    placement: preferred[0] ?? 'bottom',
    top: margin,
    left: margin,
    overflow: 0,
  };

  return {
    top: best.top,
    left: best.left,
    placement: best.placement,
  };
}
