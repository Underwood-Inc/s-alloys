export const SPRITE_EXTRUSION_KINDS = ['item', 'block'] as const;

export type SpriteExtrusionKind = (typeof SPRITE_EXTRUSION_KINDS)[number];

export interface SpriteExtrusionKindRow {
  kind: SpriteExtrusionKind;
  depthRatio: number;
  label: string;
}

/** Canon depth ratios — item silhouettes are thinner than full blocks. */
export const SPRITE_EXTRUSION_CATALOG: readonly SpriteExtrusionKindRow[] = [
  { kind: 'item', depthRatio: 0.15, label: 'Flat item' },
  { kind: 'block', depthRatio: 1, label: 'Full block' },
] as const;

const ratioByKind = new Map<SpriteExtrusionKind, number>(
  SPRITE_EXTRUSION_CATALOG.map((row) => [row.kind, row.depthRatio]),
);

export function isSpriteExtrusionKind(value: string | undefined): value is SpriteExtrusionKind {
  return SPRITE_EXTRUSION_KINDS.includes(value as SpriteExtrusionKind);
}

export function parseSpriteExtrusionKind(value: string | undefined): SpriteExtrusionKind {
  return isSpriteExtrusionKind(value) ? value : 'item';
}

export function depthRatioForKind(kind: SpriteExtrusionKind): number {
  return ratioByKind.get(kind) ?? ratioByKind.get('item')!;
}

export function extrusionDepthPx(spriteWidth: number, kind: SpriteExtrusionKind): number {
  return Math.max(1, Math.round(spriteWidth * depthRatioForKind(kind)));
}
