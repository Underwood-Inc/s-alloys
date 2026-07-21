import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { getItemModel } from '../../molecules/item-model-registry/itemModelRegistry.js';

/**
 * Rotating item preview — CSS sprite extrusion by default, optional glTF/GLB via registry.
 */
export class ItemPreview extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'model-id', 'alt'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private render() {
    const icon = this.getAttribute('icon') ?? '';
    const modelId = this.getAttribute('model-id') ?? undefined;
    const alt = this.getAttribute('alt') ?? '';
    const entry = getItemModel(modelId);

    this.className = 'item-preview';

    if (entry?.kind === 'gltf' && entry.src) {
      this.innerHTML = `
        <model-viewer
          class="item-preview__gltf"
          src="${escapeHtml(entry.src)}"
          alt="${escapeHtml(alt)}"
          auto-rotate
          rotation-per-second="28deg"
          interaction-prompt="none"
          shadow-intensity="0.85"
          environment-image="neutral"
          exposure="1.1"
          camera-controls="false"
          touch-action="none"
          aria-hidden="${alt ? 'false' : 'true'}"
        ></model-viewer>
        <img class="item-preview__fallback" src="${escapeHtml(entry.sprite || icon)}" alt="${escapeHtml(alt)}" />
      `;
      return;
    }

    this.innerHTML = `
      <div class="item-preview__stage" aria-hidden="${alt ? 'false' : 'true'}">
        <div class="item-preview__extrude">
          <img class="item-preview__sprite item-preview__sprite--back" src="${escapeHtml(icon)}" alt="" />
          <img class="item-preview__sprite item-preview__sprite--face" src="${escapeHtml(icon)}" alt="${escapeHtml(alt)}" />
        </div>
      </div>
    `;
  }
}

defineAlloysElement('item-preview', ItemPreview);
