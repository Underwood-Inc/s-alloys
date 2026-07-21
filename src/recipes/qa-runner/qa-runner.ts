import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import { publishQaHeaderProgress } from '../../molecules/qa-header-bridge/qaHeaderBridge.js';
import { renderQaCaseIcon } from '../../molecules/qa-case-icon/qaCaseIcon.js';
import type { QaCatalog, QaCase } from '../../molecules/qa-session/qaSessionTypes.js';
import { QaSessionStore } from '../../molecules/qa-session/qaSessionStore.js';
import { filterCases } from '../../molecules/qa-filter/filterCases.js';
import { countReviewed } from '../../molecules/progress-summary/countReviewed.js';
import { buildSuiteTooltipRows, computeVerdictBreakdown } from '../../molecules/progress-summary/computeVerdictBreakdown.js';
import { renderProgressRing, renderSuiteMeter } from '../../molecules/progress-summary/progressRingView.js';
import { bindViewportTooltips } from '../../molecules/viewport-tooltip/bindViewportTooltips.js';
import { exportQaCsv, exportQaJson, importQaCsv } from '../../molecules/csv-exchange/csvExchange.js';
import {
  computeSuiteStats,
  getSuiteMeta,
  phasesWithSuites,
} from '../../molecules/qa-catalog/suiteCatalog.js';

type QaMobilePanel = 'suites' | 'cases' | 'detail';

export class AlloysQaRunner extends HTMLElement {
  private store!: QaSessionStore;
  private catalog!: QaCatalog;
  private activeSuite = 'smoke';
  private search = '';
  private alloy = '';
  private verdict = '';
  private mobilePanel: QaMobilePanel = 'cases';
  private tooltipCleanup?: () => void;

  setStore(store: QaSessionStore) {
    this.store = store;
    this.store.addEventListener('change', () => this.render());
  }

  setCatalog(catalog: QaCatalog) {
    this.catalog = catalog;
    if (!catalog.cases.some((c) => c.suite === this.activeSuite)) {
      this.activeSuite = catalog.cases[0]?.suite ?? 'smoke';
    }
    this.render();
  }

  connectedCallback() {
    this.className = 'qa-shell';
    if (!this.dataset.actionsBound) {
      this.dataset.actionsBound = 'true';
      this.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const actionButton = target.closest<HTMLButtonElement>('[data-action]');

        if (actionButton?.dataset.action === 'menu') {
          event.stopPropagation();
          const menu = actionButton.closest('.actions-menu');
          const panel = menu?.querySelector('.actions-menu__panel');
          const willOpen = !panel?.classList.contains('open');
          this.closeActionsMenu();
          if (willOpen) panel?.classList.add('open');
          actionButton.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          return;
        }

        if (actionButton?.closest('.actions-menu__panel')) {
          event.stopPropagation();
          this.closeActionsMenu();
          this.handleMenuAction(actionButton.dataset.action ?? '');
          return;
        }

        if (!target.closest('.actions-menu')) {
          this.closeActionsMenu();
        }
      });
    }
    this.render();
  }

  disconnectedCallback() {
    this.tooltipCleanup?.();
    this.tooltipCleanup = undefined;
  }

  private closeActionsMenu() {
    this.querySelectorAll('.actions-menu__panel').forEach((panel) => panel.classList.remove('open'));
    this.querySelectorAll<HTMLButtonElement>('[data-action="menu"]').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  private renderActionsMenu(modifier: 'nav' | 'mobile') {
    return `
      <div class="actions-menu actions-menu--${modifier}">
        <button type="button" class="btn btn--sm actions-menu__trigger" data-action="menu" aria-haspopup="menu" aria-expanded="false">Actions</button>
        <div class="actions-menu__panel" role="menu">
          <button type="button" role="menuitem" data-action="export-csv">Export CSV</button>
          <button type="button" role="menuitem" data-action="export-json">Export JSON</button>
          <button type="button" role="menuitem" data-action="import-csv">Import CSV</button>
          <button type="button" role="menuitem" data-action="import-json">Import JSON</button>
          <button type="button" role="menuitem" data-action="tester">Set tester name</button>
          <button type="button" role="menuitem" data-action="reset">Reset progress</button>
        </div>
      </div>
    `;
  }

  private handleMenuAction(action: string) {
    if (!this.catalog || !this.store) return;
    const cases = this.catalog.cases;

    switch (action) {
      case 'export-csv': {
        const session = this.store.getSession();
        const reviewed = countReviewed(cases, session.progress);
        this.download('alloys-qa.csv', exportQaCsv(this.catalog.datapack_version, cases, session, reviewed), 'text/csv');
        break;
      }
      case 'export-json': {
        const session = this.store.getSession();
        const reviewed = countReviewed(cases, session.progress);
        this.download('alloys-qa.json', JSON.stringify(exportQaJson(this.catalog.datapack_version, cases, session, reviewed), null, 2), 'application/json');
        break;
      }
      case 'import-csv':
        this.openImport('.csv,text/csv', async (text) => {
          this.store.mergeImport(importQaCsv(text, new Set(cases.map((c) => c.id))));
        });
        break;
      case 'import-json':
        this.openImport('.json,application/json', async (text) => {
          const data = JSON.parse(text);
          this.store.mergeImport({ tester_name: data.tester_name, progress: data.progress });
        });
        break;
      case 'tester':
        this.openTesterDialog();
        break;
      case 'reset':
        this.openResetDialog();
        break;
      default:
        break;
    }
  }

  private openImport(accept: string, onLoad: (text: string) => void | Promise<void>) {
    const fileInput = this.querySelector('[data-import]') as HTMLInputElement | null;
    if (!fileInput) return;
    fileInput.accept = accept;
    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      fileInput.value = '';
      if (!file) return;
      await onLoad(await file.text());
    };
    fileInput.click();
  }

  private bindDialogForms() {
    const testerForm = this.querySelector<HTMLDialogElement>('[data-dialog="tester"]')?.querySelector('form');
    const resetForm = this.querySelector<HTMLDialogElement>('[data-dialog="reset"]')?.querySelector('form');
    if (!testerForm || !resetForm) return;
    if (testerForm.dataset.bound === 'true') return;

    testerForm.dataset.bound = 'true';
    resetForm.dataset.bound = 'true';

    testerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const dialog = this.querySelector<HTMLDialogElement>('[data-dialog="tester"]');
      const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
      if (submitter?.value === 'cancel') return;
      const input = dialog?.querySelector<HTMLInputElement>('[data-tester-input]');
      this.store.setTesterName(input?.value.trim() ?? '');
      dialog?.close();
    });

    testerForm.querySelector<HTMLButtonElement>('[data-dialog-cancel]')?.addEventListener('click', () => {
      this.querySelector<HTMLDialogElement>('[data-dialog="tester"]')?.close();
    });

    resetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const dialog = this.querySelector<HTMLDialogElement>('[data-dialog="reset"]');
      const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
      if (submitter?.value === 'cancel') return;
      if (submitter?.value === 'reset') {
        this.store.resetProgress();
      }
      dialog?.close();
    });

    resetForm.querySelector<HTMLButtonElement>('[data-dialog-cancel]')?.addEventListener('click', () => {
      this.querySelector<HTMLDialogElement>('[data-dialog="reset"]')?.close();
    });
  }

  private openTesterDialog() {
    const dialog = this.querySelector<HTMLDialogElement>('[data-dialog="tester"]');
    const input = dialog?.querySelector<HTMLInputElement>('[data-tester-input]');
    if (!dialog || !input) return;
    input.value = this.store.getSession().tester_name;
    dialog.showModal();
    input.focus();
    input.select();
  }

  private openResetDialog() {
    this.querySelector<HTMLDialogElement>('[data-dialog="reset"]')?.showModal();
  }

  private isCompactLayout(): boolean {
    return window.matchMedia('(max-width: 1279px)').matches;
  }

  private setMobilePanel(panel: QaMobilePanel) {
    this.closeActionsMenu();
    this.mobilePanel = panel;
    this.classList.remove('qa-shell--panel-suites', 'qa-shell--panel-cases', 'qa-shell--panel-detail');
    this.classList.add(`qa-shell--panel-${panel}`);
    this.querySelectorAll<HTMLButtonElement>('[data-mobile-panel]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mobilePanel === panel);
    });
  }

  private captureFocus(): { kind: 'search' | 'notes' | 'select'; field?: string; start: number | null; end: number | null } | null {
    const active = document.activeElement;
    if (!active || !this.contains(active)) return null;

    if (active instanceof HTMLInputElement && active.dataset.field === 'search') {
      return { kind: 'search', start: active.selectionStart, end: active.selectionEnd };
    }
    if (active instanceof HTMLTextAreaElement && active.hasAttribute('data-notes')) {
      return { kind: 'notes', start: active.selectionStart, end: active.selectionEnd };
    }
    if (active instanceof HTMLSelectElement && active.dataset.field) {
      return { kind: 'select', field: active.dataset.field, start: null, end: null };
    }
    return null;
  }

  private restoreFocus(snapshot: ReturnType<AlloysQaRunner['captureFocus']>) {
    if (!snapshot) return;

    if (snapshot.kind === 'search') {
      const el = this.querySelector<HTMLInputElement>('[data-field="search"]');
      if (!el) return;
      el.focus();
      const pos = snapshot.start ?? el.value.length;
      el.setSelectionRange(pos, snapshot.end ?? pos);
      return;
    }

    if (snapshot.kind === 'notes') {
      const el = this.querySelector<HTMLTextAreaElement>('[data-notes]');
      if (!el) return;
      el.focus();
      const pos = snapshot.start ?? el.value.length;
      el.setSelectionRange(pos, snapshot.end ?? pos);
      return;
    }

    if (snapshot.kind === 'select' && snapshot.field) {
      this.querySelector<HTMLSelectElement>(`[data-field="${snapshot.field}"]`)?.focus();
    }
  }

  private render() {
    if (!this.catalog || !this.store) {
      this.innerHTML = '<p class="muted" style="padding:2rem">Loading test checklist…</p>';
      return;
    }

    const focusSnapshot = this.captureFocus();
    const session = this.store.getSession();
    const cases = this.catalog.cases;
    const suiteStats = computeSuiteStats(cases, session.progress);
    const suiteCases = cases.filter((c) => c.suite === this.activeSuite);
    const filtered = filterCases(suiteCases, {
      suite: '',
      alloy: this.alloy,
      verdict: this.verdict,
      search: this.search,
      progress: session.progress,
    });
    const reviewed = countReviewed(cases, session.progress);
    const verdictBreakdown = computeVerdictBreakdown(cases, session.progress);
    const suiteTooltipRows = buildSuiteTooltipRows(suiteStats);
    const selectedId = session.selected_id && filtered.some((c) => c.id === session.selected_id)
      ? session.selected_id
      : filtered[0]?.id ?? null;
    const selected = cases.find((c) => c.id === selectedId) ?? null;
    const suiteMeta = getSuiteMeta(this.activeSuite);
    const pct = cases.length ? Math.round((reviewed / cases.length) * 100) : 0;

    publishQaHeaderProgress({
      pct,
      reviewed,
      total: cases.length,
      version: this.catalog.datapack_version,
      testerName: session.tester_name,
      breakdown: verdictBreakdown,
      suiteRows: suiteTooltipRows,
    });

    this.className = `qa-shell qa-shell--panel-${this.mobilePanel}`;

    this.innerHTML = `
      <aside class="qa-rail">
        <div class="qa-rail__header">
          <div class="qa-rail__summary">
            ${renderProgressRing({ breakdown: verdictBreakdown, suiteRows: suiteTooltipRows })}
            <div>
              <p class="qa-rail__title">Test plan</p>
              <div class="muted" style="font-size:0.82rem">${reviewed} / ${cases.length} reviewed</div>
              <div class="muted" style="font-size:0.78rem">v${escapeHtml(this.catalog.datapack_version)}</div>
            </div>
          </div>
        </div>
        ${phasesWithSuites().map((phase) => `
          <div class="qa-rail__phase">${escapeHtml(phase.phase)}</div>
          ${phase.suites.map((suite) => {
            const stats = suiteStats[suite.id] ?? { total: 0, reviewed: 0, pass: 0, fail: 0, skip: 0 };
            return `
              <button type="button" class="qa-rail__suite ${suite.id === this.activeSuite ? 'active' : ''}" data-suite="${escapeHtml(suite.id)}">
                <div class="qa-rail__suite-label">
                  <span>${escapeHtml(suite.label)}</span>
                  <span class="muted">${stats.reviewed}/${stats.total}</span>
                </div>
                <div class="qa-rail__suite-desc">${escapeHtml(suite.description)}</div>
                ${renderSuiteMeter(stats)}
              </button>
            `;
          }).join('')}
        `).join('')}
      </aside>

      <section class="qa-nav">
        <div class="qa-nav__top">
          <div class="qa-nav__stats">
            <div class="qa-nav__stats-copy">
              <strong>${escapeHtml(suiteMeta?.label ?? this.activeSuite)}</strong>
              <span class="muted">Tester: ${escapeHtml(session.tester_name || '—')}</span>
            </div>
            ${this.renderActionsMenu('nav')}
          </div>
          <input class="qa-nav__search" type="search" placeholder="Search in this suite…" data-field="search" value="${escapeHtml(this.search)}" />
          <div class="qa-nav__filters">
            <select class="form-select" data-field="alloy"><option value="">All alloys</option>${[...new Set(suiteCases.map((c) => c.alloy).filter(Boolean))].map((s) => `<option value="${escapeHtml(s)}" ${this.alloy === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}</select>
            <select class="form-select" data-field="verdict">
              <option value="">Any verdict</option>
              ${['untested', 'pass', 'fail', 'skip'].map((v) => `<option value="${v}" ${this.verdict === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </div>
        </div>
        <ul class="case-list">
          ${filtered.map((testCase) => this.renderCaseButton(testCase, session, selectedId)).join('')}
        </ul>
      </section>

      <section class="qa-workspace">
        <div class="qa-workspace__card glass-card">
          ${selected ? this.renderDetail(selected, session.progress[selected.id]) : '<p class="muted">Select a case to begin.</p>'}
        </div>
      </section>
      <nav class="qa-mobile-tabs" aria-label="Checklist panels">
        <button type="button" class="qa-mobile-tabs__btn ${this.mobilePanel === 'suites' ? 'is-active' : ''}" data-mobile-panel="suites">Suites</button>
        <button type="button" class="qa-mobile-tabs__btn ${this.mobilePanel === 'cases' ? 'is-active' : ''}" data-mobile-panel="cases">Cases</button>
        <button type="button" class="qa-mobile-tabs__btn ${this.mobilePanel === 'detail' ? 'is-active' : ''}" data-mobile-panel="detail">Case</button>
        ${this.renderActionsMenu('mobile')}
      </nav>
      <input type="file" hidden data-import />
      <dialog class="qa-dialog" data-dialog="tester">
        <form class="qa-dialog__form" method="dialog">
          <h3 class="qa-dialog__title">Set tester name</h3>
          <p class="qa-dialog__lead muted">Shown in the case list header and on exported reports.</p>
          <input class="qa-dialog__input" type="text" data-tester-input placeholder="Your name" autocomplete="name" />
          <div class="qa-dialog__actions">
            <button type="button" class="btn btn--ghost btn--sm" data-dialog-cancel>Cancel</button>
            <button type="submit" class="btn btn--primary btn--sm" value="save">Save</button>
          </div>
        </form>
      </dialog>
      <dialog class="qa-dialog" data-dialog="reset">
        <form class="qa-dialog__form" method="dialog">
          <h3 class="qa-dialog__title">Reset all progress?</h3>
          <p class="qa-dialog__lead muted">Clears every verdict and note in this browser. Exports are not affected.</p>
          <div class="qa-dialog__actions">
            <button type="button" class="btn btn--ghost btn--sm" data-dialog-cancel>Cancel</button>
            <button type="submit" class="btn btn--sm active-fail" value="reset">Reset progress</button>
          </div>
        </form>
      </dialog>
    `;

    this.bindEvents(cases, filtered, selected);
    this.bindDialogForms();
    this.tooltipCleanup?.();
    this.tooltipCleanup = bindViewportTooltips(this);
    this.restoreFocus(focusSnapshot);
  }

  private refreshCaseList(
    filtered: QaCase[],
    session: ReturnType<QaSessionStore['getSession']>,
    selectedId: string | null,
  ) {
    const list = this.querySelector('.case-list');
    if (!list) return;
    list.innerHTML = filtered.map((testCase) => this.renderCaseButton(testCase, session, selectedId)).join('');
    this.querySelectorAll('[data-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.isCompactLayout()) this.mobilePanel = 'detail';
        this.store.setSelectedId((btn as HTMLButtonElement).dataset.case ?? null);
      });
    });
  }

  private renderCaseButton(testCase: QaCase, session: ReturnType<QaSessionStore['getSession']>, selectedId: string | null) {
    const p = session.progress[testCase.id]?.verdict ?? 'untested';
    const badge = p !== 'untested' ? `<span class="badge badge--${escapeHtml(p)}">${escapeHtml(p)}</span>` : '';
    return `<li><button type="button" data-case="${escapeHtml(testCase.id)}" class="${testCase.id === selectedId ? 'active' : ''}">
      ${renderQaCaseIcon(testCase, { size: 'list' })}
      <span class="case-list__copy">
        <span class="id">${escapeHtml(testCase.id)} ${badge}</span>
        <span class="title">${escapeHtml(testCase.title)}</span>
      </span>
    </button></li>`;
  }

  private renderDetail(testCase: QaCase, progress = { verdict: 'untested', notes: '', updated_at: '' }) {
    const section = (title: string, items?: string[]) => (items?.length
      ? `<section class="qa-workspace__section"><h3>${title}</h3><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>`
      : '');
    const sev = testCase.severity === 'blocker' ? 'blocker' : testCase.severity === 'high' ? 'high' : '';
    return `
      <div class="qa-workspace__header">
        ${renderQaCaseIcon(testCase, { size: 'detail' })}
        <div class="qa-workspace__header-copy">
          <h2>${escapeHtml(testCase.title)}</h2>
          <div class="qa-workspace__badges">
            <span class="badge ${sev ? `badge--${sev}` : ''}">${escapeHtml(testCase.severity)}</span>
            <span class="badge">${escapeHtml(testCase.id)}</span>
            ${testCase.alloy ? `<span class="badge">${escapeHtml(testCase.alloy)}</span>` : ''}
          </div>
        </div>
      </div>
      <p class="qa-workspace__objective">${escapeHtml(testCase.objective)}</p>
      ${section('Preconditions', testCase.preconditions)}
      ${section('Input', testCase.input)}
      ${section('Steps', testCase.steps)}
      ${section('Expect', testCase.expect)}
      ${section('Must not', testCase.mustNot)}
      <div class="qa-workspace__verdicts">
        <button class="btn btn--sm ${progress.verdict === 'pass' ? 'active-pass' : ''}" data-verdict="pass">Pass</button>
        <button class="btn btn--sm ${progress.verdict === 'fail' ? 'active-fail' : ''}" data-verdict="fail">Fail</button>
        <button class="btn btn--sm ${progress.verdict === 'skip' ? 'active-skip' : ''}" data-verdict="skip">Skip</button>
      </div>
      <textarea data-notes placeholder="Notes for the team — build, repro steps, log snippets…">${escapeHtml(progress.notes ?? '')}</textarea>
      <div class="qa-workspace__nav-row">
        <button class="btn btn--ghost btn--sm" data-nav="prev">← Previous</button>
        <button class="btn btn--ghost btn--sm" data-nav="next">Next →</button>
      </div>
    `;
  }

  private bindEvents(
    cases: QaCase[],
    filtered: QaCase[],
    selected: QaCase | null,
  ) {
    this.querySelector('[data-field="search"]')?.addEventListener('input', (e) => {
      this.search = (e.target as HTMLInputElement).value;
      const sessionNow = this.store.getSession();
      const suiteCases = cases.filter((c) => c.suite === this.activeSuite);
      const filteredNow = filterCases(suiteCases, {
        suite: '',
        alloy: this.alloy,
        verdict: this.verdict,
        search: this.search,
        progress: sessionNow.progress,
      });
      const selectedId = sessionNow.selected_id && filteredNow.some((c) => c.id === sessionNow.selected_id)
        ? sessionNow.selected_id
        : filteredNow[0]?.id ?? null;
      this.refreshCaseList(filteredNow, sessionNow, selectedId);
    });
    for (const field of ['alloy', 'verdict']) {
      this.querySelector(`[data-field="${field}"]`)?.addEventListener('change', (e) => {
        (this as unknown as Record<string, string>)[field] = (e.target as HTMLSelectElement).value;
        this.render();
      });
    }
    this.querySelectorAll('[data-suite]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeSuite = (btn as HTMLButtonElement).dataset.suite ?? 'smoke';
        this.search = '';
        if (this.isCompactLayout()) this.setMobilePanel('cases');
        this.render();
      });
    });
    this.querySelectorAll('[data-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.isCompactLayout()) this.mobilePanel = 'detail';
        this.store.setSelectedId((btn as HTMLButtonElement).dataset.case ?? null);
      });
    });

    this.querySelectorAll('[data-mobile-panel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = (btn as HTMLButtonElement).dataset.mobilePanel as QaMobilePanel | undefined;
        if (panel) this.setMobilePanel(panel);
      });
    });

    if (selected) {
      this.bindDetail(selected, filtered);
    }
  }

  private bindDetail(testCase: QaCase, filtered: QaCase[]) {
    this.querySelectorAll('[data-verdict]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.store.setVerdict(testCase.id, (btn as HTMLButtonElement).dataset.verdict as 'pass' | 'fail' | 'skip');
      });
    });
    this.querySelector('[data-notes]')?.addEventListener('input', (e) => {
      this.store.setNotes(testCase.id, (e.target as HTMLTextAreaElement).value);
    });
    const idx = filtered.findIndex((c) => c.id === testCase.id);
    this.querySelector('[data-nav="prev"]')?.addEventListener('click', () => {
      const prev = filtered[idx - 1];
      if (prev) this.store.setSelectedId(prev.id);
    });
    this.querySelector('[data-nav="next"]')?.addEventListener('click', () => {
      const next = filtered[idx + 1];
      if (next) this.store.setSelectedId(next.id);
    });
  }

  private download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

defineAlloysElement('alloys-qa-runner', AlloysQaRunner);
