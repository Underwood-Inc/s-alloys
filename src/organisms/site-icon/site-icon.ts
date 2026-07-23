import { defineAlloysElement } from '../../atoms/dom/defineElement.js';
import {
  HERO_ALLOY_FRAMES,
  displayPixelsForSize,
  defaultStaticPixelsForSize,
  heroFrameUrl,
  staticIconUrl,
  type SiteIconSize,
  type SiteIconVariant,
  type StaticIconPixels,
} from '../../molecules/site-icon/siteIconCatalog.js';

const HERO_FRAME_MS = 1400;
const HERO_FADE_MS = 480;
const LAZY_ROOT_MARGIN = '120px';

export class AlloysSiteIcon extends HTMLElement {
  #cycleTimer: number | undefined;
  #frameTransition = false;
  #frameIndex = 0;
  #activated = false;
  #observer: IntersectionObserver | undefined;

  static get observedAttributes(): string[] {
    return ['variant', 'size', 'pixels'];
  }

  connectedCallback(): void {
    this.classList.add('site-icon', `site-icon--${this.readSize()}`, `site-icon--${this.readVariant()}`);
    this.renderShell();

    if (this.readSize() === 'nav') {
      this.activate();
      return;
    }

    this.#observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          this.activate();
        } else {
          this.deactivate();
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
    this.#observer.observe(this);
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.deactivate();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.className = '';
    this.classList.add('site-icon', `site-icon--${this.readSize()}`, `site-icon--${this.readVariant()}`);
    this.deactivate();
    this.#activated = false;
    this.renderShell();
    this.#observer?.observe(this);
  }

  private readVariant(): SiteIconVariant {
    return this.getAttribute('variant') === 'cycle' ? 'cycle' : 'static';
  }

  private readSize(): SiteIconSize {
    const size = this.getAttribute('size');
    if (size === 'nav' || size === 'md' || size === 'lg' || size === 'hero') {
      return size;
    }
    return this.readVariant() === 'cycle' ? 'hero' : 'nav';
  }

  private readStaticPixels(): StaticIconPixels {
    const pixels = Number(this.getAttribute('pixels'));
    if (pixels === 64 || pixels === 192 || pixels === 512) {
      return pixels;
    }
    return defaultStaticPixelsForSize(this.readSize());
  }

  private renderShell(): void {
    const pixels = displayPixelsForSize(this.readSize());

    if (this.readVariant() === 'cycle') {
      this.innerHTML = `<div class="site-icon__cycle" aria-hidden="true"></div>`;
      return;
    }

    this.innerHTML = `
      <img
        class="site-icon__static"
        alt=""
        width="${pixels}"
        height="${pixels}"
        decoding="async"
      />
    `;
  }

  private activate(): void {
    if (this.#activated) return;
    this.#activated = true;

    if (this.readVariant() === 'static') {
      this.mountStatic();
      return;
    }

    this.mountCycle();
    this.startCycle();
  }

  private deactivate(): void {
    this.stopCycle();
  }

  private mountStatic(): void {
    const img = this.querySelector<HTMLImageElement>('.site-icon__static');
    if (!img || img.dataset.loaded === 'true') return;

    const size = this.readSize();
    img.loading = size === 'nav' ? 'eager' : 'lazy';
    if (size === 'nav') {
      img.fetchPriority = 'high';
    }
    img.src = staticIconUrl(this.readStaticPixels());
    img.dataset.loaded = 'true';
    img.addEventListener('error', () => {
      img.src = staticIconUrl(512);
    }, { once: true });
  }

  private mountCycle(): void {
    const host = this.querySelector<HTMLElement>('.site-icon__cycle');
    if (!host || host.childElementCount > 0) return;

    const pixels = displayPixelsForSize(this.readSize());
    host.innerHTML = HERO_ALLOY_FRAMES.map((alloy, index) => `
      <img
        class="site-icon__frame${index === 0 ? ' is-active' : ''}"
        data-src="${heroFrameUrl(alloy)}"
        width="${pixels}"
        height="${pixels}"
        alt=""
        decoding="async"
        ${index === 0 ? 'loading="eager"' : 'loading="lazy"'}
      />
    `).join('');

    const frames = [...host.querySelectorAll<HTMLImageElement>('.site-icon__frame')];
    const loadFrame = (frame: HTMLImageElement) => {
      if (frame.dataset.loaded === 'true') return;
      const src = frame.dataset.src;
      if (!src) return;
      frame.src = src;
      frame.dataset.loaded = 'true';
      frame.removeAttribute('data-src');
    };

    frames.forEach((frame, index) => {
      if (index === 0) {
        loadFrame(frame);
      }
      frame.addEventListener('error', () => {
        frame.src = staticIconUrl(512);
      }, { once: true });
    });

    const preloadRest = () => {
      frames.slice(1).forEach(loadFrame);
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(preloadRest, { timeout: 2000 });
    } else {
      globalThis.setTimeout(preloadRest, 300);
    }
  }

  private startCycle(): void {
    if (this.readVariant() !== 'cycle') return;

    const frames = this.querySelectorAll<HTMLImageElement>('.site-icon__frame');
    if (frames.length < 2 || this.#cycleTimer !== undefined) return;

    this.#cycleTimer = window.setInterval(() => this.advanceFrame(frames), HERO_FRAME_MS);
  }

  private stopCycle(): void {
    if (this.#cycleTimer === undefined) return;
    window.clearInterval(this.#cycleTimer);
    this.#cycleTimer = undefined;
    this.#frameTransition = false;
  }

  private advanceFrame(frames: NodeListOf<HTMLImageElement>): void {
    if (frames.length < 2 || this.#frameTransition) return;

    const current = frames[this.#frameIndex];
    const nextIndex = (this.#frameIndex + 1) % frames.length;
    const next = frames[nextIndex];

    const nextSrc = next.dataset.src;
    if (nextSrc && next.dataset.loaded !== 'true') {
      next.src = nextSrc;
      next.dataset.loaded = 'true';
      next.removeAttribute('data-src');
    }

    this.#frameTransition = true;
    current?.classList.remove('is-active');
    current?.classList.add('is-under');
    next?.classList.add('is-active');

    window.setTimeout(() => {
      current?.classList.remove('is-under');
      this.#frameIndex = nextIndex;
      this.#frameTransition = false;
    }, HERO_FADE_MS);
  }
}

defineAlloysElement('alloys-site-icon', AlloysSiteIcon);
