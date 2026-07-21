import { defineAlloysElement, escapeHtml } from '../../atoms/dom/defineElement.js';
import '../../organisms/site-icon/site-icon.js';
import type { QaCatalog, QaCase } from '../../molecules/qa-session/qaSessionTypes.js';
import { QaSessionStore } from '../../molecules/qa-session/qaSessionStore.js';
import { filterCases } from '../../molecules/qa-filter/filterCases.js';
import { countReviewed } from '../../molecules/progress-summary/countReviewed.js';
import { exportQaCsv, exportQaJson, importQaCsv } from '../../molecules/csv-exchange/csvExchange.js';
import {
  computeSuiteStats,
  getSuiteMeta,
  phasesWithSuites,
} from '../../molecules/qa-catalog/suiteCatalog.js';

export class AlloysQaRunner extends HTMLElement {
  private store!: QaSessionStore;
  private catalog!: QaCatalog;
  private activeSuite = 'smoke';
  private search = '';
  private alloy = '';
  private verdict = '';

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
    this.render();
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
    const selectedId = session.selected_id && filtered.some((c) => c.id === session.selected_id)
      ? session.selected_id
      : filtered[0]?.id ?? null;
    const selected = cases.find((c) => c.id === selectedId) ?? null;
    const suiteMeta = getSuiteMeta(this.activeSuite);
    const pct = cases.length ? Math.round((reviewed / cases.length) * 100) : 0;

    this.innerHTML = `
      <aside class="qa-rail">
        <div class="qa-rail__header">
          <div style="display:flex;align-items:center;gap:0.85rem">
            <alloys-site-icon class="qa-rail__brand" variant="static" size="nav" pixels="64"></alloys-site-icon>
            <div class="progress-ring" style="--pct:${pct}"><span>${pct}%</span></div>
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
            const stats = suiteStats[suite.id] ?? { total: 0, reviewed: 0 };
            const donePct = stats.total ? Math.round((stats.reviewed / stats.total) * 100) : 0;
            return `
              <button type="button" class="qa-rail__suite ${suite.id === this.activeSuite ? 'active' : ''}" data-suite="${escapeHtml(suite.id)}">
                <div class="qa-rail__suite-label">
                  <span>${escapeHtml(suite.label)}</span>
                  <span class="muted">${stats.reviewed}/${stats.total}</span>
                </div>
                <div class="qa-rail__suite-desc">${escapeHtml(suite.description)}</div>
                <div class="qa-rail__meter"><span style="width:${donePct}%"></span></div>
              </button>
            `;
          }).join('')}
        `).join('')}
      </aside>

      <section class="qa-nav">
        <div class="qa-nav__top">
          <div class="qa-nav__stats">
            <strong>${escapeHtml(suiteMeta?.label ?? this.activeSuite)}</strong>
            <span class="muted">Tester: ${escapeHtml(session.tester_name || '—')}</span>
          </div>
          <input class="qa-nav__search" type="search" placeholder="Search in this suite…" data-field="search" value="${escapeHtml(this.search)}" />
          <div class="qa-nav__filters">
            <select class="form-select" data-field="alloy"><option value="">All alloys</option>${[...new Set(suiteCases.map((c) => c.alloy).filter(Boolean))].map((s) => `<option value="${escapeHtml(s)}" ${this.alloy === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}</select>
            <select class="form-select" data-field="verdict">
              <option value="">Any verdict</option>
              ${['untested', 'pass', 'fail', 'skip'].map((v) => `<option value="${v}" ${this.verdict === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
            <div class="file-menu">
              <button type="button" class="btn btn--sm" data-action="menu">File</button>
              <div class="file-menu__panel">
                <button type="button" data-action="export-csv">Export CSV</button>
                <button type="button" data-action="export-json">Export JSON</button>
                <button type="button" data-action="import-csv">Import CSV</button>
                <button type="button" data-action="import-json">Import JSON</button>
                <button type="button" data-action="tester">Set tester name</button>
                <button type="button" data-action="reset">Reset progress</button>
              </div>
            </div>
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
      <input type="file" hidden data-import />
    `;

    this.bindEvents(cases, session, reviewed, filtered, selected);
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
        this.store.setSelectedId((btn as HTMLButtonElement).dataset.case ?? null);
      });
    });
  }

  private renderCaseButton(testCase: QaCase, session: ReturnType<QaSessionStore['getSession']>, selectedId: string | null) {
    const p = session.progress[testCase.id]?.verdict ?? 'untested';
    const badge = p !== 'untested' ? `<span class="badge badge--${escapeHtml(p)}">${escapeHtml(p)}</span>` : '';
    return `<li><button type="button" data-case="${escapeHtml(testCase.id)}" class="${testCase.id === selectedId ? 'active' : ''}">
      <div class="id">${escapeHtml(testCase.id)} ${badge}</div>
      <div class="title">${escapeHtml(testCase.title)}</div>
    </button></li>`;
  }

  private renderDetail(testCase: QaCase, progress = { verdict: 'untested', notes: '', updated_at: '' }) {
    const section = (title: string, items?: string[]) => (items?.length
      ? `<section class="qa-workspace__section"><h3>${title}</h3><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>`
      : '');
    const sev = testCase.severity === 'blocker' ? 'blocker' : testCase.severity === 'high' ? 'high' : '';
    return `
      <div class="qa-workspace__header">
        <h2>${escapeHtml(testCase.title)}</h2>
        <span class="badge ${sev ? `badge--${sev}` : ''}">${escapeHtml(testCase.severity)}</span>
        <span class="badge">${escapeHtml(testCase.id)}</span>
        ${testCase.alloy ? `<span class="badge">${escapeHtml(testCase.alloy)}</span>` : ''}
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
    session: ReturnType<QaSessionStore['getSession']>,
    reviewed: number,
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
        this.render();
      });
    });
    this.querySelectorAll('[data-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.store.setSelectedId((btn as HTMLButtonElement).dataset.case ?? null);
      });
    });

    const panel = this.querySelector('.file-menu__panel');
    this.querySelector('[data-action="menu"]')?.addEventListener('click', () => panel?.classList.toggle('open'));
    this.querySelector('[data-action="export-csv"]')?.addEventListener('click', () => {
      this.download('alloys-qa.csv', exportQaCsv(this.catalog.datapack_version, cases, session, reviewed), 'text/csv');
    });
    this.querySelector('[data-action="export-json"]')?.addEventListener('click', () => {
      this.download('alloys-qa.json', JSON.stringify(exportQaJson(this.catalog.datapack_version, cases, session, reviewed), null, 2), 'application/json');
    });
    this.querySelector('[data-action="tester"]')?.addEventListener('click', () => {
      const name = prompt('Tester name:', session.tester_name);
      if (name != null) this.store.setTesterName(name.trim());
    });
    this.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      if (confirm('Reset all progress?')) this.store.resetProgress();
    });
    const fileInput = this.querySelector('[data-import]') as HTMLInputElement;
    this.querySelector('[data-action="import-csv"]')?.addEventListener('click', () => {
      fileInput.accept = '.csv,text/csv';
      fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        fileInput.value = '';
        if (!file) return;
        this.store.mergeImport(importQaCsv(await file.text(), new Set(cases.map((c) => c.id))));
      };
      fileInput.click();
    });
    this.querySelector('[data-action="import-json"]')?.addEventListener('click', () => {
      fileInput.accept = '.json,application/json';
      fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        fileInput.value = '';
        if (!file) return;
        const data = JSON.parse(await file.text());
        this.store.mergeImport({ tester_name: data.tester_name, progress: data.progress });
      };
      fileInput.click();
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
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

defineAlloysElement('alloys-qa-runner', AlloysQaRunner);
