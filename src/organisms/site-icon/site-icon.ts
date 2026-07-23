import { defineAlloysElement } from '../../atoms/dom/defineElement.js';
import { renderAssetImage } from '../../atoms/asset-image/renderAssetImage.js';
import {
  HERO_ALLOY_FRAMES,
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
    if (this.readVariant() === 'cycle') {
      this.innerHTML = `<div class="site-icon__cycle" aria-hidden="true"></div>`;
      return;
    }

    this.innerHTML = renderAssetImage({
      src: '',
      alt: '',
      decoding: 'async',
      class: 'site-icon__static',
      fit: 'contain',
    });
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
    const host = this.querySelector<HTMLElement>('alloys-image.site-icon__static');
    if (!host || host.dataset.loaded === 'true') return;

    const size = this.readSize();
    if (size === 'nav') {
      host.setAttribute('loading', 'eager');
      host.setAttribute('fetchpriority', 'high');
    } else {
      host.setAttribute('loading', 'lazy');
    }
    host.setAttribute('src', staticIconUrl(this.readStaticPixels()));
    host.dataset.loaded = 'true';
    host.addEventListener('error', () => {
      host.setAttribute('src', staticIconUrl(512));
    }, { once: true });
  }

  private mountCycle(): void {
    const host = this.querySelector<HTMLElement>('.site-icon__cycle');
    if (!host || host.childElementCount > 0) return;

    host.innerHTML = HERO_ALLOY_FRAMES.map((alloy, index) => renderAssetImage({
      src: index === 0 ? heroFrameUrl(alloy) : '',
      dataSrc: index === 0 ? undefined : heroFrameUrl(alloy),
      alt: '',
      decoding: 'async',
      loading: index === 0 ? 'eager' : 'lazy',
      class: `site-icon__frame${index === 0 ? ' is-active' : ''}`,
      fit: 'contain',
    })).join('');

    const frames = [...host.querySelectorAll<HTMLElement>('alloys-image.site-icon__frame')];
    const loadFrame = (frame: HTMLElement) => {
      if (frame.dataset.loaded === 'true') return;
      const src = frame.getAttribute('data-src');
      if (!src) return;
      frame.setAttribute('src', src);
      frame.dataset.loaded = 'true';
      frame.removeAttribute('data-src');
    };

    frames.forEach((frame, index) => {
      if (index === 0) {
        frame.dataset.loaded = 'true';
      }
      frame.addEventListener('error', () => {
        frame.setAttribute('src', staticIconUrl(512));
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

    const frames = this.querySelectorAll('alloys-image.site-icon__frame');
    if (frames.length < 2 || this.#cycleTimer !== undefined) return;

    this.#cycleTimer = window.setInterval(() => this.advanceFrame(frames), HERO_FRAME_MS);
  }

  private stopCycle(): void {
    if (this.#cycleTimer === undefined) return;
    window.clearInterval(this.#cycleTimer);
    this.#cycleTimer = undefined;
    this.#frameTransition = false;
  }

  private advanceFrame(frames: NodeListOf<Element>): void {
    if (frames.length < 2 || this.#frameTransition) return;

    const current = frames[this.#frameIndex] as HTMLElement;
    const nextIndex = (this.#frameIndex + 1) % frames.length;
    const next = frames[nextIndex] as HTMLElement;

    const nextSrc = next.getAttribute('data-src');
    if (nextSrc && next.dataset.loaded !== 'true') {
      next.setAttribute('src', nextSrc);
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
