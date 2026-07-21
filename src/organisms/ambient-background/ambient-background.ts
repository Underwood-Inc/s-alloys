import { defineAlloysElement } from '../../atoms/dom/defineElement.js';
import {
  ambientStarClassName,
  applyStarStyle,
  createAmbientStarfield,
  getAmbientStarfieldCounts,
  type AmbientStarfield,
} from '../../molecules/ambient-starfield/ambientStarfield.js';

export class AlloysAmbientBackground extends HTMLElement {
  private starfield!: AmbientStarfield;
  private initialized = false;

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    this.setAttribute('aria-hidden', 'true');
    this.className = 'ambient';
    this.starfield = createAmbientStarfield(getAmbientStarfieldCounts(window.innerWidth));
    this.render();
  }

  disconnectedCallback() {
    this.initialized = false;
  }

  private render() {
    this.innerHTML = `
      <div class="ambient__sky-effects">
        <div class="ambient__nebula">
          <div class="ambient__nebula-cloud ambient__nebula-cloud--violet"></div>
          <div class="ambient__nebula-cloud ambient__nebula-cloud--gold"></div>
          <div class="ambient__nebula-cloud ambient__nebula-cloud--teal"></div>
        </div>
        <div class="ambient__depth">
          <div class="ambient__depth-layer ambient__depth-layer--one"></div>
          <div class="ambient__depth-layer ambient__depth-layer--two"></div>
          <div class="ambient__depth-layer ambient__depth-layer--three"></div>
        </div>
        <div class="ambient__aurora">
          <div class="ambient__aurora-wash ambient__aurora-wash--primary"></div>
          <div class="ambient__aurora-wash ambient__aurora-wash--secondary"></div>
        </div>
        <div class="ambient__stars">
          <span class="ambient__stars-dust"></span>
          <span class="ambient__stars-medium"></span>
          <span class="ambient__stars-animated"></span>
        </div>
      </div>
    `;
    this.renderStars();
    this.applyDustShadows();
  }

  private renderStars() {
    const host = this.querySelector('.ambient__stars-animated');
    if (!host) return;

    host.replaceChildren();

    for (const star of this.starfield.animatedStars) {
      const element = document.createElement('span');
      element.className = ambientStarClassName(star);
      applyStarStyle(element, star);

      if (star.tier === 'cross') {
        const flare = document.createElement('span');
        flare.className = 'ambient__star-flare';
        element.append(flare);
      }
      if (star.tier === 'spark') {
        const spark = document.createElement('span');
        spark.className = 'ambient__star-spark';
        element.append(spark);
      }

      host.append(element);
    }
  }

  private applyDustShadows() {
    const dust = this.querySelector('.ambient__stars-dust') as HTMLElement | null;
    const medium = this.querySelector('.ambient__stars-medium') as HTMLElement | null;
    if (dust) dust.style.boxShadow = this.starfield.dustBoxShadow;
    if (medium) medium.style.boxShadow = this.starfield.mediumBoxShadow;
  }
}

defineAlloysElement('alloys-ambient-background', AlloysAmbientBackground);
