import { escapeHtml } from '../../atoms/dom/defineElement.js';
import {
  breakdownPercents,
  type SuiteTooltipRow,
  type VerdictBreakdown,
} from './computeVerdictBreakdown.js';

function pctOfTotal(count: number, total: number): string {
  if (!total || !count) return '0%';
  const pct = (count / total) * 100;
  if (pct > 0 && pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
}

function renderVerdictRow(label: string, count: number, total: number, modifier: string): string {
  const pct = pctOfTotal(count, total);
  return `
    <li class="progress-ring__tooltip-row progress-ring__tooltip-row--${modifier}">
      <span class="progress-ring__swatch"></span>
      <span class="progress-ring__tooltip-label">${label}</span>
      <strong>${count}</strong>
      <span class="muted">${pct}</span>
    </li>
  `;
}

function renderSuiteRow(row: SuiteTooltipRow): string {
  const denom = row.total || 1;
  const passPct = (row.pass / denom) * 100;
  const failPct = (row.fail / denom) * 100;
  const skipPct = (row.skip / denom) * 100;
  const chips = [
    row.pass ? `<span class="progress-ring__chip progress-ring__chip--pass">${row.pass} pass</span>` : '',
    row.fail ? `<span class="progress-ring__chip progress-ring__chip--fail">${row.fail} fail</span>` : '',
    row.skip ? `<span class="progress-ring__chip progress-ring__chip--skip">${row.skip} skip</span>` : '',
  ].filter(Boolean).join('');

  const status = row.reviewed
    ? `<div class="progress-ring__tooltip-suite-chips">${chips}</div>`
    : '<div class="progress-ring__tooltip-suite-empty muted">Not started</div>';

  return `
    <li class="progress-ring__tooltip-suite">
      <div class="progress-ring__tooltip-suite-head">
        <span class="progress-ring__tooltip-suite-label">${escapeHtml(row.label)}</span>
        <span class="progress-ring__tooltip-suite-count">${row.reviewed}/${row.total}</span>
      </div>
      <div class="progress-ring__tooltip-suite-meter" aria-hidden="true">
        <span class="progress-ring__tooltip-suite-pass" style="width:${passPct}%"></span>
        <span class="progress-ring__tooltip-suite-fail" style="width:${failPct}%"></span>
        <span class="progress-ring__tooltip-suite-skip" style="width:${skipPct}%"></span>
      </div>
      ${status}
    </li>
  `;
}

export function progressRingAriaLabel(breakdown: VerdictBreakdown): string {
  const reviewedPct = breakdown.total
    ? Math.round((breakdown.reviewed / breakdown.total) * 100)
    : 0;
  return `Review progress ${reviewedPct} percent. ${breakdown.pass} pass, ${breakdown.fail} fail, ${breakdown.skip} skip, ${breakdown.untested} untested.`;
}

export function renderProgressRing(options: {
  breakdown: VerdictBreakdown;
  compact?: boolean;
  suiteRows?: SuiteTooltipRow[];
}): string {
  const { breakdown, compact = false, suiteRows = [] } = options;
  const percents = breakdownPercents(breakdown);
  const centerPct = percents.reviewedPct;
  const compactClass = compact ? ' progress-ring--compact' : '';

  const suiteSection = suiteRows.length
    ? `
      <div class="progress-ring__tooltip-section">
        <div class="progress-ring__tooltip-heading">By suite</div>
        <ul class="progress-ring__tooltip-suites">
          ${suiteRows.map(renderSuiteRow).join('')}
        </ul>
      </div>
    `
    : '';

  const placement = compact ? 'bottom,top,right,left' : 'right,bottom,left,top';

  return `
    <div
      class="progress-ring progress-ring--segmented${compactClass}"
      data-viewport-tooltip
      data-tooltip-placement="${placement}"
      style="--pass-pct:${percents.passPct};--fail-pct:${percents.failPct};--skip-pct:${percents.skipPct};--untested-pct:${percents.untestedPct}"
      tabindex="0"
      role="button"
      aria-haspopup="true"
      aria-expanded="false"
      aria-label="${escapeHtml(progressRingAriaLabel(breakdown))}"
    >
      <span>${centerPct}%</span>
      <div class="progress-ring__tooltip" data-viewport-tooltip-panel role="tooltip">
        <div class="progress-ring__tooltip-summary">
          <strong>${breakdown.reviewed} / ${breakdown.total} reviewed</strong>
        </div>
        <ul class="progress-ring__tooltip-verdicts">
          ${renderVerdictRow('Pass', breakdown.pass, breakdown.total, 'pass')}
          ${renderVerdictRow('Fail', breakdown.fail, breakdown.total, 'fail')}
          ${renderVerdictRow('Skip', breakdown.skip, breakdown.total, 'skip')}
          ${renderVerdictRow('Untested', breakdown.untested, breakdown.total, 'untested')}
        </ul>
        ${suiteSection}
      </div>
    </div>
  `;
}

export function renderSuiteMeter(stats: { total: number; pass: number; fail: number; skip: number }): string {
  const denom = stats.total || 1;
  const passPct = (stats.pass / denom) * 100;
  const failPct = (stats.fail / denom) * 100;
  const skipPct = (stats.skip / denom) * 100;
  return `
    <div class="qa-rail__meter qa-rail__meter--segmented" aria-hidden="true">
      <span class="qa-rail__meter-pass" style="width:${passPct}%"></span>
      <span class="qa-rail__meter-fail" style="width:${failPct}%"></span>
      <span class="qa-rail__meter-skip" style="width:${skipPct}%"></span>
    </div>
  `;
}
