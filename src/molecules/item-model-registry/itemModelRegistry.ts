/**
 * glTF/GLB model registry — industry-standard open assets keyed by model id.
 * Add, edit, or remove entries; sprite extrusion is used when no glTF is registered.
 */
export type ItemModelKind = 'sprite' | 'gltf';

export interface ItemModelEntry {
  id: string;
  kind: ItemModelKind;
  /** Public URL to a .glb or .gltf file when kind is gltf. */
  src?: string;
  /** Fallback sprite when glTF is absent or still loading. */
  sprite: string;
}

const registry = new Map<string, ItemModelEntry>();

export function registerItemModel(entry: ItemModelEntry): void {
  registry.set(entry.id, entry);
}

export function unregisterItemModel(id: string): boolean {
  return registry.delete(id);
}

export function getItemModel(id: string | undefined): ItemModelEntry | undefined {
  if (!id) return undefined;
  return registry.get(id);
}

export function listItemModels(): ItemModelEntry[] {
  return [...registry.values()];
}

export function clearItemModels(): void {
  registry.clear();
}
