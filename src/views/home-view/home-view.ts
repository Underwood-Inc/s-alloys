import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { navigate } from '../../organisms/site-header/site-header.js';
import '../../organisms/site-icon/site-icon.js';

const assetBase = `${import.meta.env.BASE_URL}`;

const GUIDE_CHAPTERS = [
  {
    slug: 'install',
    image: 'guide/chapters/install.png',
    label: 'Chapter 01',
    title: 'Install Alloys',
    summary: 'Datapack, resource pack, and your first world restart.',
  },
  {
    slug: 'alloys',
    image: 'guide/chapters/alloys.png',
    label: 'Chapter 02',
    title: 'The ten alloys',
    summary: 'Every metal, every recipe — interactive ingot and gear browser.',
  },
  {
    slug: 'crafting',
    image: 'guide/chapters/crafting.png',
    label: 'Chapter 03',
    title: 'Crafting alloy gear',
    summary: 'What valid crafts look like and what the game should refuse.',
  },
] as const;

export class AlloysHomeView extends HTMLElement {
  connectedCallback() {
    this.className = 'home-view';
    this.innerHTML = `
      <section class="home-view__hero">
        <div class="home-view__copy">
          <span class="home-view__eyebrow">Minecraft 26.2 · Player guide</span>
          <h1>Learn the metals.<br />Craft with clarity.</h1>
          <p class="home-view__lead">Your field guide to Alloys — install steps, all ten metals, shaped recipes, and crafting rules written for players. Teams can also use the built-in playtest checklist when they need one.</p>
          <div class="home-view__actions">
            <button class="btn btn--primary" data-go="guide">Open the guide</button>
            <button class="btn btn--ghost" data-go="checklist">Playtest checklist</button>
          </div>
        </div>
        <div class="home-view__visual" aria-hidden="true">
          <div class="home-view__visual-glow"></div>
          <alloys-site-icon variant="cycle" size="hero"></alloys-site-icon>
        </div>
      </section>

      <section class="home-view__explore" aria-labelledby="home-explore-title">
        <header class="home-view__explore-head">
          <h2 id="home-explore-title">Start with the guide</h2>
          <p>Three chapters cover everything you need in-game. Each opens with artwork you can click straight through.</p>
        </header>
        <div class="home-view__cards">
          ${GUIDE_CHAPTERS.map((chapter) => `
            <button type="button" class="home-view__card" data-guide-slug="${chapter.slug}">
              <img
                src="${assetBase}${chapter.image}"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span class="home-view__card-label">${escapeHtml(chapter.label)}</span>
              <h3>${escapeHtml(chapter.title)}</h3>
              <p>${escapeHtml(chapter.summary)}</p>
            </button>
          `).join('')}
        </div>
      </section>

      <aside class="home-view__qa" aria-labelledby="home-qa-title">
        <button type="button" class="home-view__qa-visual" data-go="checklist" aria-label="Open playtest checklist">
          <img
            src="${assetBase}guide/chapters/checklist.png"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </button>
        <div class="home-view__qa-copy">
          <span class="home-view__qa-eyebrow">For teams</span>
          <h2 id="home-qa-title">Playtest checklist</h2>
          <p>281 structured cases when you are validating a world or hunting regressions. Pass, fail, skip, export CSV — optional, separate from the player guide.</p>
          <button class="btn btn--ghost btn--sm" data-go="checklist">Open checklist</button>
        </div>
      </aside>
    `;

    this.querySelectorAll('[data-go]').forEach((el) => {
      el.addEventListener('click', () => {
        const target = (el as HTMLElement).dataset.go;
        if (target === 'checklist') navigate({ view: 'checklist' });
        if (target === 'guide') navigate({ view: 'guide', slug: null });
      });
    });

    this.querySelectorAll('[data-guide-slug]').forEach((el) => {
      el.addEventListener('click', () => {
        const slug = (el as HTMLElement).dataset.guideSlug;
        if (slug) navigate({ view: 'guide', slug });
      });
    });
  }
}

defineAlloysElement('alloys-home-view', AlloysHomeView);
