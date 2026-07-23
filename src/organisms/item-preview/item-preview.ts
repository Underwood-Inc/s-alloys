import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { getItemModel } from '../../molecules/item-model-registry/itemModelRegistry.js';
import { openRecipeExplorer } from '../../molecules/recipe-explorer/openRecipeExplorer.js';
import { recipeSelectionFromPreview } from '../../molecules/recipe-selection/recipeSelection.js';
import { parseSpriteExtrusionKind } from '../../molecules/sprite-extrusion/spriteExtrusionCatalog.js';
import type { RecipeTabId } from '../../molecules/recipe-catalog/alloysRecipeCatalog.js';
import '../sprite-extrusion-view/sprite-extrusion-view.js';

/**
 * Rotating item preview — sprite-extrusion canvas by default, optional glTF/GLB via registry.
 * Click navigable previews to open the matching recipe in the explorer.
 */
export class ItemPreview extends HTMLElement {
  private navigationCleanup: (() => void) | null = null;

  static get observedAttributes() {
    return ['icon', 'model-id', 'extrusion-kind', 'alt', 'recipe-alloy', 'recipe-tab', 'navigate'];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.navigationCleanup?.();
    this.navigationCleanup = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private shouldNavigate(): boolean {
    return this.getAttribute('navigate') !== 'false';
  }

  private bindNavigation() {
    this.navigationCleanup?.();
    this.navigationCleanup = null;

    if (!this.shouldNavigate()) return;

    const modelId = this.getAttribute('model-id') ?? undefined;
    const icon = this.getAttribute('icon') ?? '';
    const alloyId = this.getAttribute('recipe-alloy') ?? undefined;
    const tab = (this.getAttribute('recipe-tab') ?? undefined) as RecipeTabId | undefined;
    const selection = recipeSelectionFromPreview({ modelId, icon, alloyId, tab });

    if (!selection) {
      this.classList.remove('item-preview--navigable');
      this.removeAttribute('role');
      this.removeAttribute('tabindex');
      this.removeAttribute('title');
      return;
    }

    this.classList.add('item-preview--navigable');
    this.setAttribute('role', 'button');
    this.tabIndex = 0;
    this.setAttribute('title', 'Open in recipe explorer');

    const activate = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      openRecipeExplorer(selection);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      activate(event);
    };

    this.addEventListener('click', activate);
    this.addEventListener('keydown', onKeyDown);
    this.navigationCleanup = () => {
      this.removeEventListener('click', activate);
      this.removeEventListener('keydown', onKeyDown);
    };
  }

  private render() {
    const icon = this.getAttribute('icon') ?? '';
    const modelId = this.getAttribute('model-id') ?? undefined;
    const alt = this.getAttribute('alt') ?? '';
    const kind = parseSpriteExtrusionKind(this.getAttribute('extrusion-kind') ?? undefined);
    const entry = getItemModel(modelId);

    this.classList.add('item-preview');

    if (entry?.kind === 'gltf' && entry.src) {
      this.innerHTML = `
        <model-viewer
          class="item-preview__gltf"
          src="${escapeHtml(entry.src)}"
          alt="${escapeHtml(alt)}"
          auto-rotate
          rotation-per-second="36deg"
          camera-orbit="0deg 90deg auto"
          min-camera-orbit="auto 90deg auto"
          max-camera-orbit="auto 90deg auto"
          interaction-prompt="none"
          shadow-intensity="0.85"
          environment-image="neutral"
          exposure="1.1"
          camera-controls="false"
          touch-action="none"
          aria-hidden="${alt ? 'false' : 'true'}"
        ></model-viewer>
        <sprite-extrusion-view
          class="item-preview__fallback"
          src="${escapeHtml(entry.sprite || icon)}"
          kind="${escapeHtml(kind)}"
          alt="${escapeHtml(alt)}"
        ></sprite-extrusion-view>
      `;
      this.bindNavigation();
      return;
    }

    this.innerHTML = `
      <sprite-extrusion-view
        src="${escapeHtml(icon)}"
        kind="${escapeHtml(kind)}"
        alt="${escapeHtml(alt)}"
      ></sprite-extrusion-view>
    `;
    this.bindNavigation();
  }
}

defineAlloysElement('item-preview', ItemPreview);
