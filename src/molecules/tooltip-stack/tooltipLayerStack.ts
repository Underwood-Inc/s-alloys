export type TooltipLayerKind = 'viewport-panel' | 'game-tooltip';

export interface TooltipLayer {
  id: number;
  kind: TooltipLayerKind;
  anchor: HTMLElement;
  surface: HTMLElement;
  parentId?: number;
}

let nextLayerId = 1;
const stack: TooltipLayer[] = [];
const childClosedListeners = new Set<(parentId: number) => void>();

function findParentLayer(anchor: HTMLElement): TooltipLayer | undefined {
  return [...stack].reverse().find(
    (layer) => layer.surface.contains(anchor) || layer.anchor.contains(anchor),
  );
}

export function openTooltipLayer(
  layer: Omit<TooltipLayer, 'id' | 'parentId'>,
): number {
  const parent = findParentLayer(layer.anchor);
  const entry: TooltipLayer = {
    ...layer,
    id: nextLayerId++,
    parentId: parent?.id,
  };
  stack.push(entry);
  return entry.id;
}

export function getTooltipLayer(id: number): TooltipLayer | undefined {
  return stack.find((layer) => layer.id === id);
}

export function canCloseTooltipLayer(id: number): boolean {
  return !stack.some((layer) => layer.parentId === id);
}

export function closeTooltipLayer(id: number): boolean {
  const layer = getTooltipLayer(id);
  if (!layer) return false;
  if (!canCloseTooltipLayer(id)) return false;

  const parentId = layer.parentId;
  const index = stack.findIndex((entry) => entry.id === id);
  if (index !== -1) stack.splice(index, 1);

  if (parentId !== undefined) {
    childClosedListeners.forEach((listener) => listener(parentId));
  }

  return true;
}

export function forceCloseTooltipLayer(id: number): void {
  const layer = getTooltipLayer(id);
  if (!layer) return;

  const childIds = stack.filter((entry) => entry.parentId === id).map((entry) => entry.id);
  for (const childId of childIds) forceCloseTooltipLayer(childId);

  const parentId = layer.parentId;
  const index = stack.findIndex((entry) => entry.id === id);
  if (index !== -1) stack.splice(index, 1);

  if (parentId !== undefined) {
    childClosedListeners.forEach((listener) => listener(parentId));
  }
}

export function resetTooltipLayerStack(): void {
  stack.length = 0;
  nextLayerId = 1;
}

export function subscribeTooltipLayerChildClosed(listener: (parentId: number) => void): () => void {
  childClosedListeners.add(listener);
  return () => childClosedListeners.delete(listener);
}

export function tooltipLayerStackDepth(): number {
  return stack.length;
}
