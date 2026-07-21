import { describe, expect, test } from 'vitest';
import {
  createAmbientStarfield,
  getAmbientStarfieldCounts,
} from './ambientStarfield.js';

describe('[FR-001] ambient starfield', () => {
  test('scales star counts by viewport width', () => {
    expect(getAmbientStarfieldCounts(500).twinkle).toBe(64);
    expect(getAmbientStarfieldCounts(1000).twinkle).toBe(96);
    expect(getAmbientStarfieldCounts(1600).twinkle).toBe(120);
  });

  test('builds dust, medium, and animated star tiers', () => {
    const counts = { dust: 4, medium: 2, twinkle: 3, cross: 1, spark: 1 };
    const field = createAmbientStarfield(counts);

    expect(field.dustBoxShadow).toContain('vw');
    expect(field.mediumBoxShadow).toContain('vh');
    expect(field.animatedStars).toHaveLength(5);
    expect(field.animatedStars.map((star) => star.tier)).toEqual([
      'twinkle',
      'twinkle',
      'twinkle',
      'cross',
      'spark',
    ]);
  });
});
