import type { GameTooltipData } from '../../molecules/tooltip-model/types.js';
import { TOOLTIP_HIDE_EVENT, TOOLTIP_SHOW_EVENT } from '../../molecules/tooltip-model/types.js';

export function showGameTooltip(anchor: HTMLElement, tooltip: GameTooltipData): void {
  anchor.dispatchEvent(new CustomEvent(TOOLTIP_SHOW_EVENT, {
    bubbles: true,
    composed: true,
    detail: { anchor, tooltip },
  }));
}

export function hideGameTooltip(anchor: HTMLElement): void {
  anchor.dispatchEvent(new CustomEvent(TOOLTIP_HIDE_EVENT, {
    bubbles: true,
    composed: true,
    detail: { anchor },
  }));
}
