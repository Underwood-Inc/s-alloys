import { buildExtrusionModel } from './buildExtrusionModel.js';
import { parseSpriteExtrusionKind } from './spriteExtrusionCatalog.js';
import type { ExtrusionModel } from './types.js';
import { loadSpriteImageData } from '../../plugs/browser/spriteBitmapBrowser.js';

const modelCache = new Map<string, Promise<ExtrusionModel>>();

export function loadExtrusionModel(src: string, kindAttr?: string | null): Promise<ExtrusionModel> {
  const kind = parseSpriteExtrusionKind(kindAttr ?? undefined);
  const key = `${src}\0${kind}`;
  let cached = modelCache.get(key);
  if (!cached) {
    cached = loadSpriteImageData(src).then((sprite) => buildExtrusionModel(sprite, { kind }));
    modelCache.set(key, cached);
  }
  return cached;
}

export function clearExtrusionModelCache(): void {
  modelCache.clear();
}
