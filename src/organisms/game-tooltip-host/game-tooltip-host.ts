import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { highlightSearchText } from '../../atoms/highlightSearchText.js';
import { readAssetImageSrc } from '../../atoms/asset-image/renderAssetImage.js';
import { hideGameTooltip, showGameTooltip } from '../../atoms/tooltip/dispatchTooltip.js';
import { getActiveRecipeSearchQuery } from '../../molecules/recipe-search/activeRecipeSearchQuery.js';
import { buildVanillaIngredientTooltip } from '../../molecules/tooltip-model/buildGameTooltip.js';
import type { IngredientId } from '../../molecules/recipe-catalog/ingredients.js';
import { renderTooltipBottomBar, renderTooltipTopBar } from '../../molecules/tooltip-frame/tooltipChrome.js';
import { renderGameTooltipBody, renderGameTooltipMeta } from '../../molecules/tooltip-model/renderGameTooltipBody.js';
import { rarityStyle } from '../../molecules/tooltip-model/rarityCatalog.js';
import type { GameTooltipData, TooltipShowDetail } from '../../molecules/tooltip-model/types.js';
import { TOOLTIP_HIDE_EVENT, TOOLTIP_SHOW_EVENT } from '../../molecules/tooltip-model/types.js';
import {
  subscribeTooltipLayerForceClosed,
  subscribeTooltipLayerChildClosed,
  canCloseTooltipLayer,
  closeTooltipLayer,
  forceCloseTooltipLayer,
  openTooltipLayer,
} from '../../molecules/tooltip-stack/tooltipLayerStack.js';
import { applyViewportTooltipAnchor } from '../../molecules/viewport-tooltip/applyViewportTooltipAnchor.js';
import { TOOLTIP_HOVER_MAX_MS } from '../../molecules/viewport-tooltip/viewportTooltipConstants.js';
import {
  isPointerOverElement,
  shouldDismissHoveredTooltip,
} from '../../molecules/viewport-tooltip/tooltipPointerDismiss.js';
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
  private hoverMaxTimer: ReturnType<typeof setTimeout> | null = null;
  private childHoverMaxTimer: ReturnType<typeof setTimeout> | null = null;
  private pointerOnPanel = false;
  private pointerOnChildPanel = false;
  private unsubscribeChildClosed: (() => void) | null = null;
  private unsubscribeForceClosed: (() => void) | null = null;
  private readonly onScroll = (event: Event) => this.handleScroll(event);

  connectedCallback() {
    this.className = 'game-tooltip-host';
    this.innerHTML = `
      <div class="game-tooltip-host__panel" hidden></div>
      <div class="game-tooltip-host__panel game-tooltip-host__panel--child" hidden></div>
    `;
    document.addEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.addEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
    window.addEventListener('scroll', this.onScroll, true);
    this.unsubscribeChildClosed = subscribeTooltipLayerChildClosed((parentId) => {
      if (parentId === this.activeChildLayerId) {
        this.scheduleChildHide();
        return;
      }
      if (parentId !== this.activeLayerId) return;
      this.scheduleHide();
    });
    this.unsubscribeForceClosed = subscribeTooltipLayerForceClosed((layerId) => {
      if (layerId === this.activeChildLayerId) this.detachChild();
      if (layerId === this.activeLayerId) this.detachRoot();
    });
  }

  disconnectedCallback() {
    document.removeEventListener(TOOLTIP_SHOW_EVENT, this.onShow as EventListener);
    document.removeEventListener(TOOLTIP_HIDE_EVENT, this.onHide as EventListener);
    window.removeEventListener('scroll', this.onScroll, true);
    this.unsubscribeChildClosed?.();
    this.unsubscribeChildClosed = null;
    this.unsubscribeForceClosed?.();
    this.unsubscribeForceClosed = null;
    this.clearHideTimer();
    this.clearChildHideTimer();
    this.clearHoverMaxTimer();
    this.clearChildHoverMaxTimer();
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
      this.paint(detail.tooltip, detail.anchor, this.childPanel(), 'child', detail.trigger === 'hover');
      return;
    }

    this.hideChild();
    this.activeAnchor = detail.anchor;
    this.paint(detail.tooltip, detail.anchor, panel, 'root', detail.trigger === 'hover');
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

  private handleScroll(event?: Event) {
    const panel = this.panel();
    const childPanel = this.childPanel();
    const target = event?.target;
    if (target instanceof Node && (panel?.contains(target) || childPanel?.contains(target))) {
      return;
    }

    if (
      this.activeChildAnchor
      && shouldDismissHoveredTooltip(this.activeChildAnchor, [childPanel])
    ) {
      this.hideChild();
    }

    if (
      this.activeAnchor
      && shouldDismissHoveredTooltip(this.activeAnchor, [panel, childPanel])
    ) {
      this.hide();
    }
  }

  private scheduleHide() {
    if (this.activeLayerId !== null && !canCloseTooltipLayer(this.activeLayerId)) return;
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      if (this.pointerOnPanel || this.pointerOnChildPanel) return;
      if (isPointerOverElement(this.activeAnchor)) return;
      if (isPointerOverElement(this.activeChildAnchor)) return;
      this.hide();
    }, 150);
  }

  private scheduleChildHide() {
    if (this.activeChildLayerId !== null && !canCloseTooltipLayer(this.activeChildLayerId)) return;
    this.clearChildHideTimer();
    this.childHideTimer = setTimeout(() => {
      if (this.pointerOnChildPanel) return;
      if (isPointerOverElement(this.activeChildAnchor)) return;
      this.hideChild();
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

  private clearHoverMaxTimer() {
    if (this.hoverMaxTimer) {
      clearTimeout(this.hoverMaxTimer);
      this.hoverMaxTimer = null;
    }
  }

  private clearChildHoverMaxTimer() {
    if (this.childHoverMaxTimer) {
      clearTimeout(this.childHoverMaxTimer);
      this.childHoverMaxTimer = null;
    }
  }

  private scheduleHoverMax(mode: 'root' | 'child') {
    const clear = mode === 'root' ? () => this.clearHoverMaxTimer() : () => this.clearChildHoverMaxTimer();
    const set = (timer: ReturnType<typeof setTimeout>) => {
      if (mode === 'root') this.hoverMaxTimer = timer;
      else this.childHoverMaxTimer = timer;
    };

    clear();
    set(setTimeout(() => {
      if (mode === 'root') {
        if (this.pointerOnPanel || this.pointerOnChildPanel) return;
        if (isPointerOverElement(this.activeAnchor)) return;
        this.hide();
      } else if (this.pointerOnChildPanel || isPointerOverElement(this.activeChildAnchor)) {
        return;
      } else {
        this.hideChild();
      }
    }, TOOLTIP_HOVER_MAX_MS));
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
      const icon = readAssetImageSrc(chip.querySelector('.game-tooltip__ore-icon'));
      const tooltip = buildVanillaIngredientTooltip(id, label, icon);

      const openHover = () => showGameTooltip(chip, tooltip, 'hover');
      const openFocus = () => showGameTooltip(chip, tooltip, 'focus');
      const close = () => hideGameTooltip(chip);

      chip.addEventListener('mouseenter', openHover);
      chip.addEventListener('focus', openFocus);
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

  private detachChild() {
    this.clearChildHideTimer();
    this.clearChildHoverMaxTimer();
    const panel = this.childPanel();
    if (panel) panel.hidden = true;
    this.activeChildAnchor = null;
    this.activeChildLayerId = null;
    this.pointerOnChildPanel = false;
  }

  private detachRoot() {
    this.detachChild();
    this.clearHideTimer();
    this.clearHoverMaxTimer();
    const panel = this.panel();
    if (panel) panel.hidden = true;
    this.activeAnchor = null;
    this.activeLayerId = null;
    this.pointerOnPanel = false;
  }

  private hideChild() {
    if (this.activeChildLayerId !== null && !canCloseTooltipLayer(this.activeChildLayerId)) return;

    const layerId = this.activeChildLayerId;
    this.detachChild();
    if (layerId !== null) closeTooltipLayer(layerId);
  }

  private hide() {
    this.hideChild();
    if (this.activeLayerId !== null && !canCloseTooltipLayer(this.activeLayerId)) return;

    const layerId = this.activeLayerId;
    this.detachRoot();
    if (layerId !== null) closeTooltipLayer(layerId);
  }

  private paint(
    tooltip: GameTooltipData,
    anchor: HTMLElement,
    panel: HTMLElement | null,
    mode: 'root' | 'child',
    hoverOpened: boolean,
  ) {
    if (!panel) return;

    if (mode === 'root') {
      this.clearHideTimer();
      this.clearHoverMaxTimer();
      this.pointerOnPanel = false;
    } else {
      this.clearChildHideTimer();
      this.clearChildHoverMaxTimer();
      this.pointerOnChildPanel = false;
    }

    const style = rarityStyle(tooltip.rarity);
    const rarity = tooltip.rarity;
    const highlightQuery = getActiveRecipeSearchQuery();

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
              <p class="game-tooltip__title">${highlightQuery ? highlightSearchText(tooltip.title, highlightQuery) : escapeHtml(tooltip.title)}</p>
              ${renderGameTooltipMeta(tooltip.lines, rarity, highlightQuery)}
            </div>
          </div>
          <div class="game-tooltip__divider" aria-hidden="true"></div>
          <div class="game-tooltip__scroll" tabindex="0">
            ${renderGameTooltipBody(tooltip.lines, tooltip.oreSources, highlightQuery)}
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
      if (hoverOpened) this.scheduleHoverMax('root');
    } else {
      if (this.activeChildLayerId !== null) closeTooltipLayer(this.activeChildLayerId);
      this.activeChildLayerId = openTooltipLayer({
        kind: 'game-tooltip',
        anchor,
        surface: panel,
      });
      if (hoverOpened) this.scheduleHoverMax('child');
    }

    requestAnimationFrame(() => {
      applyViewportTooltipAnchor(anchor, panel, { preferred: ['bottom', 'top', 'right', 'left'] });
    });
  }
}

defineAlloysElement('game-tooltip-host', GameTooltipHost);

export function ensureGameTooltipHost(): void {
  if (document.querySelector('game-tooltip-host')) return;
  document.body.append(document.createElement('game-tooltip-host'));
}
