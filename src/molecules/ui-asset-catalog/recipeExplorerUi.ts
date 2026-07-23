/** Committed paths under public/guide/ui/ — edit assets in place; never regenerate via scripts. */

import { assetUrl } from '../../lib/assetUrl.js';

export const INGOT_RING_RADIUS_PERCENT = 38;

/** Ten alloys in cycle order — matches hero icon frames. */
export const INGOT_RING_ORDER = [
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

export function ingotRingPosition(index: number, total: number): { left: number; top: number } {
  const angle = (-Math.PI / 2) + ((Math.PI * 2) / total) * index;
  const cx = 50;
  const cy = 50;
  return {
    left: cx + Math.cos(angle) * INGOT_RING_RADIUS_PERCENT,
    top: cy + Math.sin(angle) * INGOT_RING_RADIUS_PERCENT,
  };
}

export function recipeExplorerUiAsset(baseUrl: string, file: string): string {
  return assetUrl(`guide/ui/${file}`, baseUrl);
}

export const RECIPE_EXPLORER_UI = {
  forgePanel: 'forge-ingot-ring-panel.png',
  categoryDeck: 'category-deck-panel.png',
  categoryArrowPrev: 'category-arrow-prev.png',
  categoryArrowNext: 'category-arrow-next.png',
  ingotSlotIdle: 'ingot-slot-idle.png',
  ingotSlotActive: 'ingot-slot-active.png',
} as const;

export const CATEGORY_DECK_PAGE_SIZE = 6;
