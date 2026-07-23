import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { highlightSearchText } from '../../atoms/highlightSearchText.js';
import { renderAssetImage } from '../../atoms/asset-image/renderAssetImage.js';
import { hideGameTooltip, showGameTooltip } from '../../atoms/tooltip/dispatchTooltip.js';
import { assetUrl } from '../../lib/assetUrl.js';
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
import { resolveRecipeExplorerSearch } from '../../molecules/recipe-search/filterRecipeExplorer.js';
import { setActiveRecipeSearchQuery } from '../../molecules/recipe-search/activeRecipeSearchQuery.js';
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
  private searchQuery = '';
  private shellReady = false;
  private searchDebounce?: ReturnType<typeof setTimeout>;

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

  disconnectedCallback() {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
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
        <div class="recipe-explorer__search">
          <label class="recipe-explorer__search-label">
            <span class="recipe-explorer__search-sr">Search recipes</span>
            <input
              type="search"
              class="recipe-explorer__search-input"
              placeholder="Search recipes, effects, materials…"
              autocomplete="off"
              spellcheck="false"
              aria-describedby="recipe-explorer-search-hint"
            />
          </label>
          <p id="recipe-explorer-search-hint" class="recipe-explorer__search-hint">
            Words combine with AND · <code>|</code> for OR · quotes for exact phrases · <code>pick*</code> prefix
          </p>
          <p class="recipe-explorer__search-stats" aria-live="polite" hidden></p>
        </div>

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

    const searchInput = this.querySelector<HTMLInputElement>('.recipe-explorer__search-input');
    searchInput?.addEventListener('input', () => {
      if (this.searchDebounce) clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.searchQuery = searchInput.value;
        this.refresh();
      }, 180);
    });
    searchInput?.addEventListener('search', () => {
      if (this.searchDebounce) clearTimeout(this.searchDebounce);
      this.searchQuery = searchInput.value;
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
      const icon = assetUrl(`guide/ingots/${id}.png`, baseUrl);
      const tooltip = selectionTooltip(entry, 'ingot', baseUrl);
      tooltip.icon = icon;
      tooltip.title = `${entry.name} Ingot`;

      const openHover = () => showGameTooltip(element, tooltip, 'hover');
      const openFocus = () => showGameTooltip(element, tooltip, 'focus');
      const close = () => hideGameTooltip(element);
      const navigate = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        openRecipeExplorer({ alloyId: id, tab: 'ingot' });
      };
      element.onmouseenter = openHover;
      element.onfocus = openFocus;
      element.onmouseleave = close;
      element.onblur = close;
      element.onclick = navigate;
    });

    this.querySelectorAll<HTMLElement>('[data-tab-id]').forEach((element) => {
      const tabId = element.dataset.tabId as RecipeTabId | undefined;
      if (!tabId) return;
      const tooltip = selectionTooltip(alloy, tabId, baseUrl);
      const openHover = () => showGameTooltip(element, tooltip, 'hover');
      const openFocus = () => showGameTooltip(element, tooltip, 'focus');
      const close = () => hideGameTooltip(element);
      const navigate = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        openRecipeExplorer({ alloyId: alloy.id, tab: tabId });
      };
      element.onmouseenter = openHover;
      element.onfocus = openFocus;
      element.onmouseleave = close;
      element.onblur = close;
      element.onclick = navigate;
    });
  }

  private refresh() {
    const baseUrl = this.assetBase();
    setActiveRecipeSearchQuery(this.searchQuery);
    const search = resolveRecipeExplorerSearch(this.searchQuery, {
      alloyId: this.alloyId,
      tab: this.tab,
    });
    this.alloyId = search.selection.alloyId;
    this.tab = search.selection.tab;

    const alloy = this.currentAlloy();
    const tabs = recipeTabsForAlloy(alloy);
    if (!tabs.includes(this.tab)) this.tab = tabs[0];
    const recipe = buildRecipeForTab(alloy, this.tab, baseUrl);
    const navTiles = recipeNavTiles(tabs, baseUrl, alloy.id);

    const searchInput = this.querySelector<HTMLInputElement>('.recipe-explorer__search-input');
    if (searchInput && searchInput.value !== this.searchQuery) {
      searchInput.value = this.searchQuery;
    }

    const searchStats = this.querySelector<HTMLElement>('.recipe-explorer__search-stats');
    if (searchStats) {
      if (search.hasQuery) {
        const noun = search.matchCount === 1 ? 'match' : 'matches';
        searchStats.textContent = search.matchCount === 0
          ? 'No recipes match that search.'
          : `${search.matchCount} recipe ${noun}`;
        searchStats.hidden = false;
      } else {
        searchStats.textContent = '';
        searchStats.hidden = true;
      }
    }

    const ingotRow = this.querySelector('.recipe-explorer__row--ingots');
    if (ingotRow) {
      ingotRow.innerHTML = ALLOY_CATALOG.map((entry) => {
        if (!search.visibleAlloyIds.has(entry.id)) return '';
        const active = entry.id === this.alloyId;
        const icon = assetUrl(`guide/ingots/${entry.id}.png`, baseUrl);
        return `
          <button
            type="button"
            class="recipe-explorer__chip${active ? ' is-active' : ''}"
            data-alloy-id="${escapeHtml(entry.id)}"
            aria-pressed="${active}"
            aria-label="${escapeHtml(entry.name)}"
          >
            ${renderAssetImage({
              src: icon,
              alt: '',
              loading: 'lazy',
              fit: 'contain',
            })}
          </button>
        `;
      }).join('');
    }

    const highlight = this.searchQuery.trim();

    const kindRow = this.querySelector('.recipe-explorer__row--kinds');
    if (kindRow) {
      kindRow.innerHTML = navTiles.map((tile) => {
        if (!search.visibleTabIds.has(tile.id)) return '';
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
            ${renderAssetImage({
              src: tile.icon,
              alt: '',
              loading: 'lazy',
              fit: 'contain',
            })}
            <span class="recipe-explorer__kind-label">${highlight ? highlightSearchText(tile.label, highlight) : escapeHtml(tile.label)}</span>
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
    if (previewTitle) {
      previewTitle.innerHTML = highlight
        ? highlightSearchText(selectionTitle(alloy, this.tab), highlight)
        : escapeHtml(selectionTitle(alloy, this.tab));
    }

    const previewSub = this.querySelector('.recipe-explorer__preview-sub');
    if (previewSub) {
      previewSub.innerHTML = highlight
        ? highlightSearchText(selectionSubtitle(alloy, this.tab), highlight)
        : escapeHtml(selectionSubtitle(alloy, this.tab));
    }

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
