import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { hideGameTooltip, showGameTooltip } from '../../atoms/tooltip/dispatchTooltip.js';
import { recipeToGrid, type CraftingRecipeView, type IngredientView } from '../../molecules/crafting-model/index.js';
import { resultSlotIndex, slotItemsForRecipe } from '../../molecules/crafting-model/slotItems.js';
import type { GameTooltipData } from '../../molecules/tooltip-model/types.js';

function tooltipForItem(item: IngredientView): GameTooltipData | undefined {
  if (item.tooltip) return item.tooltip;
  if (!item.lore || item.lore.length === 0) return undefined;
  return {
    title: item.label,
    icon: item.icon,
    rarity: 'ingredient',
    lines: item.lore.map((text) => ({ kind: 'body', text, italic: true })),
  };
}

/**
 * Agnostic 3×3 crafting grid + result slot with global game tooltips.
 */
export class CraftingGrid extends HTMLElement {
  private _recipe: CraftingRecipeView | null = null;
  private assetBase = '/';

  static get observedAttributes() {
    return ['recipe-json', 'fx-src', 'caption', 'asset-base'];
  }

  get recipe(): CraftingRecipeView | null {
    return this._recipe;
  }

  set recipe(value: CraftingRecipeView | null) {
    this._recipe = value;
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  private readRecipeFromAttribute(): CraftingRecipeView | null {
    const raw = this.getAttribute('recipe-json');
    if (!raw) return this._recipe;
    try {
      return JSON.parse(raw) as CraftingRecipeView;
    } catch {
      return this._recipe;
    }
  }

  private uiAsset(path: string): string {
    const base = this.getAttribute('asset-base') ?? this.assetBase;
    const root = base.endsWith('/') ? base : `${base}/`;
    return `${root}guide/ui/${path}`;
  }

  private bindTooltips(slots: (IngredientView | null)[]) {
    this.querySelectorAll<HTMLElement>('[data-item-index]').forEach((element) => {
      const index = Number(element.dataset.itemIndex);
      const item = slots[index];
      if (!item) return;

      const tooltip = tooltipForItem(item);
      if (!tooltip) return;

      const open = () => showGameTooltip(element, tooltip);
      const close = () => hideGameTooltip(element);

      element.addEventListener('mouseenter', open);
      element.addEventListener('focus', open);
      element.addEventListener('mouseleave', close);
      element.addEventListener('blur', close);
    });
  }

  private render() {
    const recipe = this.readRecipeFromAttribute();
    this._recipe = recipe;
    this.className = 'crafting-grid';

    if (!recipe) {
      this.innerHTML = '<p class="crafting-grid__empty">Select a recipe.</p>';
      return;
    }

    const fxSrc = this.getAttribute('fx-src');
    const caption = this.getAttribute('caption') ?? (recipe.kind === 'shapeless' ? 'Shapeless craft' : 'Shaped craft');
    const cells = recipeToGrid(recipe);
    const slots = slotItemsForRecipe(recipe);
    const resultIndex = resultSlotIndex();

    const slotsHtml = cells.map((cell, index) => {
      if (!cell.ingredient) {
        return `<div class="crafting-grid__slot crafting-grid__slot--empty" data-slot="${index}" aria-hidden="true"></div>`;
      }
      const item = cell.ingredient;
      return `
        <button
          type="button"
          class="crafting-grid__slot"
          data-slot="${index}"
          data-item-index="${index}"
          aria-label="${escapeHtml(item.label)}"
        >
          <span class="crafting-grid__icon" aria-hidden="true">
            <img src="${escapeHtml(item.icon)}" alt="" loading="lazy" decoding="async" />
          </span>
        </button>
      `;
    }).join('');

    const fx = fxSrc
      ? `<video class="crafting-grid__fx" autoplay loop muted playsinline preload="metadata" aria-hidden="true"><source src="${escapeHtml(fxSrc)}" type="video/webm" /></video>`
      : '<div class="crafting-grid__fx crafting-grid__fx--css" aria-hidden="true"></div>';

    this.innerHTML = `
      ${fx}
      <div class="crafting-grid__surface">
        <div class="crafting-grid__cluster crafting-grid__cluster--input">
          <img
            class="crafting-grid__frame"
            src="${escapeHtml(this.uiAsset('crafting-panel-input.png'))}"
            alt=""
            width="930"
            height="957"
            decoding="async"
          />
          <div class="crafting-grid__overlay" aria-label="Crafting ingredients">
            <div class="crafting-grid__slots">${slotsHtml}</div>
          </div>
        </div>
        <div class="crafting-grid__arrow" aria-hidden="true">
          <img src="${escapeHtml(this.uiAsset('crafting-arrow.png'))}" alt="" width="48" height="48" />
        </div>
        <div class="crafting-grid__cluster crafting-grid__cluster--result">
          <img
            class="crafting-grid__frame"
            src="${escapeHtml(this.uiAsset('crafting-panel-result.png'))}"
            alt=""
            width="872"
            height="868"
            decoding="async"
          />
          <div class="crafting-grid__overlay" aria-label="Crafting result">
            <button
              type="button"
              class="crafting-grid__result"
              data-item-index="${resultIndex}"
              aria-label="${escapeHtml(recipe.result.label)}"
            >
              <span class="crafting-grid__icon" aria-hidden="true">
                <img
                  src="${escapeHtml(recipe.result.icon)}"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
      <p class="crafting-grid__caption">${escapeHtml(caption)} · ${escapeHtml(recipe.title)}</p>
    `;

    this.bindTooltips(slots);
  }
}

defineAlloysElement('crafting-grid', CraftingGrid);
