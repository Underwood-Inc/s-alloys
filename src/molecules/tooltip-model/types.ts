/** Legendary Tooltips–style presentation model (reusable across datapack sites). */

export type TooltipRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'ingredient';

export type TooltipLineKind = 'tier' | 'body' | 'enchant' | 'stat' | 'passive';

export interface TooltipLine {
  kind: TooltipLineKind;
  text: string;
  italic?: boolean;
}

export interface GameTooltipData {
  title: string;
  icon: string;
  rarity: TooltipRarity;
  /** Optional glTF registry id — falls back to sprite extrusion when absent. */
  modelId?: string;
  lines: TooltipLine[];
}

export interface TooltipShowDetail {
  anchor: HTMLElement;
  tooltip: GameTooltipData;
}

export const TOOLTIP_SHOW_EVENT = 'alloys-tooltip-show';
export const TOOLTIP_HIDE_EVENT = 'alloys-tooltip-hide';
