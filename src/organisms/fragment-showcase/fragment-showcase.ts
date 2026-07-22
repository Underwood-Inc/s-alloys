import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { buildRecipeForTab } from '../../molecules/recipe-catalog/index.js';
import { fragmentShowcaseEntries } from '../../molecules/recipe-catalog/fragmentShowcaseCatalog.js';
import { bindSharedViewportPanel } from '../../molecules/viewport-tooltip/bindSharedViewportPanel.js';
import '../crafting-grid/crafting-grid.js';
import '../item-preview/item-preview.js';

/**
 * Guide fragment list — 3D previews with hover flyout for nine-fragment combine recipes.
 */
export class FragmentShowcase extends HTMLElement {
  private panelCleanup: (() => void) | null = null;

  static get observedAttributes() {
    return ['asset-base'];
  }

  connectedCallback() {
    this.paint();
  }

  disconnectedCallback() {
    this.panelCleanup?.();
    this.panelCleanup = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.paint();
  }

  private paint() {
    this.panelCleanup?.();
    this.render();
    this.bindRecipePanel();
  }

  private assetBase(): string {
    const base = this.getAttribute('asset-base') ?? '/';
    return base.endsWith('/') ? base : `${base}/`;
  }

  private render() {
    const baseUrl = this.assetBase();
    const entries = fragmentShowcaseEntries();

    this.className = 'fragment-showcase';
    this.innerHTML = `
      <ul class="fragment-showcase__list" role="list">
        ${entries.map(({ alloy, vein }) => {
          const icon = `${baseUrl}guide/fragments/${alloy.id}.png`;
          return `
            <li class="fragment-showcase__item">
              <div class="fragment-showcase__row">
                <button
                  type="button"
                  class="fragment-showcase__trigger"
                  data-alloy-id="${escapeHtml(alloy.id)}"
                  aria-expanded="false"
                  aria-label="${escapeHtml(alloy.name)} fragment recipe"
                >
                  <item-preview
                    class="fragment-showcase__preview"
                    icon="${escapeHtml(icon)}"
                    model-id="fragment:${escapeHtml(alloy.id)}"
                    alt=""
                  ></item-preview>
                </button>
                <span class="fragment-showcase__copy">
                  <strong class="fragment-showcase__name">${escapeHtml(alloy.name)}</strong>
                  <span class="fragment-showcase__vein">— ${escapeHtml(vein)}</span>
                </span>
              </div>
            </li>
          `;
        }).join('')}
      </ul>
      <div
        class="fragment-showcase__flyout viewport-anchored-panel"
        data-viewport-tooltip-panel
        role="dialog"
        aria-label="Fragment combine recipe"
        hidden
      >
        <crafting-grid class="fragment-showcase__grid" asset-base="${escapeHtml(baseUrl)}"></crafting-grid>
      </div>
    `;
  }

  private bindRecipePanel() {
    const panel = this.querySelector<HTMLElement>('.fragment-showcase__flyout');
    const triggers = [...this.querySelectorAll<HTMLElement>('.fragment-showcase__trigger')];
    const grid = this.querySelector<HTMLElement & { recipe?: ReturnType<typeof buildRecipeForTab> }>('crafting-grid');
    if (!panel || !triggers.length || !grid) return;

    const baseUrl = this.assetBase();

    this.panelCleanup = bindSharedViewportPanel({
      triggers,
      panel,
      anchorOptions: { preferred: ['right', 'bottom', 'left', 'top'] },
      onActivate: (trigger) => {
        const alloyId = trigger.dataset.alloyId;
        const entry = fragmentShowcaseEntries().find((row) => row.alloy.id === alloyId);
        if (!entry) return;
        grid.recipe = buildRecipeForTab(entry.alloy, 'fragment', baseUrl);
      },
    });
  }
}

defineAlloysElement('fragment-showcase', FragmentShowcase);
