let pointerX = -1;
let pointerY = -1;
let tracking = false;

function onPointerMove(event: PointerEvent): void {
  pointerX = event.clientX;
  pointerY = event.clientY;
}

/** Track last pointer position so hover checks survive scroll/layout `:hover` glitches. */
export function ensureTooltipPointerTracking(): void {
  if (tracking) return;
  tracking = true;
  document.addEventListener('pointermove', onPointerMove, { passive: true, capture: true });
}

export function isElementHovered(element: HTMLElement | null): boolean {
  return Boolean(element?.matches(':hover'));
}

export function isPointerOverElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (isElementHovered(element)) return true;
  if (pointerX < 0 || pointerY < 0) return false;
  const target = document.elementFromPoint(pointerX, pointerY);
  if (!target) return false;
  return element.contains(target);
}

/** True when scroll should dismiss a hover tooltip (cursor left trigger and surfaces). */
export function shouldDismissHoveredTooltip(
  anchor: HTMLElement | null,
  surfaces: Array<HTMLElement | null>,
): boolean {
  if (!anchor) return false;
  if (isPointerOverElement(anchor)) return false;
  if (surfaces.some((surface) => isPointerOverElement(surface))) return false;
  return true;
}
