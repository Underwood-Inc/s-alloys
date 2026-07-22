export { buildExtrusionModel } from './buildExtrusionModel.js';
export {
  SPRITE_EXTRUSION_CATALOG,
  SPRITE_EXTRUSION_KINDS,
  depthRatioForKind,
  extrusionDepthPx,
  isSpriteExtrusionKind,
  parseSpriteExtrusionKind,
} from './spriteExtrusionCatalog.js';
export type { SpriteExtrusionKind, SpriteExtrusionKindRow } from './spriteExtrusionCatalog.js';
export { renderExtrusion, projectExtrusionFaces, quadArea } from './renderExtrusion.js';
export {
  startExtrusionLoop,
  wallExtrusionClock,
  yawFromElapsed,
} from './spriteExtrusionRunner.js';
export type {
  BuildExtrusionOptions,
  ExtrusionFace,
  ExtrusionFaceFill,
  ExtrusionFaceKind,
  ExtrusionModel,
  RenderExtrusionOptions,
  Rgba,
  SpriteBitmap,
  SpriteBitmapLoader,
  ColorFaceFill,
} from './types.js';
