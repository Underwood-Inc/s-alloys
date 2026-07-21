import type { TooltipRarity } from './types.js';

export interface TooltipRarityStyle {
  titleColor: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  accentDim: string;
}

/** Border palette inspired by Legendary Tooltips rarity tiers. */
export const TOOLTIP_RARITY_STYLES: Record<TooltipRarity, TooltipRarityStyle> = {
  ingredient: {
    titleColor: '#d0d0d0',
    borderColor: '#5a5a5a',
    glowColor: 'rgb(90 90 90 / 35%)',
    accentColor: '#9a9a9a',
    accentDim: '#3a3a3a',
  },
  common: {
    titleColor: '#ffffff',
    borderColor: '#8a8a8a',
    glowColor: 'rgb(138 138 138 / 30%)',
    accentColor: '#c8c8c8',
    accentDim: '#4a4a4a',
  },
  uncommon: {
    titleColor: '#55ff55',
    borderColor: '#2faa2f',
    glowColor: 'rgb(47 170 47 / 35%)',
    accentColor: '#55ff55',
    accentDim: '#1a6a1a',
  },
  rare: {
    titleColor: '#55ffff',
    borderColor: '#2f8faa',
    glowColor: 'rgb(47 143 170 / 40%)',
    accentColor: '#55ddff',
    accentDim: '#1a5a6a',
  },
  epic: {
    titleColor: '#cc66ff',
    borderColor: '#8b3fcc',
    glowColor: 'rgb(139 63 204 / 42%)',
    accentColor: '#cc66ff',
    accentDim: '#5a1a8a',
  },
  legendary: {
    titleColor: '#ffaa00',
    borderColor: '#c68214',
    glowColor: 'rgb(244 200 106 / 45%)',
    accentColor: '#ffd060',
    accentDim: '#8a5a10',
  },
  mythic: {
    titleColor: '#ff66cc',
    borderColor: '#cc3399',
    glowColor: 'rgb(204 51 153 / 48%)',
    accentColor: '#ff88dd',
    accentDim: '#8a2060',
  },
};

export function rarityStyle(rarity: TooltipRarity): TooltipRarityStyle {
  return TOOLTIP_RARITY_STYLES[rarity];
}
