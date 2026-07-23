import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { hideGameTooltip, showGameTooltip } from '../../atoms/tooltip/dispatchTooltip.js';
import { buildVanillaIngredientTooltip } from '../../molecules/tooltip-model/buildGameTooltip.js';
import type { IngredientId } from '../../molecules/recipe-catalog/ingredients.js';
import { renderTooltipBottomBar, renderTooltipTopBar } from '../../molecules/tooltip-frame/tooltipChrome.js';
import { renderGameTooltipBody, renderGameTooltipMeta } from '../../molecules/tooltip-model/renderGameTooltipBody.js';
import { rarityStyle } from '../../molecules/tooltip-model/rarityCatalog.js';
import type { GameTooltipData, TooltipShowDetail } from '../../molecules/tooltip-model/types.js';
import { TOOLTIP_HIDE_EVENT, TOOLTIP_SHOW_EVENT } from '../../molecules/tooltip-model/types.js';
import { applyViewportTooltipAnchor } from '../../molecules/viewport-tooltip/applyViewportTooltipAnchor.js';
import {
  canCloseTooltipLayer,
  closeTooltipLayer,
  forceCloseTooltipLayer,
  openTooltipLayer,
  subscribeTooltipLayerChildClosed,
} from '../../molecules/tooltip-stack/tooltipLayerStack.js';
import '../item-preview/item-preview.js';

/**
 * Global tooltip host — rarity-styled CSS chrome (top bar + body + bottom bar).
 */
export class GameTooltipHost extends HTMLElement {
  private activeAnchor: HTMLElement | null = null;
  private activeLayerId: number | null = null;
  private activeChildAnchor: HTMLElement | null = null;
  private activeChildLayerId: number | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private childHideTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerOnPanel = false;
  private pointerOnChildPanel = false;
  private unsubscribeChildClosed: (() => void) | null = null;

  connectedCallback() {
    this.className = 'game-tooltip-host';
    this.innerHTML = `
      <div class="game-tooltip-host__panel" hidden></div>
      <div class="game-tooltip-host__panel game-tooltip-host__panel--child" hidden></div>
    `;
    document.addEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.addEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
    this.unsubscribeChildClosed = subscribeTooltipLayerChildClosed((parentId) => {
      if (parentId === this.activeChildLayerId) {
        this.scheduleChildHide();
        return;
      }
      if (parentId !== this.activeLayerId) return;
      this.scheduleHide();
    });
  }

  disconnectedCallback() {
    document.removeEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.removeEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
    this.unsubscribeChildClosed?.();
    this.unsubscribeChildClosed = null;
    this.clearHideTimer();
    this.clearChildHideTimer();
    if (this.activeChildLayerId !== null) {
      forceCloseTooltipLayer(this.activeChildLayerId);
      this.activeChildLayerId = null;
    }
    if (this.activeLayerId !== null) {
      forceCloseTooltipLayer(this.activeLayerId);
      this.activeLayerId = null;
    }
  }

  private onShow = (event: Event) => {
    const detail = (event as CustomEvent<TooltipShowDetail>).detail;
    if (!detail?.tooltip || !detail.anchor) return;

    const panel = this.panel();
    if (panel && !panel.hidden && panel.contains(detail.anchor)) {
      this.activeChildAnchor = detail.anchor;
      this.paint(detail.tooltip, detail.anchor, this.childPanel(), 'child');
      return;
    }

    this.hideChild();
    this.activeAnchor = detail.anchor;
    this.paint(detail.tooltip, detail.anchor, panel, 'root');
  };

  private onHide = (event: Event) => {
    const detail = (event as CustomEvent<{ anchor?: HTMLElement }>).detail;
    if (detail?.anchor && detail.anchor === this.activeChildAnchor) {
      this.scheduleChildHide();
      return;
    }
    if (detail?.anchor && detail.anchor !== this.activeAnchor) return;
    this.scheduleHide();
  };

  private scheduleHide() {
    if (this.activeLayerId !== null && !canCloseTooltipLayer(this.activeLayerId)) return;
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      if (!this.pointerOnPanel && !this.pointerOnChildPanel) this.hide();
    }, 150);
  }

  private scheduleChildHide() {
    if (this.activeChildLayerId !== null && !canCloseTooltipLayer(this.activeChildLayerId)) return;
    this.clearChildHideTimer();
    this.childHideTimer = setTimeout(() => {
      if (!this.pointerOnChildPanel) this.hideChild();
    }, 150);
  }

  private clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private clearChildHideTimer() {
    if (this.childHideTimer) {
      clearTimeout(this.childHideTimer);
      this.childHideTimer = null;
    }
  }

  private bindPanelPointer(panel: HTMLElement, mode: 'root' | 'child') {
    panel.onpointerenter = () => {
      if (mode === 'root') {
        this.pointerOnPanel = true;
        this.clearHideTimer();
      } else {
        this.pointerOnChildPanel = true;
        this.clearChildHideTimer();
        this.clearHideTimer();
      }
    };
    panel.onpointerleave = () => {
      if (mode === 'root') {
        this.pointerOnPanel = false;
        this.scheduleHide();
      } else {
        this.pointerOnChildPanel = false;
        this.scheduleChildHide();
      }
    };
  }

  private bindOreChips(panel: HTMLElement) {
    panel.querySelectorAll<HTMLButtonElement>('.game-tooltip__ore-chip').forEach((chip) => {
      const id = chip.dataset.oreId as IngredientId | undefined;
      if (!id) return;

      const label = chip.querySelector('.game-tooltip__ore-label')?.textContent?.trim() ?? id;
      const icon = chip.querySelector<HTMLImageElement>('.game-tooltip__ore-icon')?.src ?? '';
      const tooltip = buildVanillaIngredientTooltip(id, label, icon);

      const open = () => showGameTooltip(chip, tooltip);
      const close = () => hideGameTooltip(chip);

      chip.addEventListener('mouseenter', open);
      chip.addEventListener('focus', open);
      chip.addEventListener('mouseleave', close);
      chip.addEventListener('blur', close);
    });
  }

  private panel(): HTMLElement | null {
    return this.querySelector('.game-tooltip-host__panel:not(.game-tooltip-host__panel--child)');
  }

  private childPanel(): HTMLElement | null {
    return this.querySelector('.game-tooltip-host__panel--child');
  }

  private hideChild() {
    if (this.activeChildLayerId !== null && !canCloseTooltipLayer(this.activeChildLayerId)) return;

    this.clearChildHideTimer();
    const panel = this.childPanel();
    if (panel) panel.hidden = true;
    this.activeChildAnchor = null;
    this.pointerOnChildPanel = false;

    if (this.activeChildLayerId !== null) {
      closeTooltipLayer(this.activeChildLayerId);
      this.activeChildLayerId = null;
    }
  }

  private hide() {
    this.hideChild();
    if (this.activeLayerId !== null && !canCloseTooltipLayer(this.activeLayerId)) return;

    this.clearHideTimer();
    const panel = this.panel();
    if (panel) panel.hidden = true;
    this.activeAnchor = null;
    this.pointerOnPanel = false;

    if (this.activeLayerId !== null) {
      closeTooltipLayer(this.activeLayerId);
      this.activeLayerId = null;
    }
  }

  private paint(
    tooltip: GameTooltipData,
    anchor: HTMLElement,
    panel: HTMLElement | null,
    mode: 'root' | 'child',
  ) {
    if (!panel) return;

    if (mode === 'root') {
      this.clearHideTimer();
      this.pointerOnPanel = false;
    } else {
      this.clearChildHideTimer();
      this.pointerOnChildPanel = false;
    }

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
            <div class="game-tooltip__headline">
              <p class="game-tooltip__title">${escapeHtml(tooltip.title)}</p>
              ${renderGameTooltipMeta(tooltip.lines, rarity)}
            </div>
          </div>
          <div class="game-tooltip__divider" aria-hidden="true"></div>
          <div class="game-tooltip__scroll" tabindex="0">
            ${renderGameTooltipBody(tooltip.lines, tooltip.oreSources)}
          </div>
        </div>
        ${renderTooltipBottomBar()}
      </div>
    `;

    this.bindPanelPointer(panel, mode);
    if (mode === 'root') this.bindOreChips(panel);

    if (mode === 'root') {
      if (this.activeLayerId !== null) closeTooltipLayer(this.activeLayerId);
      this.activeLayerId = openTooltipLayer({
        kind: 'game-tooltip',
        anchor,
        surface: panel,
      });
    } else {
      if (this.activeChildLayerId !== null) closeTooltipLayer(this.activeChildLayerId);
      this.activeChildLayerId = openTooltipLayer({
        kind: 'game-tooltip',
        anchor,
        surface: panel,
      });
    }

    requestAnimationFrame(() => {
      applyViewportTooltipAnchor(anchor, panel, { preferred: ['top', 'bottom', 'right', 'left'] });
    });
  }
}

defineAlloysElement('game-tooltip-host', GameTooltipHost);

export function ensureGameTooltipHost(): void {
  if (document.querySelector('game-tooltip-host')) return;
  document.body.append(document.createElement('game-tooltip-host'));
}
