import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { navigate } from '../../organisms/site-header/site-header.js';
import { GUIDE_ARTICLES, getGuideArticle, renderGuideHtml } from '../../content/guide/guideCatalog.js';
import { currentAppPath, resolveRoute } from '../../app/router.js';
import '../../organisms/recipe-explorer/recipe-explorer.js';
import '../../organisms/fragment-showcase/fragment-showcase.js';

const assetBase = `${import.meta.env.BASE_URL}`;

function chapterNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export class AlloysGuideView extends HTMLElement {
  connectedCallback() {
    window.addEventListener('popstate', () => this.render());
    this.render();
  }

  private bindGuideNav() {
    this.querySelector('.guide-view__back')?.addEventListener('click', (event) => {
      event.preventDefault();
      navigate({ view: 'guide', slug: null });
    });

    this.querySelectorAll('[data-guide-slug]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const slug = (anchor as HTMLElement).dataset.guideSlug;
        if (slug) navigate({ view: 'guide', slug });
      });
    });
  }

  private render() {
    const route = resolveRoute(currentAppPath());
    const slug = route.view === 'guide' ? route.slug : null;
    const article = slug ? getGuideArticle(slug) : null;

    if (article) {
      this.className = 'guide-view guide-view--article';
      this.innerHTML = `
        <header class="guide-view__header">
          <div class="guide-view__header-top">
            <a class="guide-view__back" href="${assetBase}guide">← Guide</a>
            <span class="guide-view__eyebrow">Player guide</span>
          </div>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="guide-view__summary">${escapeHtml(article.summary)}</p>
        </header>
        <article class="guide-view__body">${renderGuideHtml(article.body, assetBase)}</article>
      `;
      this.bindGuideNav();
      return;
    }

    this.className = 'guide-view guide-view--index';
    this.innerHTML = `
      <header class="guide-view__lead">
        <h1>Player guide</h1>
        <p>Choose a topic below. Each icon opens a chapter — install steps, alloy reference, crafting, and the playtest checklist.</p>
      </header>
      <nav class="guide-view__chapters" aria-label="Guide chapters">
        ${GUIDE_ARTICLES.map((item, index) => `
          <a
            href="${assetBase}guide/${item.slug}"
            data-guide-slug="${item.slug}"
            class="guide-view__chapter"
          >
            <img
              src="${assetBase}${item.cardImage}"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span class="guide-view__chapter-num">Chapter ${chapterNumber(index)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="guide-view__chapter-summary">${escapeHtml(item.summary)}</p>
          </a>
        `).join('')}
      </nav>
    `;

    this.bindGuideNav();
  }
}

defineAlloysElement('alloys-guide-view', AlloysGuideView);
