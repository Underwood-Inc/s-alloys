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
const forceClosedListeners = new Set<(layerId: number) => void>();

function notifyForceClosed(layerId: number): void {
  forceClosedListeners.forEach((listener) => listener(layerId));
}

function findParentLayer(anchor: HTMLElement): TooltipLayer | undefined {
  return [...stack].reverse().find(
    (layer) => layer.surface.contains(anchor) || layer.anchor.contains(anchor),
  );
}

function closeSiblingChildren(parentId: number): void {
  for (const entry of [...stack]) {
    if (entry.parentId === parentId) {
      forceCloseTooltipLayer(entry.id);
    }
  }
}

export function subscribeTooltipLayerForceClosed(listener: (layerId: number) => void): () => void {
  forceClosedListeners.add(listener);
  return () => forceClosedListeners.delete(listener);
}

export function forceCloseAllTooltipLayers(): void {
  while (stack.length > 0) {
    forceCloseTooltipLayer(stack[0].id);
  }
}

export function openTooltipLayer(
  layer: Omit<TooltipLayer, 'id' | 'parentId'>,
): number {
  const parent = findParentLayer(layer.anchor);

  if (!parent) {
    forceCloseAllTooltipLayers();
  } else {
    closeSiblingChildren(parent.id);
  }

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

  notifyForceClosed(id);
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
