import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { getItemModel } from '../../molecules/item-model-registry/itemModelRegistry.js';
import { parseSpriteExtrusionKind } from '../../molecules/sprite-extrusion/spriteExtrusionCatalog.js';
import '../sprite-extrusion-view/sprite-extrusion-view.js';

/**
 * Rotating item preview — sprite-extrusion canvas by default, optional glTF/GLB via registry.
 */
export class ItemPreview extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'model-id', 'extrusion-kind', 'alt'];
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
    const kind = parseSpriteExtrusionKind(this.getAttribute('extrusion-kind') ?? undefined);
    const entry = getItemModel(modelId);

    this.className = 'item-preview';

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
      return;
    }

    this.innerHTML = `
      <sprite-extrusion-view
        src="${escapeHtml(icon)}"
        kind="${escapeHtml(kind)}"
        alt="${escapeHtml(alt)}"
      ></sprite-extrusion-view>
    `;
  }
}

defineAlloysElement('item-preview', ItemPreview);
