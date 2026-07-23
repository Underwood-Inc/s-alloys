import { test, expect } from 'vitest';
import { parseGearKind, resolveQaCaseIcon } from './qaCaseIcon.js';
import type { QaCase } from '../qa-session/qaSessionTypes.js';

const base = '/s-alloys/';

function caseWith(overrides: Partial<QaCase>): QaCase {
  return {
    id: 'X-01',
    suite: 'smoke',
    kind: 'smoke',
    title: 'Example',
    objective: '',
    severity: 'low',
    ...overrides,
  };
}

/**
 * @description Case pages resolve ingot, fragment, and gear icons from suite and id.
 */
test('[FR-005] resolveQaCaseIcon maps ingot fragment and gear cases', () => {
  expect(resolveQaCaseIcon(caseWith({ id: 'P-ingot-tin', suite: 'ingots', alloy: 'tin', title: 'Craft Tin Ingot' }), base)).toEqual({
    url: '/s-alloys/guide/ingots/tin.png',
    label: 'Tin ingot',
  });

  expect(resolveQaCaseIcon(caseWith({ id: 'P-frag-cobalt', suite: 'fragments', alloy: 'cobalt', title: 'Cobalt from alloy fragments' }), base)).toEqual({
    url: '/s-alloys/guide/fragments/cobalt.png',
    label: 'Cobalt fragment',
  });

  expect(resolveQaCaseIcon(caseWith({ id: 'P-tin-pickaxe', suite: 'gear-positive', alloy: 'tin', title: 'Tin pickaxe — alloy craft' }), base)).toEqual({
    url: '/s-alloys/guide/gear/tin_pickaxe.png',
    label: 'Tin pickaxe',
  });

  expect(resolveQaCaseIcon(caseWith({ id: 'E-silver-helmet', suite: 'effects', alloy: 'silver', title: 'Silver helmet — Night Vision' }), base)).toEqual({
    url: '/s-alloys/guide/gear/silver_helmet.png',
    label: 'Silver helmet',
  });
});

test('[FR-005] resolveQaCaseIcon falls back to suite art when no alloy is set', () => {
  expect(resolveQaCaseIcon(caseWith({ id: 'SM-01', suite: 'smoke', title: 'Datapack enabled' }), base).url).toContain('install.png');
  expect(resolveQaCaseIcon(caseWith({ id: 'RC-ingot', suite: 'signoff', title: 'Sign-off — ingots' }), base).url).toContain('checklist.png');
});

test('[FR-005] parseGearKind prefers longer gear ids such as chestplate', () => {
  expect(parseGearKind('M-01', 'Mixed Steel chestplate (7 alloy + 1 plain)')).toBe('chestplate');
});
