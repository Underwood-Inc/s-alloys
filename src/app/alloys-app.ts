import { defineAlloysElement } from '../atoms/dom/defineElement.js';
import { currentAppPath, resolveRoute } from './router.js';
import '../organisms/site-icon/site-icon.js';
import '../organisms/site-header/site-header.js';
import '../views/home-view/home-view.js';
import '../views/qa-view/qa-view.js';
import '../views/guide-view/guide-view.js';

export class AlloysApp extends HTMLElement {
  private outlet!: HTMLElement;

  connectedCallback() {
    this.className = 'site-shell';
    this.innerHTML = `
      <alloys-site-header></alloys-site-header>
      <main id="outlet"></main>
    `;
    this.outlet = this.querySelector('#outlet')!;
    window.addEventListener('popstate', () => this.renderRoute());
    this.renderRoute();
  }

  private renderRoute() {
    const route = resolveRoute(currentAppPath());
    if (route.view === 'checklist') {
      this.outlet.replaceChildren(Object.assign(document.createElement('alloys-qa-view')));
      return;
    }
    if (route.view === 'guide') {
      this.outlet.replaceChildren(Object.assign(document.createElement('alloys-guide-view')));
      return;
    }
    this.outlet.replaceChildren(Object.assign(document.createElement('alloys-home-view')));
  }
}

defineAlloysElement('alloys-app', AlloysApp);
