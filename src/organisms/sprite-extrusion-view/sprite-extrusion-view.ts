import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { buildExtrusionModel } from '../../molecules/sprite-extrusion/buildExtrusionModel.js';
import { parseSpriteExtrusionKind } from '../../molecules/sprite-extrusion/spriteExtrusionCatalog.js';
import { renderExtrusion } from '../../molecules/sprite-extrusion/renderExtrusion.js';
import { startExtrusionLoop } from '../../molecules/sprite-extrusion/spriteExtrusionRunner.js';
import { loadSpriteImageData } from '../../plugs/browser/spriteBitmapBrowser.js';

/**
 * Canvas host for the sprite-extrusion molecule — reusable anywhere a spinning item is needed.
 */
export class SpriteExtrusionView extends HTMLElement {
  private stopLoop: (() => void) | null = null;

  static get observedAttributes() {
    return ['src', 'kind', 'size', 'spin', 'alt'];
  }

  connectedCallback() {
    void this.mount();
  }

  disconnectedCallback() {
    this.stopLoop?.();
    this.stopLoop = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.mount();
  }

  private resolveCanvasSize(): number {
    const parsed = Number(this.getAttribute('size'));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const measured = Math.round(this.clientWidth || this.parentElement?.clientWidth || 80);
    return Math.max(16, measured);
  }

  private async mount() {
    this.stopLoop?.();
    this.stopLoop = null;

    const src = this.getAttribute('src') ?? '';
    const kind = parseSpriteExtrusionKind(this.getAttribute('kind') ?? undefined);
    const size = this.resolveCanvasSize();
    const spin = this.getAttribute('spin') !== 'false';
    const alt = this.getAttribute('alt') ?? '';

    this.className = 'sprite-extrusion-view';
    this.innerHTML = `
      <canvas
        class="sprite-extrusion-view__canvas"
        width="${size}"
        height="${size}"
        role="img"
        aria-label="${escapeHtml(alt)}"
      ></canvas>
    `;

    if (!src) return;

    const canvas = this.querySelector<HTMLCanvasElement>('.sprite-extrusion-view__canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    try {
      const sprite = await loadSpriteImageData(src);
      const model = buildExtrusionModel(sprite, { kind });
      if (spin) {
        this.stopLoop = startExtrusionLoop(ctx, model, { width: size, height: size });
        return;
      }
      renderExtrusion(ctx, model, { width: size, height: size, yaw: 0 });
    } catch {
      ctx.clearRect(0, 0, size, size);
    }
  }
}

defineAlloysElement('sprite-extrusion-view', SpriteExtrusionView);
