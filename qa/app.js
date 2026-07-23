const STORAGE_KEY = 'alloys-qa-state-v1';
const EXPORT_VERSION = '1';

/** @type {{ datapack_version: string, cases: Array<Record<string, unknown>> } | null} */
let catalog = null;
/** @type {Record<string, { verdict: string, notes: string, updated_at: string }>} */
let progress = {};
let selectedId = null;
let testerName = '';
let importMode = 'csv';

const $ = (sel) => document.querySelector(sel);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    progress = data.progress ?? {};
    testerName = data.tester_name ?? '';
    selectedId = data.selected_id ?? null;
  } catch {
    progress = {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    progress,
    tester_name: testerName,
    selected_id: selectedId,
    saved_at: new Date().toISOString(),
  }));
}

function caseProgress(id) {
  return progress[id] ?? { verdict: 'untested', notes: '', updated_at: '' };
}

function setVerdict(id, verdict) {
  progress[id] = {
    ...caseProgress(id),
    verdict,
    updated_at: new Date().toISOString(),
  };
  saveState();
  render();
}

function setNotes(id, notes) {
  progress[id] = {
    ...caseProgress(id),
    notes,
    updated_at: new Date().toISOString(),
  };
  saveState();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCsv(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && next === '\n') i++;
      row.push(field);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

function filteredCases() {
  const suite = $('#filter-suite').value;
  const alloy = $('#filter-alloy').value;
  const verdict = $('#filter-verdict').value;
  const q = $('#search').value.trim().toLowerCase();

  return catalog.cases.filter((c) => {
    if (suite && c.suite !== suite) return false;
    if (alloy && c.alloy !== alloy) return false;
    const v = caseProgress(c.id).verdict;
    if (verdict && v !== verdict) return false;
    if (!q) return true;
    const hay = [c.id, c.title, c.objective, c.alloy, c.suite].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function reviewedCount() {
  return catalog.cases.filter((c) => {
    const v = caseProgress(c.id).verdict;
    return v === 'pass' || v === 'fail' || v === 'skip';
  }).length;
}

function renderList() {
  const list = $('#case-list');
  const cases = filteredCases();
  list.innerHTML = cases.map((c) => {
    const p = caseProgress(c.id);
    const badge = p.verdict !== 'untested'
      ? `<span class="badge ${escapeHtml(p.verdict)}">${escapeHtml(p.verdict)}</span>`
      : '';
    return `<li><button type="button" data-id="${escapeHtml(c.id)}" class="${c.id === selectedId ? 'active' : ''}">
      <span class="id">${escapeHtml(c.id)} ${badge}</span>
      <span class="title">${escapeHtml(c.title)}</span>
    </button></li>`;
  }).join('');

  list.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedId = btn.dataset.id;
      saveState();
      render();
    });
  });
}

function renderDetail() {
  const main = $('#case-detail');
  const c = catalog.cases.find((x) => x.id === selectedId);
  if (!c) {
    main.innerHTML = '<p class="empty">Select a case from the list.</p>';
    return;
  }

  const p = caseProgress(c.id);
  const listSection = (title, items) => {
    if (!items?.length) return '';
    return `<section class="section"><h3>${title}</h3><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>`;
  };

  main.innerHTML = `
    <div class="case-header">
      <h2>${escapeHtml(c.id)} — ${escapeHtml(c.title)}</h2>
      <span class="badge ${escapeHtml(c.severity)}">${escapeHtml(c.severity)}</span>
      ${c.alloy ? `<span class="badge">${escapeHtml(c.alloy)}</span>` : ''}
    </div>
    <section class="section"><h3>Objective</h3><p>${escapeHtml(c.objective)}</p></section>
    ${listSection('Preconditions', c.preconditions)}
    ${listSection('Input', c.input)}
    ${listSection('Steps', c.steps)}
    ${listSection('Expect', c.expect)}
    ${listSection('Must not', c.mustNot)}
    <div class="verdict-row">
      <button type="button" class="pass ${p.verdict === 'pass' ? 'active' : ''}" data-verdict="pass">Pass</button>
      <button type="button" class="fail ${p.verdict === 'fail' ? 'active' : ''}" data-verdict="fail">Fail</button>
      <button type="button" class="skip ${p.verdict === 'skip' ? 'active' : ''}" data-verdict="skip">Skip</button>
    </div>
    <section class="section">
      <h3>Notes</h3>
      <textarea class="notes" id="case-notes" placeholder="Observations, build hash, server log snippet…">${escapeHtml(p.notes)}</textarea>
    </section>
  `;

  main.querySelectorAll('[data-verdict]').forEach((btn) => {
    btn.addEventListener('click', () => setVerdict(c.id, btn.dataset.verdict));
  });

  const notes = $('#case-notes');
  notes.addEventListener('input', () => setNotes(c.id, notes.value));
}

function renderProgress() {
  const total = catalog.cases.length;
  const done = reviewedCount();
  $('#progress-label').textContent = `${done} / ${total} reviewed`;
  $('#progress-fill').style.width = total ? `${(done / total) * 100}%` : '0%';
  $('#version-meta').textContent = `Datapack ${catalog.datapack_version} · ${total} cases`;
  $('#tester-display').textContent = testerName || '—';
}

function renderFilters() {
  const suites = [...new Set(catalog.cases.map((c) => c.suite))];
  const alloys = [...new Set(catalog.cases.map((c) => c.alloy).filter(Boolean))].sort();
  const suiteSel = $('#filter-suite');
  const alloySel = $('#filter-alloy');

  for (const id of suites) {
    if ([...suiteSel.options].some((o) => o.value === id)) continue;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    suiteSel.appendChild(opt);
  }
  for (const id of alloys) {
    if ([...alloySel.options].some((o) => o.value === id)) continue;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id;
    alloySel.appendChild(opt);
  }
}

function render() {
  renderProgress();
  renderList();
  renderDetail();
}

function buildExportPayload() {
  return {
    export_version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    tester_name: testerName,
    datapack_version: catalog.datapack_version,
    case_count: catalog.cases.length,
    reviewed_count: reviewedCount(),
    progress,
  };
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  const payload = buildExportPayload();
  const stamp = payload.exported_at.replace(/[:.]/g, '-');
  download(`alloys-qa-${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

function exportCsv() {
  const payload = buildExportPayload();
  const lines = [
    '# Alloys QA progress export',
    `# export_version,${EXPORT_VERSION}`,
    `# exported_at,${payload.exported_at}`,
    `# tester_name,${escapeCsv(testerName)}`,
    `# datapack_version,${payload.datapack_version}`,
    `# case_count,${payload.case_count}`,
    `# reviewed_count,${payload.reviewed_count}`,
    'case_id,suite,kind,alloy,title,severity,verdict,notes,updated_at',
  ];

  for (const c of catalog.cases) {
    const p = caseProgress(c.id);
    lines.push([
      escapeCsv(c.id),
      escapeCsv(c.suite),
      escapeCsv(c.kind),
      escapeCsv(c.alloy ?? ''),
      escapeCsv(c.title),
      escapeCsv(c.severity),
      escapeCsv(p.verdict),
      escapeCsv(p.notes),
      escapeCsv(p.updated_at),
    ].join(','));
  }

  const stamp = payload.exported_at.replace(/[:.]/g, '-');
  download(`alloys-qa-${stamp}.csv`, `${lines.join('\n')}\n`, 'text/csv');
}

function mergeImport(data) {
  if (data.tester_name) testerName = data.tester_name;
  const incoming = data.progress ?? {};
  for (const [id, row] of Object.entries(incoming)) {
    if (!catalog.cases.some((c) => c.id === id)) continue;
    progress[id] = {
      verdict: row.verdict ?? caseProgress(id).verdict,
      notes: row.notes ?? '',
      updated_at: row.updated_at ?? new Date().toISOString(),
    };
  }
  saveState();
  render();
}

function importJson(text) {
  const data = JSON.parse(text);
  mergeImport(data);
}

function importCsv(text) {
  const rows = parseCsv(text);
  const meta = {};
  const dataRows = [];

  for (const row of rows) {
    if (!row.length) continue;
    if (row[0].startsWith('#')) {
      const line = row[0].slice(1).trim();
      const idx = line.indexOf(',');
      if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      continue;
    }
    if (row[0] === 'case_id') continue;
    dataRows.push(row);
  }

  if (meta.tester_name) testerName = meta.tester_name;

  for (const row of dataRows) {
    const [case_id, , , , , , verdict, notes, updated_at] = row;
    if (!case_id || !catalog.cases.some((c) => c.id === case_id)) continue;
    progress[case_id] = {
      verdict: verdict || 'untested',
      notes: notes ?? '',
      updated_at: updated_at || new Date().toISOString(),
    };
  }
  saveState();
  render();
}

function resetProgress() {
  if (!confirm('Clear all verdicts and notes? This cannot be undone.')) return;
  progress = {};
  saveState();
  render();
}

function setupFileMenu() {
  const menu = $('#file-menu');
  const btn = $('#file-menu-btn');
  const input = $('#file-input');

  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  menu.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', () => {
      menu.classList.remove('open');
      const action = el.dataset.action;
      if (action === 'export-csv') exportCsv();
      else if (action === 'export-json') exportJson();
      else if (action === 'import-csv') {
        importMode = 'csv';
        input.accept = '.csv,text/csv';
        input.click();
      } else if (action === 'import-json') {
        importMode = 'json';
        input.accept = '.json,application/json';
        input.click();
      } else if (action === 'tester-name') {
        const name = prompt('Tester name (included in exports):', testerName);
        if (name != null) {
          testerName = name.trim();
          saveState();
          render();
        }
      } else if (action === 'reset') resetProgress();
    });
  });

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const text = await file.text();
    try {
      if (importMode === 'json') importJson(text);
      else importCsv(text);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  });
}

function setupFilters() {
  ['#search', '#filter-suite', '#filter-alloy', '#filter-verdict'].forEach((sel) => {
    $(sel).addEventListener('input', render);
    $(sel).addEventListener('change', render);
  });
}

function setupOfflineBanner() {
  const banner = $('#offline-banner');
  const update = () => banner.classList.toggle('visible', !navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register(new URL('../sw.js', window.location.href));
  } catch {
    // PWA optional when opened outside GitHub Pages
  }
}

async function init() {
  loadState();
  setupFileMenu();
  setupFilters();
  setupOfflineBanner();
  registerServiceWorker();

  const res = await fetch('./cases.json');
  catalog = await res.json();
  renderFilters();
  if (selectedId && !catalog.cases.some((c) => c.id === selectedId)) selectedId = null;
  if (!selectedId && catalog.cases.length) selectedId = catalog.cases[0].id;
  render();
}

init();
