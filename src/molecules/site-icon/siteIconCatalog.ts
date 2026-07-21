export const ICON_BASE = `${import.meta.env.BASE_URL}icons/`;

export const HERO_ALLOY_FRAMES = [
  'tin',
  'bronze',
  'silver',
  'steel',
  'cobalt',
  'nickel',
  'platinum',
  'mythril',
  'adamantine',
  'astral',
] as const;

export type HeroAlloyId = (typeof HERO_ALLOY_FRAMES)[number];
export type SiteIconVariant = 'cycle' | 'static';
export type SiteIconSize = 'nav' | 'md' | 'lg' | 'hero';
export type StaticIconPixels = 64 | 192 | 512;

export function heroFrameUrl(alloy: HeroAlloyId): string {
  return `${ICON_BASE}frames/${alloy}.png`;
}

export function staticIconUrl(pixels: StaticIconPixels = 64): string {
  return `${ICON_BASE}icon-${pixels}.png`;
}

export function displayPixelsForSize(size: SiteIconSize): number {
  switch (size) {
    case 'nav':
      return 48;
    case 'md':
      return 128;
    case 'lg':
      return 256;
    case 'hero':
    default:
      return 360;
  }
}

export function defaultStaticPixelsForSize(size: SiteIconSize): StaticIconPixels {
  switch (size) {
    case 'lg':
    case 'hero':
      return 512;
    case 'md':
      return 192;
    case 'nav':
    default:
      return 64;
  }
}
