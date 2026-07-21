import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { currentAppPath, resolveRoute, routeToPath, type AppRoute } from '../../app/router.js';
import '../../organisms/site-icon/site-icon.js';

const base = import.meta.env.BASE_URL;

export class AlloysSiteHeader extends HTMLElement {
  connectedCallback() {
    this.className = 'site-header';
    this.innerHTML = `
      <div class="site-header__inner">
        <a class="site-header__brand" href="${base}">
          <alloys-site-icon variant="cycle" size="nav"></alloys-site-icon>
          <span class="site-header__brand-text">
            <span class="site-header__brand-name">Alloys</span>
            <span class="site-header__subtitle">Minecraft 26.2</span>
          </span>
        </a>
        <nav>
          <a class="nav-link" data-view="home" href="${base}">Home</a>
          <a class="nav-link" data-view="guide" href="${base}guide">Guide</a>
          <a class="nav-link" data-view="checklist" href="${base}checklist">Checklist</a>
        </nav>
      </div>
    `;
    this.updateActiveNav();
    window.addEventListener('popstate', () => this.updateActiveNav());
  }

  private updateActiveNav() {
    const route = resolveRoute(currentAppPath());
    this.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
      const view = link.dataset.view;
      link.classList.toggle('active', view === route.view);
    });
  }
}

defineAlloysElement('alloys-site-header', AlloysSiteHeader);

export function navigate(route: AppRoute) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const suffix = routeToPath(route);
  const path = suffix === '/' ? `${basePath}/` : `${basePath}${suffix}`;
  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export { escapeHtml };
