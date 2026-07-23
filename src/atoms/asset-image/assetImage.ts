import { defineAlloysElement } from '../dom/defineElement.js';

/**
 * Image host with a shared loading shimmer — layout-neutral grid stack so CSS
 * written for plain <img> keeps working on the host.
 */
export class AlloysAssetImage extends HTMLElement {
  private img: HTMLImageElement | null = null;
  private loadToken = 0;

  static get observedAttributes(): string[] {
    return ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'fetchpriority', 'title', 'fit'];
  }

  connectedCallback(): void {
    this.classList.add('asset-image');
    this.ensureStructure();
    this.bindImage();
  }

  disconnectedCallback(): void {
    this.loadToken += 1;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.isConnected || oldValue === newValue) return;
    if (name === 'src') {
      this.bindImage();
      return;
    }
    if (name !== 'fit') {
      this.syncImageAttributes();
    }
  }

  private ensureStructure(): void {
    if (this.querySelector('.asset-image__img')) {
      this.img = this.querySelector<HTMLImageElement>('.asset-image__img');
      return;
    }

    this.innerHTML = `
      <span class="asset-image__loader" aria-hidden="true"></span>
      <img class="asset-image__img" alt="" decoding="async" />
    `;
    this.img = this.querySelector<HTMLImageElement>('.asset-image__img');
  }

  private syncImageAttributes(): void {
    const img = this.img ?? this.querySelector<HTMLImageElement>('.asset-image__img');
    if (!img) return;

    const alt = this.getAttribute('alt') ?? '';
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    const loading = this.getAttribute('loading');
    const decoding = this.getAttribute('decoding');
    const fetchpriority = this.getAttribute('fetchpriority');
    const title = this.getAttribute('title');
    const fit = this.getAttribute('fit') ?? 'contain';

    img.alt = alt;
    img.title = title ?? '';
    img.style.objectFit = fit;

    if (width) img.setAttribute('width', width);
    else img.removeAttribute('width');

    if (height) img.setAttribute('height', height);
    else img.removeAttribute('height');

    if (loading) img.loading = loading as HTMLImageElement['loading'];
    else img.removeAttribute('loading');

    if (decoding) img.decoding = decoding as HTMLImageElement['decoding'];
    else img.removeAttribute('decoding');

    if (fetchpriority) img.setAttribute('fetchpriority', fetchpriority);
    else img.removeAttribute('fetchpriority');
  }

  private setState(state: 'loading' | 'loaded' | 'error'): void {
    this.dataset.state = state;
  }

  private bindImage(): void {
    const img = this.img ?? this.querySelector<HTMLImageElement>('.asset-image__img');
    if (!img) return;
    this.img = img;

    const token = this.loadToken + 1;
    this.loadToken = token;
    this.syncImageAttributes();

    const src = this.getAttribute('src') ?? '';
    if (!src) {
      this.setState('loading');
      img.removeAttribute('src');
      return;
    }

    const finish = () => {
      if (token !== this.loadToken) return;
      if (img.naturalWidth > 0) {
        this.setState('loaded');
        return;
      }
      this.setState('error');
      this.dispatchEvent(new Event('error'));
    };

    const assignSrc = () => {
      if (img.src !== src) {
        img.src = src;
      }
      if (img.complete) {
        finish();
      }
    };

    img.onload = () => {
      if (img.decode) {
        void img.decode().then(finish).catch(finish);
        return;
      }
      finish();
    };
    img.onerror = () => {
      if (token !== this.loadToken) return;
      this.setState('error');
      this.dispatchEvent(new Event('error'));
    };

    this.setState('loading');
    assignSrc();
  }
}

defineAlloysElement('alloys-image', AlloysAssetImage);
