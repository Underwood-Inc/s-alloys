import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { renderTooltipBottomBar, renderTooltipTopBar } from '../../molecules/tooltip-frame/tooltipChrome.js';
import { rarityStyle } from '../../molecules/tooltip-model/rarityCatalog.js';
import type { GameTooltipData, TooltipShowDetail } from '../../molecules/tooltip-model/types.js';
import { TOOLTIP_HIDE_EVENT, TOOLTIP_SHOW_EVENT } from '../../molecules/tooltip-model/types.js';
import '../item-preview/item-preview.js';

function lineClass(kind: string): string {
  return `game-tooltip__line game-tooltip__line--${kind}`;
}

/**
 * Global tooltip host — rarity-styled CSS chrome (top bar + body + bottom bar).
 */
export class GameTooltipHost extends HTMLElement {
  private activeAnchor: HTMLElement | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerOnPanel = false;

  connectedCallback() {
    this.className = 'game-tooltip-host';
    this.innerHTML = '<div class="game-tooltip-host__panel" hidden></div>';
    document.addEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.addEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
  }

  disconnectedCallback() {
    document.removeEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.removeEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
    this.clearHideTimer();
  }

  private onShow = (event: Event) => {
    const detail = (event as CustomEvent<TooltipShowDetail>).detail;
    if (!detail?.tooltip || !detail.anchor) return;
    this.activeAnchor = detail.anchor;
    this.paint(detail.tooltip, detail.anchor);
  };

  private onHide = (event: Event) => {
    const detail = (event as CustomEvent<{ anchor?: HTMLElement }>).detail;
    if (detail?.anchor && detail.anchor !== this.activeAnchor) return;
    this.scheduleHide();
  };

  private scheduleHide() {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      if (!this.pointerOnPanel) this.hide();
    }, 150);
  }

  private clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private bindPanelPointer(panel: HTMLElement) {
    panel.onpointerenter = () => {
      this.pointerOnPanel = true;
      this.clearHideTimer();
    };
    panel.onpointerleave = () => {
      this.pointerOnPanel = false;
      this.scheduleHide();
    };
  }

  private panel(): HTMLElement | null {
    return this.querySelector('.game-tooltip-host__panel');
  }

  private hide() {
    this.clearHideTimer();
    const panel = this.panel();
    if (panel) panel.hidden = true;
    this.activeAnchor = null;
    this.pointerOnPanel = false;
  }

  private paint(tooltip: GameTooltipData, anchor: HTMLElement) {
    const panel = this.panel();
    if (!panel) return;

    this.clearHideTimer();
    this.pointerOnPanel = false;

    const style = rarityStyle(tooltip.rarity);
    const rarity = tooltip.rarity;

    panel.hidden = false;
    panel.dataset.rarity = rarity;
    panel.style.setProperty('--tooltip-title', style.titleColor);
    panel.style.setProperty('--tooltip-border', style.borderColor);
    panel.style.setProperty('--tooltip-glow', style.glowColor);
    panel.style.setProperty('--tooltip-accent', style.accentColor);
    panel.style.setProperty('--tooltip-accent-dim', style.accentDim);

    const previewAttrs = [
      `icon="${escapeHtml(tooltip.icon)}"`,
      tooltip.modelId ? `model-id="${escapeHtml(tooltip.modelId)}"` : '',
      'alt=""',
    ].filter(Boolean).join(' ');

    panel.innerHTML = `
      <div class="game-tooltip" data-rarity="${escapeHtml(rarity)}">
        ${renderTooltipTopBar()}
        <div class="game-tooltip__body">
          <div class="game-tooltip__header">
            <item-preview class="game-tooltip__preview" ${previewAttrs}></item-preview>
            <p class="game-tooltip__title">${escapeHtml(tooltip.title)}</p>
          </div>
          <div class="game-tooltip__divider" aria-hidden="true"></div>
          <div class="game-tooltip__scroll" tabindex="0">
            <ul class="game-tooltip__lines">
              ${tooltip.lines.map((line) => `
                <li class="${lineClass(line.kind)}${line.italic ? ' game-tooltip__line--italic' : ''}">
                  ${escapeHtml(line.text)}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
        ${renderTooltipBottomBar()}
      </div>
    `;

    this.bindPanelPointer(panel);

    requestAnimationFrame(() => this.position(anchor));
  }

  private position(anchor: HTMLElement) {
    const panel = this.panel();
    if (!panel) return;

    const rect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const margin = 12;

    let left = rect.left + rect.width / 2 - panelRect.width / 2;
    let top = rect.top - panelRect.height - margin;

    if (top < margin) {
      top = rect.bottom + margin;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - panelRect.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - panelRect.height - margin));

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }
}

defineAlloysElement('game-tooltip-host', GameTooltipHost);

export function ensureGameTooltipHost(): void {
  if (document.querySelector('game-tooltip-host')) return;
  document.body.append(document.createElement('game-tooltip-host'));
}
