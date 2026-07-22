import type { Vec3 } from '../../atoms/math3d/types.js';
import type { SpriteExtrusionKind } from './spriteExtrusionCatalog.js';

export interface SpriteBitmap {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type ExtrusionFaceKind = 'front' | 'back' | 'side';

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorFaceFill {
  kind: 'color';
  color: Rgba;
}

export type ExtrusionFaceFill = ColorFaceFill;

export interface ExtrusionFace {
  id: string;
  kind: ExtrusionFaceKind;
  corners: [Vec3, Vec3, Vec3, Vec3];
  fill: ExtrusionFaceFill;
}

export interface ExtrusionModel {
  sprite: SpriteBitmap;
  depth: number;
  center: Vec3;
  faces: ExtrusionFace[];
}

export interface BuildExtrusionOptions {
  kind: SpriteExtrusionKind;
  alphaThreshold?: number;
}

export interface RenderExtrusionOptions {
  yaw: number;
  width: number;
  height: number;
  padding?: number;
}

export interface SpriteBitmapLoader {
  load(url: string): Promise<SpriteBitmap>;
}
