import type { SpriteBitmap, SpriteBitmapLoader } from '../../molecules/sprite-extrusion/types.js';

const ALPHA_CUTOFF = 160;
const spriteCache = new Map<string, Promise<SpriteBitmap>>();

export function clearSpriteBitmapCache(): void {
  spriteCache.clear();
}

export function binarizeSpriteAlpha(sprite: SpriteBitmap, cutoff = ALPHA_CUTOFF): SpriteBitmap {
  const data = new Uint8ClampedArray(sprite.data);
  for (let i = 3; i < data.length; i += 4) {
    data[i] = data[i] >= cutoff ? 255 : 0;
  }
  return { width: sprite.width, height: sprite.height, data };
}

export async function loadSpriteImageData(url: string): Promise<SpriteBitmap> {
  const cached = spriteCache.get(url);
  if (cached) return cached;

  const promise = loadSpriteImageDataImpl(url);
  spriteCache.set(url, promise);
  promise.catch(() => {
    spriteCache.delete(url);
  });
  return promise;
}

async function loadSpriteImageDataImpl(url: string): Promise<SpriteBitmap> {
  const image = new Image();
  image.decoding = 'async';
  image.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return binarizeSpriteAlpha({
    width: imageData.width,
    height: imageData.height,
    data: imageData.data,
  });
}

export const browserSpriteBitmapLoader: SpriteBitmapLoader = {
  load: loadSpriteImageData,
};
