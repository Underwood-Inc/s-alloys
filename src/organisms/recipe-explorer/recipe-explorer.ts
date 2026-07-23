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
  openRecipeExplorer,
  recipeSelectionFromQuery,
  syncRecipeExplorerUrl,
} from '../../molecules/recipe-explorer/openRecipeExplorer.js';
import {
  selectionPreviewIcon,
  selectionSubtitle,
  selectionTitle,
  selectionTooltip,
} from '../../molecules/recipe-selection/recipeSelection.js';
import '../crafting-grid/crafting-grid.js';
import '../item-preview/item-preview.js';

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
    const fromQuery = recipeSelectionFromQuery();
    if (fromQuery) {
      this.alloyId = fromQuery.alloyId;
      this.tab = fromQuery.tab;
    } else {
      const initialAlloy = this.getAttribute('initial-alloy');
      if (initialAlloy && ALLOY_CATALOG.some((alloy) => alloy.id === initialAlloy)) {
        this.alloyId = initialAlloy;
      }
      const initialTab = this.getAttribute('initial-tab') as RecipeTabId | null;
      if (initialTab) this.tab = initialTab;
    }
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
          <item-preview
            class="recipe-explorer__preview-icon"
            icon=""
            alt=""
            navigate="false"
          ></item-preview>
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
      syncRecipeExplorerUrl({ alloyId: this.alloyId, tab: this.tab });
    });

    this.querySelector('.recipe-explorer__row--kinds')?.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-tab-id]');
      if (!button?.dataset.tabId) return;
      this.tab = button.dataset.tabId as RecipeTabId;
      this.refresh();
      syncRecipeExplorerUrl({ alloyId: this.alloyId, tab: this.tab });
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
      const navigate = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        openRecipeExplorer({ alloyId: id, tab: 'ingot' });
      };
      element.onmouseenter = open;
      element.onfocus = open;
      element.onmouseleave = close;
      element.onblur = close;
      element.onclick = navigate;
    });

    this.querySelectorAll<HTMLElement>('[data-tab-id]').forEach((element) => {
      const tabId = element.dataset.tabId as RecipeTabId | undefined;
      if (!tabId) return;
      const tooltip = selectionTooltip(alloy, tabId, baseUrl);
      const open = () => showGameTooltip(element, tooltip);
      const close = () => hideGameTooltip(element);
      const navigate = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        openRecipeExplorer({ alloyId: alloy.id, tab: tabId });
      };
      element.onmouseenter = open;
      element.onfocus = open;
      element.onmouseleave = close;
      element.onblur = close;
      element.onclick = navigate;
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

    const previewIcon = this.querySelector('item-preview.recipe-explorer__preview-icon');
    const previewSrc = selectionPreviewIcon({ alloyId: alloy.id, tab: this.tab }, baseUrl);
    const previewModelId = this.tab === 'ingot'
      ? `ingot:${alloy.id}`
      : this.tab === 'fragment'
        ? `fragment:${alloy.id}`
        : `gear:${alloy.id}:${this.tab}`;
    if (previewIcon) {
      previewIcon.setAttribute('icon', previewSrc);
      previewIcon.setAttribute('model-id', previewModelId);
      previewIcon.setAttribute('alt', selectionTitle(alloy, this.tab));
      previewIcon.setAttribute('navigate', 'true');
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
    syncRecipeExplorerUrl({ alloyId: alloy.id, tab: this.tab });
  }
}

defineAlloysElement('recipe-explorer', RecipeExplorer);
