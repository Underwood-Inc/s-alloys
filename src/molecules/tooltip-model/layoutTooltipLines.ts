import type { TooltipLine } from './types.js';

export interface TooltipTierMeta {
  tier: string;
  step: string;
  baseline: string;
}

export interface TooltipStatEntry {
  key: string;
  value: string;
}

export interface TooltipPassiveEntry {
  gear?: string;
  text: string;
}

export interface TooltipLineLayout {
  tier?: TooltipTierMeta;
  descriptions: string[];
  stats: TooltipStatEntry[];
  enchants: string[];
  passives: TooltipPassiveEntry[];
}

const TIER_PATTERN = /^Tier:\s*(.+?)\s*·\s*Step\s+(\d+)\s*·\s*≈(.+)$/i;

export function parseTierLine(text: string): TooltipTierMeta | undefined {
  const match = text.match(TIER_PATTERN);
  if (!match) return undefined;
  return { tier: match[1].trim(), step: match[2], baseline: match[3].trim() };
}

export function parseStatToken(text: string): TooltipStatEntry | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  const enchant = trimmed.match(/^Enchantability:\s*(.+)$/i);
  if (enchant) return { key: 'Enchantability', value: enchant[1].trim() };

  const ingots = trimmed.match(/^(\d+)\s+ingot\(s\)$/i);
  if (ingots) return { key: 'Cost', value: `${ingots[1]} ingots` };

  if (trimmed.startsWith('+') || trimmed.startsWith('≈')) {
    return { key: 'Bonus', value: trimmed };
  }

  const labeled = trimmed.match(/^([A-Za-z][A-Za-z ]*?)\s+(.+)$/);
  if (labeled) return { key: labeled[1].trim(), value: labeled[2].trim() };

  return { key: trimmed, value: '' };
}

export function parsePassiveLine(text: string): TooltipPassiveEntry {
  const tagged = text.match(/^([a-z]+):\s*(.+)$/i);
  if (tagged) {
    return { gear: tagged[1], text: tagged[2].trim() };
  }
  return { text: text.replace(/^While (?:worn|held):\s*/i, '') };
}

export function layoutTooltipLines(lines: TooltipLine[]): TooltipLineLayout {
  const layout: TooltipLineLayout = {
    descriptions: [],
    stats: [],
    enchants: [],
    passives: [],
  };

  for (const line of lines) {
    if (line.kind === 'tier') {
      layout.tier = parseTierLine(line.text) ?? undefined;
      continue;
    }

    if (line.kind === 'body') {
      layout.descriptions.push(line.text);
      continue;
    }

    if (line.kind === 'stat') {
      for (const part of line.text.split(/\s*·\s*/)) {
        const entry = parseStatToken(part);
        if (entry) layout.stats.push(entry);
      }
      continue;
    }

    if (line.kind === 'enchant') {
      layout.enchants.push(line.text);
      continue;
    }

    if (line.kind === 'passive') {
      layout.passives.push(parsePassiveLine(line.text));
    }
  }

  return layout;
}
