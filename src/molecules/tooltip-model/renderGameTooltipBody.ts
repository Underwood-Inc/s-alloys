import { escapeHtml } from '../../atoms/dom/defineElement.js';
import type { TooltipOreSource, TooltipRarity } from './types.js';
import { layoutTooltipLines, type TooltipLineLayout } from './layoutTooltipLines.js';
import type { TooltipLine } from './types.js';

function formatStatKey(key: string): string {
  const labels: Record<string, string> = {
    Tough: 'Toughness',
    Dur: 'Durability',
    Cost: 'Craft cost',
    Bonus: 'Effect',
    'Drop rate': 'Drop rate',
    Obtain: 'How to get',
    'Found in': 'Found in',
    'Best Y': 'Best Y-level',
    Spawns: 'Spawn range',
  };
  return labels[key] ?? key;
}

function rarityLabel(rarity: TooltipRarity): string {
  if (rarity === 'ingredient') return 'Ingredient';
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/** Rarity + tier on row two; enchantability on row three — under the item title. */
export function renderGameTooltipMeta(lines: TooltipLine[], rarity: TooltipRarity): string {
  const layout = layoutTooltipLines(lines);

  const tierChips = [
    `<span class="game-tooltip__meta-chip game-tooltip__meta-chip--rarity">${escapeHtml(rarityLabel(rarity))}</span>`,
  ];
  if (layout.tier) {
    tierChips.push(`<span class="game-tooltip__meta-chip">Tier ${escapeHtml(layout.tier.step)}</span>`);
  }

  const detailChips: string[] = [];
  const enchant = layout.stats.find((stat) => stat.key === 'Enchantability');
  if (enchant) {
    detailChips.push(
      `<span class="game-tooltip__meta-chip game-tooltip__meta-chip--enchant"><span class="game-tooltip__meta-chip-label">Enchantability</span><strong class="game-tooltip__meta-chip-value">${escapeHtml(enchant.value)}</strong></span>`,
    );
  }

  return `
    <div class="game-tooltip__meta">
      <div class="game-tooltip__meta-row">${tierChips.join('')}</div>
      ${detailChips.length ? `<div class="game-tooltip__meta-row game-tooltip__meta-row--detail">${detailChips.join('')}</div>` : ''}
    </div>
  `;
}

function renderDescriptions(layout: TooltipLineLayout): string {
  if (!layout.descriptions.length) return '';
  const label = layout.descriptions[0]?.toLowerCase().includes('ingot') ? 'Recipe' : 'Details';
  return `
    <section class="game-tooltip__section game-tooltip__section--desc">
      <h3 class="game-tooltip__section-label">${label}</h3>
      ${layout.descriptions.map((text) => `
        <p class="game-tooltip__desc">${escapeHtml(text)}</p>
      `).join('')}
    </section>
  `;
}

function renderPrimaryStats(stats: TooltipLineLayout['stats']): string {
  if (!stats.length) return '';

  return `
    <dl class="game-tooltip__stat-grid">
      ${stats.map((stat) => `
        <div class="game-tooltip__stat">
          <dt>${escapeHtml(formatStatKey(stat.key))}</dt>
          <dd>${escapeHtml(stat.value || '—')}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderStatGrid(layout: TooltipLineLayout): string {
  const primary = layout.stats.filter((stat) => stat.key !== 'Enchantability');
  if (!primary.length) return '';

  const dropRate = primary.find((stat) => stat.key === 'Drop rate');
  const acquisition = primary.filter((stat) => stat.key === 'Obtain' || stat.key === 'Found in');
  const mining = primary.filter((stat) => stat.key === 'Best Y' || stat.key === 'Spawns');
  const other = primary.filter((stat) => (
    stat.key !== 'Drop rate'
    && stat.key !== 'Obtain'
    && stat.key !== 'Found in'
    && stat.key !== 'Best Y'
    && stat.key !== 'Spawns'
  ));

  const sections: string[] = [];

  if (dropRate) {
    sections.push(`
      <section class="game-tooltip__section game-tooltip__section--drop">
        <h3 class="game-tooltip__section-label">Drop rate</h3>
        <p class="game-tooltip__desc">${escapeHtml(dropRate.value)}</p>
      </section>
    `);
  }

  if (other.length) {
    sections.push(`
      <section class="game-tooltip__section game-tooltip__section--stats">
        <h3 class="game-tooltip__section-label">Stats</h3>
        ${renderPrimaryStats(other)}
      </section>
    `);
  }

  if (acquisition.length) {
    sections.push(`
      <section class="game-tooltip__section game-tooltip__section--acquisition">
        <h3 class="game-tooltip__section-label">Acquisition</h3>
        ${renderPrimaryStats(acquisition)}
      </section>
    `);
  }

  if (mining.length) {
    sections.push(`
      <section class="game-tooltip__section game-tooltip__section--mining">
        <h3 class="game-tooltip__section-label">Mining</h3>
        ${renderPrimaryStats(mining)}
      </section>
    `);
  }

  return sections.join('');
}

export function renderGameTooltipOreSources(sources: TooltipOreSource[]): string {
  if (!sources.length) return '';

  return `
    <section class="game-tooltip__section game-tooltip__section--ores">
      <h3 class="game-tooltip__section-label">Source ores</h3>
      <p class="game-tooltip__ore-hint">Hover an ore for best Y-levels.</p>
      <ul class="game-tooltip__ore-list">
        ${sources.map((source) => `
          <li>
            <button
              type="button"
              class="game-tooltip__ore-chip"
              data-ore-id="${escapeHtml(source.ingredientId)}"
              aria-label="${escapeHtml(source.label)} mining levels"
            >
              <img class="game-tooltip__ore-icon" src="${escapeHtml(source.icon)}" alt="" loading="lazy" decoding="async" />
              <span class="game-tooltip__ore-label">${escapeHtml(source.label)}</span>
            </button>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

export function renderGameTooltipBody(lines: TooltipLine[], oreSources?: TooltipOreSource[]): string {
  const layout = layoutTooltipLines(lines);

  return `
    <div class="game-tooltip__content">
      ${renderDescriptions(layout)}
      ${renderStatGrid(layout)}
      ${renderEnchants(layout)}
      ${renderPassives(layout)}
      ${oreSources?.length ? renderGameTooltipOreSources(oreSources) : ''}
    </div>
  `;
}

function renderEnchants(layout: TooltipLineLayout): string {
  if (!layout.enchants.length) return '';
  return `
    <section class="game-tooltip__section game-tooltip__section--enchants">
      <h3 class="game-tooltip__section-label">Intrinsic</h3>
      <ul class="game-tooltip__enchant-list">
        ${layout.enchants.map((text) => `
          <li class="game-tooltip__enchant">${escapeHtml(text)}</li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderPassives(layout: TooltipLineLayout): string {
  if (!layout.passives.length) return '';
  return `
    <section class="game-tooltip__section game-tooltip__section--passives">
      <h3 class="game-tooltip__section-label">Passives</h3>
      <ul class="game-tooltip__passive-list">
        ${layout.passives.map((passive) => `
          <li class="game-tooltip__passive">
            ${passive.gear ? `<span class="game-tooltip__passive-gear">${escapeHtml(passive.gear)}</span>` : ''}
            <span class="game-tooltip__passive-text">${escapeHtml(passive.text)}</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}
