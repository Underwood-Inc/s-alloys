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

interface AxisRect {
  top: number;
  left: number;
  width: number;
  height: number;
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

export function rectsOverlap(a: AxisRect, b: DOMRectReadOnly, padding = 0): boolean {
  return !(
    a.left + a.width + padding <= b.left
    || b.left + b.width + padding <= a.left
    || a.top + a.height + padding <= b.top
    || b.top + b.height + padding <= a.top
  );
}

export function anchorOverlapArea(
  top: number,
  left: number,
  size: ViewportSize,
  anchor: DOMRectReadOnly,
): number {
  const tooltip: AxisRect = { top, left, width: size.width, height: size.height };
  if (!rectsOverlap(tooltip, anchor)) return 0;

  const overlapLeft = Math.max(left, anchor.left);
  const overlapTop = Math.max(top, anchor.top);
  const overlapRight = Math.min(left + size.width, anchor.right);
  const overlapBottom = Math.min(top + size.height, anchor.bottom);
  return Math.max(0, overlapRight - overlapLeft) * Math.max(0, overlapBottom - overlapTop);
}

function clampToViewport(
  top: number,
  left: number,
  size: ViewportSize,
  viewport: ViewportSize,
  margin: number,
): { top: number; left: number } {
  return {
    top: clamp(top, margin, Math.max(margin, viewport.height - size.height - margin)),
    left: clamp(left, margin, Math.max(margin, viewport.width - size.width - margin)),
  };
}

function nudgeAwayFromAnchor(
  top: number,
  left: number,
  size: ViewportSize,
  anchor: DOMRectReadOnly,
  viewport: ViewportSize,
  margin: number,
  gap: number,
): { top: number; left: number } {
  let nextTop = top;
  let nextLeft = left;

  const current = (): AxisRect => ({ top: nextTop, left: nextLeft, width: size.width, height: size.height });
  if (!rectsOverlap(current(), anchor)) {
    return clampToViewport(nextTop, nextLeft, size, viewport, margin);
  }

  const spaceAbove = anchor.top - margin;
  const spaceBelow = viewport.height - margin - anchor.bottom;
  const spaceLeft = anchor.left - margin;
  const spaceRight = viewport.width - margin - anchor.right;

  if (spaceBelow >= spaceAbove) {
    nextTop = anchor.bottom + gap;
  } else {
    nextTop = anchor.top - gap - size.height;
  }

  if (rectsOverlap(current(), anchor)) {
    if (spaceRight >= spaceLeft) {
      nextLeft = anchor.right + gap;
    } else {
      nextLeft = anchor.left - gap - size.width;
    }
  }

  return clampToViewport(nextTop, nextLeft, size, viewport, margin);
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

  const candidates = preferred.map((placement, order) => {
    const raw = coordsForPlacement(placement, anchor, size, gap);
    const clamped = clampToViewport(raw.top, raw.left, size, viewport, margin);
    const nudged = nudgeAwayFromAnchor(clamped.top, clamped.left, size, anchor, viewport, margin, gap);
    return {
      placement,
      order,
      top: nudged.top,
      left: nudged.left,
      overflow: overflowAmount(nudged.top, nudged.left, size, viewport, margin),
      anchorOverlap: anchorOverlapArea(nudged.top, nudged.left, size, anchor),
    };
  });

  candidates.sort((a, b) => {
    if (a.anchorOverlap !== b.anchorOverlap) return a.anchorOverlap - b.anchorOverlap;
    if (a.overflow !== b.overflow) return a.overflow - b.overflow;
    return a.order - b.order;
  });

  const best = candidates[0] ?? {
    placement: preferred[0] ?? 'bottom',
    top: margin,
    left: margin,
    overflow: 0,
    anchorOverlap: 0,
    order: 0,
  };

  return {
    top: best.top,
    left: best.left,
    placement: best.placement,
  };
}
