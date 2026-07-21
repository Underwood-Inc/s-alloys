import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { currentAppPath, resolveRoute, routeToPath, type AppRoute } from '../../app/router.js';
import {
  onQaHeaderProgress,
  onQaHeaderProgressClear,
  type QaHeaderProgress,
} from '../../molecules/qa-header-bridge/qaHeaderBridge.js';
import { renderProgressRing } from '../../molecules/progress-summary/progressRingView.js';
import { bindViewportTooltips } from '../../molecules/viewport-tooltip/bindViewportTooltips.js';
import '../../organisms/site-icon/site-icon.js';

const base = import.meta.env.BASE_URL;

export class AlloysSiteHeader extends HTMLElement {
  #stopProgress?: () => void;
  #stopClear?: () => void;
  #tooltipCleanup?: () => void;

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
        <div class="site-header__qa" data-active="false" hidden>
          <div class="site-header__qa-ring" data-qa-ring></div>
          <div class="site-header__qa-copy">
            <strong data-qa-reviewed>0 / 0</strong>
            <span class="muted" data-qa-version>reviewed</span>
            <span class="site-header__qa-tester" data-qa-tester>Tester: —</span>
          </div>
        </div>
        <nav>
          <a class="nav-link" data-view="home" href="${base}">Home</a>
          <a class="nav-link" data-view="guide" href="${base}guide">Guide</a>
          <a class="nav-link" data-view="checklist" href="${base}checklist">Checklist</a>
        </nav>
      </div>
    `;
    this.updateActiveNav();
    window.addEventListener('popstate', () => this.updateActiveNav());

    this.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const view = link.dataset.view;
        if (view === 'home') navigate({ view: 'home' });
        else if (view === 'guide') navigate({ view: 'guide', slug: null });
        else if (view === 'checklist') navigate({ view: 'checklist' });
      });
    });

    this.#stopProgress = onQaHeaderProgress((detail) => this.updateQaProgress(detail));
    this.#stopClear = onQaHeaderProgressClear(() => this.clearQaProgress());
  }

  disconnectedCallback() {
    this.#stopProgress?.();
    this.#stopClear?.();
    this.#tooltipCleanup?.();
    this.#tooltipCleanup = undefined;
  }

  private updateActiveNav() {
    const route = resolveRoute(currentAppPath());
    this.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
      const view = link.dataset.view;
      link.classList.toggle('active', view === route.view);
    });
    if (route.view !== 'checklist') {
      this.clearQaProgress();
    }
  }

  private updateQaProgress(detail: QaHeaderProgress) {
    if (resolveRoute(currentAppPath()).view !== 'checklist') return;

    const block = this.querySelector<HTMLElement>('.site-header__qa');
    block?.removeAttribute('hidden');
    block?.setAttribute('data-active', 'true');

    const ringHost = this.querySelector('[data-qa-ring]');
    if (ringHost) {
      ringHost.innerHTML = renderProgressRing({
        breakdown: detail.breakdown,
        compact: true,
        suiteRows: detail.suiteRows,
      });
      this.#tooltipCleanup?.();
      this.#tooltipCleanup = bindViewportTooltips(ringHost);
    }

    const reviewed = this.querySelector('[data-qa-reviewed]');
    const version = this.querySelector('[data-qa-version]');
    const tester = this.querySelector('[data-qa-tester]');
    if (reviewed) reviewed.textContent = `${detail.reviewed} / ${detail.total}`;
    if (version) version.textContent = `reviewed · v${detail.version}`;
    if (tester) tester.textContent = `Tester: ${detail.testerName || '—'}`;
  }

  private clearQaProgress() {
    const block = this.querySelector<HTMLElement>('.site-header__qa');
    block?.setAttribute('hidden', '');
    block?.setAttribute('data-active', 'false');
    const ringHost = this.querySelector('[data-qa-ring]');
    if (ringHost) ringHost.innerHTML = '';
    this.#tooltipCleanup?.();
    this.#tooltipCleanup = undefined;
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
