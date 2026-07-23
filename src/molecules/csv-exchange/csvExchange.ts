import { escapeCsv } from '../../atoms/csv-escape/csvEscape.js';
import type { CaseProgress, QaCase, QaSession } from '../qa-session/qaSessionTypes.js';

const EXPORT_VERSION = '1';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i += 1;
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
      if (c === '\r' && next === '\n') i += 1;
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

export function exportQaCsv(
  catalogVersion: string,
  cases: QaCase[],
  session: QaSession,
  reviewedCount: number,
): string {
  const exportedAt = new Date().toISOString();
  const lines = [
    '# Alloys test checklist progress export',
    `# export_version,${EXPORT_VERSION}`,
    `# exported_at,${exportedAt}`,
    `# tester_name,${escapeCsv(session.tester_name)}`,
    `# datapack_version,${catalogVersion}`,
    `# case_count,${cases.length}`,
    `# reviewed_count,${reviewedCount}`,
    'case_id,suite,kind,alloy,title,severity,verdict,notes,updated_at',
  ];

  for (const testCase of cases) {
    const progress = session.progress[testCase.id] ?? { verdict: 'untested', notes: '', updated_at: '' };
    lines.push([
      escapeCsv(testCase.id),
      escapeCsv(testCase.suite),
      escapeCsv(testCase.kind),
      escapeCsv(testCase.alloy ?? ''),
      escapeCsv(testCase.title),
      escapeCsv(testCase.severity),
      escapeCsv(progress.verdict),
      escapeCsv(progress.notes),
      escapeCsv(progress.updated_at),
    ].join(','));
  }

  return `${lines.join('\n')}\n`;
}

export function importQaCsv(
  text: string,
  knownIds: Set<string>,
): { tester_name?: string; progress: Record<string, CaseProgress> } {
  const rows = parseCsv(text);
  const meta: Record<string, string> = {};
  const progress: Record<string, CaseProgress> = {};

  for (const row of rows) {
    if (!row.length) continue;
    if (row[0].startsWith('#')) {
      const head = row[0].slice(1).trim();
      if (head.includes(',')) {
        const idx = head.indexOf(',');
        meta[head.slice(0, idx).trim()] = head.slice(idx + 1).trim();
      } else if (row[1] !== undefined) {
        meta[head] = row[1];
      }
      continue;
    }
    if (row[0] === 'case_id') continue;
    const [caseId, , , , , , verdict, notes, updated_at] = row;
    if (!caseId || !knownIds.has(caseId)) continue;
    progress[caseId] = {
      verdict: (verdict as CaseProgress['verdict']) || 'untested',
      notes: notes ?? '',
      updated_at: updated_at || new Date().toISOString(),
    };
  }

  return { tester_name: meta.tester_name, progress };
}

export function exportQaJson(
  catalogVersion: string,
  cases: QaCase[],
  session: QaSession,
  reviewedCount: number,
) {
  return {
    export_version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    tester_name: session.tester_name,
    datapack_version: catalogVersion,
    case_count: cases.length,
    reviewed_count: reviewedCount,
    progress: session.progress,
  };
}
