import { escapeHtml } from '../../atoms/dom/defineElement.js';
import type { TooltipRarity } from './types.js';
import { layoutTooltipLines, type TooltipLineLayout } from './layoutTooltipLines.js';
import type { TooltipLine } from './types.js';

function formatStatKey(key: string): string {
  const labels: Record<string, string> = {
    Tough: 'Toughness',
    Dur: 'Durability',
    Cost: 'Craft cost',
    Bonus: 'Effect',
  };
  return labels[key] ?? key;
}

function rarityLabel(rarity: TooltipRarity): string {
  if (rarity === 'ingredient') return 'Ingredient';
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/** Rarity + tier step + vanilla baseline — lives under the item title in the header. */
export function renderGameTooltipMeta(lines: TooltipLine[], rarity: TooltipRarity): string {
  const layout = layoutTooltipLines(lines);
  const chips: string[] = [
    `<span class="game-tooltip__meta-chip game-tooltip__meta-chip--rarity">${escapeHtml(rarityLabel(rarity))}</span>`,
  ];

  if (layout.tier) {
    chips.push(`<span class="game-tooltip__meta-chip">Tier ${escapeHtml(layout.tier.step)}</span>`);
    chips.push(
      `<span class="game-tooltip__meta-chip game-tooltip__meta-chip--muted">≈${escapeHtml(layout.tier.baseline)}</span>`,
    );
  }

  return `<div class="game-tooltip__meta" aria-label="Item tier">${chips.join('')}</div>`;
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
  const primary = stats.filter((stat) => stat.key !== 'Enchantability');
  if (!primary.length) return '';

  return `
    <dl class="game-tooltip__stat-grid">
      ${primary.map((stat) => `
        <div class="game-tooltip__stat">
          <dt>${escapeHtml(formatStatKey(stat.key))}</dt>
          <dd>${escapeHtml(stat.value || '—')}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderEnchantability(stat: TooltipLineLayout['stats'][number] | undefined): string {
  if (!stat) return '';
  return `
    <div class="game-tooltip__stat-compact">
      <span class="game-tooltip__stat-compact-label">${escapeHtml(formatStatKey(stat.key))}</span>
      <span class="game-tooltip__stat-compact-value">${escapeHtml(stat.value)}</span>
    </div>
  `;
}

function renderStatGrid(layout: TooltipLineLayout): string {
  if (!layout.stats.length) return '';

  const enchant = layout.stats.find((stat) => stat.key === 'Enchantability');
  const hasPrimary = layout.stats.some((stat) => stat.key !== 'Enchantability');

  return `
    <section class="game-tooltip__section game-tooltip__section--stats">
      ${hasPrimary ? '<h3 class="game-tooltip__section-label">Stats</h3>' : ''}
      ${renderPrimaryStats(layout.stats)}
      ${renderEnchantability(enchant)}
    </section>
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

export function renderGameTooltipBody(lines: TooltipLine[]): string {
  const layout = layoutTooltipLines(lines);

  return `
    <div class="game-tooltip__content">
      ${renderDescriptions(layout)}
      ${renderStatGrid(layout)}
      ${renderEnchants(layout)}
      ${renderPassives(layout)}
    </div>
  `;
}
