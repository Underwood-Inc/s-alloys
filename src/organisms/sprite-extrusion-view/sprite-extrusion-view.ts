import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { subscribeExtrusionAnimation } from '../../molecules/sprite-extrusion/extrusionAnimationHub.js';
import { loadExtrusionModel } from '../../molecules/sprite-extrusion/extrusionModelCache.js';
import { renderExtrusion } from '../../molecules/sprite-extrusion/renderExtrusion.js';

/**
 * Canvas host for the sprite-extrusion molecule — reusable anywhere a spinning item is needed.
 */
export class SpriteExtrusionView extends HTMLElement {
  private animationHandle: { setVisible(visible: boolean): void; dispose(): void } | null = null;
  private visibilityObserver: IntersectionObserver | null = null;
  private mountToken = 0;

  static get observedAttributes() {
    return ['src', 'kind', 'size', 'spin', 'alt'];
  }

  connectedCallback() {
    void this.mount();
  }

  disconnectedCallback() {
    this.teardownAnimation();
    this.mountToken += 1;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (!this.isConnected || oldValue === newValue) return;
    if (name === 'alt') {
      this.querySelector('canvas')?.setAttribute('aria-label', newValue ?? '');
      return;
    }
    void this.mount();
  }

  private teardownAnimation() {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = null;
    this.animationHandle?.dispose();
    this.animationHandle = null;
  }

  private resolveCanvasSize(): number {
    const parsed = Number(this.getAttribute('size'));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const measured = Math.round(this.clientWidth || this.parentElement?.clientWidth || 80);
    return Math.max(16, measured);
  }

  private async mount() {
    const token = this.mountToken + 1;
    this.mountToken = token;
    this.teardownAnimation();

    const src = this.getAttribute('src') ?? '';
    const kind = this.getAttribute('kind');
    const size = this.resolveCanvasSize();
    const spin = this.getAttribute('spin') !== 'false';
    const alt = this.getAttribute('alt') ?? '';

    this.className = 'sprite-extrusion-view';

    let canvas = this.querySelector<HTMLCanvasElement>('.sprite-extrusion-view__canvas');
    if (!canvas) {
      this.innerHTML = `
        <canvas
          class="sprite-extrusion-view__canvas"
          width="${size}"
          height="${size}"
          role="img"
          aria-label="${escapeHtml(alt)}"
        ></canvas>
      `;
      canvas = this.querySelector<HTMLCanvasElement>('.sprite-extrusion-view__canvas');
    } else {
      canvas.width = size;
      canvas.height = size;
      canvas.setAttribute('aria-label', alt);
    }

    if (!src || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    try {
      const model = await loadExtrusionModel(src, kind);
      if (token !== this.mountToken) return;

      if (spin) {
        this.animationHandle = subscribeExtrusionAnimation(ctx, model, { width: size, height: size });
        this.visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            this.animationHandle?.setVisible(entry.isIntersecting);
          },
          { rootMargin: '64px' },
        );
        this.visibilityObserver.observe(this);
        return;
      }

      renderExtrusion(ctx, model, { width: size, height: size, yaw: 0 });
    } catch {
      if (token !== this.mountToken) return;
      ctx.clearRect(0, 0, size, size);
    }
  }
}

defineAlloysElement('sprite-extrusion-view', SpriteExtrusionView);
