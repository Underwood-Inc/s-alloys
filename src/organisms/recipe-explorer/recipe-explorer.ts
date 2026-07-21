import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { hideGameTooltip, showGameTooltip } from '../../atoms/tooltip/dispatchTooltip.js';
import {
  ALLOY_CATALOG,
  buildRecipeForTab,
  recipeTabsForAlloy,
  type RecipeTabId,
} from '../../molecules/recipe-catalog/index.js';
import { recipeNavTiles } from '../../molecules/recipe-nav/recipeNavCatalog.js';
import {
  selectionPreviewIcon,
  selectionSubtitle,
  selectionTitle,
  selectionTooltip,
} from '../../molecules/recipe-selection/recipeSelection.js';
import '../crafting-grid/crafting-grid.js';

/**
 * Recipe browser — ingot strip + category strip + live preview + crafting grid.
 */
export class RecipeExplorer extends HTMLElement {
  private alloyId = ALLOY_CATALOG[0]?.id ?? 'tin';
  private tab: RecipeTabId = 'ingot';
  private shellReady = false;

  static get observedAttributes() {
    return ['asset-base', 'initial-alloy', 'initial-tab'];
  }

  connectedCallback() {
    const initialAlloy = this.getAttribute('initial-alloy');
    if (initialAlloy && ALLOY_CATALOG.some((alloy) => alloy.id === initialAlloy)) {
      this.alloyId = initialAlloy;
    }
    const initialTab = this.getAttribute('initial-tab') as RecipeTabId | null;
    if (initialTab) this.tab = initialTab;
    if (!this.shellReady) this.renderShell();
    this.refresh();
  }

  attributeChangedCallback(name: string) {
    if (name === 'initial-alloy' || name === 'initial-tab' || name === 'asset-base') {
      this.connectedCallback();
    }
  }

  private assetBase(): string {
    const base = this.getAttribute('asset-base') ?? '/';
    return base.endsWith('/') ? base : `${base}/`;
  }

  private currentAlloy() {
    return ALLOY_CATALOG.find((alloy) => alloy.id === this.alloyId) ?? ALLOY_CATALOG[0];
  }

  private renderShell() {
    this.className = 'recipe-explorer';
    this.innerHTML = `
      <header class="recipe-explorer__masthead">
        <h3 class="recipe-explorer__title">Recipe explorer</h3>
        <p class="recipe-explorer__lead">Pick a metal, pick what you want to craft — the preview and grid follow your filters.</p>
      </header>

      <div class="recipe-explorer__picker">
        <div class="recipe-explorer__row recipe-explorer__row--ingots" role="group" aria-label="Choose alloy"></div>

        <div class="recipe-explorer__preview" aria-live="polite">
          <img class="recipe-explorer__preview-icon" alt="" width="72" height="72" />
          <div class="recipe-explorer__preview-copy">
            <h4 class="recipe-explorer__preview-title"></h4>
            <p class="recipe-explorer__preview-sub"></p>
          </div>
        </div>

        <div class="recipe-explorer__row recipe-explorer__row--kinds" role="tablist" aria-label="Recipe categories"></div>
      </div>

      <div class="recipe-explorer__grid-wrap" role="tabpanel">
        <crafting-grid asset-base="${escapeHtml(this.assetBase())}"></crafting-grid>
      </div>
    `;

    this.querySelector('.recipe-explorer__row--ingots')?.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-alloy-id]');
      if (!button?.dataset.alloyId) return;
      this.alloyId = button.dataset.alloyId;
      const tabs = recipeTabsForAlloy(this.currentAlloy());
      if (!tabs.includes(this.tab)) this.tab = 'ingot';
      this.refresh();
    });

    this.querySelector('.recipe-explorer__row--kinds')?.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tab-id]');
      if (!button?.dataset.tabId) return;
      this.tab = button.dataset.tabId as RecipeTabId;
      this.refresh();
    });

    this.shellReady = true;
  }

  private bindPickerTooltips() {
    const baseUrl = this.assetBase();
    const alloy = this.currentAlloy();

    this.querySelectorAll<HTMLElement>('[data-alloy-id]').forEach((element) => {
      const id = element.dataset.alloyId;
      if (!id) return;
      const entry = ALLOY_CATALOG.find((row) => row.id === id);
      if (!entry) return;
      const icon = `${baseUrl}guide/ingots/${id}.png`;
      const tooltip = selectionTooltip(entry, 'ingot', baseUrl);
      tooltip.icon = icon;
      tooltip.title = `${entry.name} Ingot`;

      const open = () => showGameTooltip(element, tooltip);
      const close = () => hideGameTooltip(element);
      element.onmouseenter = open;
      element.onfocus = open;
      element.onmouseleave = close;
      element.onblur = close;
    });

    this.querySelectorAll<HTMLElement>('[data-tab-id]').forEach((element) => {
      const tabId = element.dataset.tabId as RecipeTabId | undefined;
      if (!tabId) return;
      const tooltip = selectionTooltip(alloy, tabId, baseUrl);
      const open = () => showGameTooltip(element, tooltip);
      const close = () => hideGameTooltip(element);
      element.onmouseenter = open;
      element.onfocus = open;
      element.onmouseleave = close;
      element.onblur = close;
    });
  }

  private refresh() {
    const baseUrl = this.assetBase();
    const alloy = this.currentAlloy();
    const tabs = recipeTabsForAlloy(alloy);
    if (!tabs.includes(this.tab)) this.tab = tabs[0];
    const recipe = buildRecipeForTab(alloy, this.tab, baseUrl);
    const navTiles = recipeNavTiles(tabs, baseUrl, alloy.id);

    const ingotRow = this.querySelector('.recipe-explorer__row--ingots');
    if (ingotRow) {
      ingotRow.innerHTML = ALLOY_CATALOG.map((entry) => {
        const active = entry.id === this.alloyId;
        const icon = `${baseUrl}guide/ingots/${entry.id}.png`;
        return `
          <button
            type="button"
            class="recipe-explorer__chip${active ? ' is-active' : ''}"
            data-alloy-id="${escapeHtml(entry.id)}"
            aria-pressed="${active}"
            aria-label="${escapeHtml(entry.name)}"
          >
            <img src="${escapeHtml(icon)}" alt="" width="40" height="40" loading="lazy" />
          </button>
        `;
      }).join('');
    }

    const kindRow = this.querySelector('.recipe-explorer__row--kinds');
    if (kindRow) {
      kindRow.innerHTML = navTiles.map((tile) => {
        const active = tile.id === this.tab;
        return `
          <button
            type="button"
            class="recipe-explorer__kind${active ? ' is-active' : ''}"
            role="tab"
            aria-selected="${active}"
            data-tab-id="${escapeHtml(tile.id)}"
            aria-label="${escapeHtml(tile.label)}"
          >
            <img src="${escapeHtml(tile.icon)}" alt="" width="36" height="36" loading="lazy" />
            <span class="recipe-explorer__kind-label">${escapeHtml(tile.label)}</span>
          </button>
        `;
      }).join('');
    }

    const previewIcon = this.querySelector<HTMLImageElement>('.recipe-explorer__preview-icon');
    if (previewIcon) {
      previewIcon.src = selectionPreviewIcon({ alloyId: alloy.id, tab: this.tab }, baseUrl);
      previewIcon.alt = selectionTitle(alloy, this.tab);
    }

    const previewTitle = this.querySelector('.recipe-explorer__preview-title');
    if (previewTitle) previewTitle.textContent = selectionTitle(alloy, this.tab);

    const previewSub = this.querySelector('.recipe-explorer__preview-sub');
    if (previewSub) previewSub.textContent = selectionSubtitle(alloy, this.tab);

    const gridWrap = this.querySelector('.recipe-explorer__grid-wrap');
    if (gridWrap) gridWrap.setAttribute('aria-label', recipe.title);

    const grid = this.querySelector('crafting-grid');
    if (grid && 'recipe' in grid) {
      (grid as { recipe: typeof recipe }).recipe = recipe;
    }

    this.bindPickerTooltips();
  }
}

defineAlloysElement('recipe-explorer', RecipeExplorer);
