import { renderAssetImage } from '../../atoms/asset-image/renderAssetImage.js';
import { assetUrl } from '../../lib/assetUrl.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';
import type { GearKind } from '../recipe-catalog/gearLayouts.js';

const GEAR_KINDS: GearKind[] = [
  'crossbow',
  'chestplate',
  'leggings',
  'pickaxe',
  'helmet',
  'shovel',
  'sword',
  'boots',
  'hoe',
  'axe',
  'bow',
];

const SUITE_FALLBACK_ICONS: Record<string, { file: string; label: string }> = {
  smoke: { file: 'guide/chapters/install.png', label: 'Install' },
  ops: { file: 'guide/chapters/crafting.png', label: 'Unlocks' },
  signoff: { file: 'guide/chapters/checklist.png', label: 'Sign-off' },
  mixed: { file: 'guide/cards/crafting.png', label: 'Mixed craft' },
};

export interface QaCaseIcon {
  url: string;
  label: string;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseGearKind(caseId: string, title: string): GearKind | null {
  const haystack = `${caseId} ${title}`.toLowerCase();
  for (const kind of GEAR_KINDS) {
    if (haystack.includes(kind)) return kind;
  }
  return null;
}

export function resolveQaCaseIcon(testCase: QaCase, baseUrl = import.meta.env.BASE_URL): QaCaseIcon {
  const alloy = testCase.alloy;

  if (alloy) {
    if (testCase.suite === 'ingots' || caseIdLooksLikeIngot(testCase.id)) {
      return {
        url: assetUrl(`guide/ingots/${alloy}.png`, baseUrl),
        label: `${titleCase(alloy)} ingot`,
      };
    }

    if (testCase.suite === 'fragments' || caseIdLooksLikeFragment(testCase.id)) {
      return {
        url: assetUrl(`guide/fragments/${alloy}.png`, baseUrl),
        label: `${titleCase(alloy)} fragment`,
      };
    }

    const gear = parseGearKind(testCase.id, testCase.title);
    if (gear) {
      return {
        url: assetUrl(`guide/gear/${alloy}_${gear}.png`, baseUrl),
        label: `${titleCase(alloy)} ${gear}`,
      };
    }

    return {
      url: assetUrl(`guide/ingots/${alloy}.png`, baseUrl),
      label: `${titleCase(alloy)} ingot`,
    };
  }

  const fallback = SUITE_FALLBACK_ICONS[testCase.suite];
  if (fallback) {
    return {
      url: assetUrl(fallback.file, baseUrl),
      label: fallback.label,
    };
  }

  return {
    url: assetUrl('guide/chapters/checklist.png', baseUrl),
    label: 'Test case',
  };
}

function caseIdLooksLikeIngot(caseId: string): boolean {
  return caseId.includes('-ingot-');
}

function caseIdLooksLikeFragment(caseId: string): boolean {
  return caseId.startsWith('P-frag-') || caseId.startsWith('N-frag-');
}

export function renderQaCaseIcon(testCase: QaCase, options: { size?: 'list' | 'detail'; baseUrl?: string } = {}): string {
  const icon = resolveQaCaseIcon(testCase, options.baseUrl);
  const sizeClass = options.size === 'list' ? 'qa-case-icon--list' : 'qa-case-icon--detail';
  return renderAssetImage({
    src: icon.url,
    alt: '',
    loading: 'lazy',
    decoding: 'async',
    title: icon.label,
    class: `qa-case-icon ${sizeClass}`,
  });
}
