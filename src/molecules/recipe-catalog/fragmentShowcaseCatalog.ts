import { ALLOY_CATALOG, type AlloyCatalogEntry } from './alloysRecipeCatalog.js';

export interface FragmentShowcaseEntry {
  alloy: AlloyCatalogEntry;
  vein: string;
}

const FRAGMENT_VEINS: Record<string, string> = {
  cobalt: 'coal, copper, and lapis veins',
  nickel: 'iron veins',
  mythril: 'redstone and emerald veins',
  adamantine: 'diamond ore and ancient debris',
};

export function fragmentShowcaseEntries(): FragmentShowcaseEntry[] {
  return ALLOY_CATALOG
    .filter((alloy) => alloy.hasFragment)
    .map((alloy) => ({
      alloy,
      vein: FRAGMENT_VEINS[alloy.id] ?? alloy.tagline,
    }));
}
