import { defineAlloysElement } from '../../atoms/dom/defineElement.js';
import { clearQaHeaderProgress } from '../../molecules/qa-header-bridge/qaHeaderBridge.js';
import { QaSessionStore } from '../../molecules/qa-session/qaSessionStore.js';
import { QaStorageLocal } from '../../plugs/browser/qaStorageLocal.js';
import type { QaCatalog } from '../../molecules/qa-session/qaSessionTypes.js';
import '../../recipes/qa-runner/qa-runner.js';

export class AlloysQaView extends HTMLElement {
  private store = new QaSessionStore(new QaStorageLocal());

  async connectedCallback() {
    const response = await fetch(`${import.meta.env.BASE_URL}data/cases.json`);
    const catalog = await response.json() as QaCatalog;
    const runner = document.createElement('alloys-qa-runner');
    (runner as import('../../recipes/qa-runner/qa-runner.js').AlloysQaRunner).setStore(this.store);
    (runner as import('../../recipes/qa-runner/qa-runner.js').AlloysQaRunner).setCatalog(catalog);
    this.replaceChildren(runner);
  }

  disconnectedCallback() {
    clearQaHeaderProgress();
  }
}

defineAlloysElement('alloys-qa-view', AlloysQaView);
