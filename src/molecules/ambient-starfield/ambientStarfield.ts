export type AmbientStarTier = 'twinkle' | 'cross' | 'spark';
export type AmbientStarTone = 'warm' | 'cool' | 'pink';

export interface AmbientStar {
  id: number;
  leftPercent: number;
  topPercent: number;
  sizePx: number;
  delaySeconds: number;
  durationSeconds: number;
  minOpacity: number;
  maxOpacity: number;
  tier: AmbientStarTier;
  tone: AmbientStarTone;
  rotationDeg: number;
}

export interface AmbientStarfield {
  dustBoxShadow: string;
  mediumBoxShadow: string;
  animatedStars: AmbientStar[];
}

export interface AmbientStarfieldCounts {
  dust: number;
  medium: number;
  twinkle: number;
  cross: number;
  spark: number;
}


function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickTone(): AmbientStarTone {
  const roll = Math.random();
  if (roll < 0.55) return 'warm';
  if (roll < 0.82) return 'cool';
  return 'pink';
}

function buildBoxShadow(count: number, options: {
  minAlpha: number;
  maxAlpha: number;
  glowPx?: number;
  coolRatio?: number;
}): string {
  const shadows: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const x = randomBetween(0, 100);
    const y = randomBetween(0, 100);
    const alpha = randomBetween(options.minAlpha, options.maxAlpha);
    const glow = options.glowPx ?? 0;
    const useCool = Math.random() < (options.coolRatio ?? 0.2);
    const color = useCool
      ? `rgb(180 215 255 / ${alpha.toFixed(3)})`
      : `rgb(251 242 196 / ${alpha.toFixed(3)})`;

    shadows.push(`${x}vw ${y}vh 0 ${glow}px ${color}`);
  }

  return shadows.join(', ');
}

function createTierStars(count: number, tier: AmbientStarTier, startId: number): AmbientStar[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;

    if (tier === 'twinkle') {
      return {
        id,
        leftPercent: Math.random() * 100,
        topPercent: Math.random() * 100,
        sizePx: randomBetween(1, 2),
        delaySeconds: Math.random() * 6,
        durationSeconds: randomBetween(1.8, 4.2),
        minOpacity: randomBetween(0.08, 0.22),
        maxOpacity: randomBetween(0.75, 1),
        tier,
        tone: pickTone(),
        rotationDeg: randomBetween(0, 360),
      };
    }

    if (tier === 'cross') {
      return {
        id,
        leftPercent: Math.random() * 100,
        topPercent: Math.random() * 100,
        sizePx: randomBetween(2.5, 4),
        delaySeconds: Math.random() * 8,
        durationSeconds: randomBetween(3.5, 7.5),
        minOpacity: randomBetween(0.15, 0.35),
        maxOpacity: randomBetween(0.88, 1),
        tier,
        tone: pickTone(),
        rotationDeg: randomBetween(0, 360),
      };
    }

    return {
      id,
      leftPercent: Math.random() * 100,
      topPercent: Math.random() * 100,
      sizePx: randomBetween(3, 5),
      delaySeconds: Math.random() * 10,
      durationSeconds: randomBetween(2.5, 5.5),
      minOpacity: randomBetween(0.05, 0.18),
      maxOpacity: randomBetween(0.92, 1),
      tier: 'spark',
      tone: Math.random() > 0.4 ? 'pink' : 'cool',
      rotationDeg: randomBetween(0, 360),
    };
  });
}

export function getAmbientStarfieldCounts(viewportWidth: number): AmbientStarfieldCounts {
  if (viewportWidth < 768) {
    return { dust: 90, medium: 28, twinkle: 64, cross: 14, spark: 8 };
  }

  if (viewportWidth < 1280) {
    return { dust: 140, medium: 42, twinkle: 96, cross: 22, spark: 10 };
  }

  return { dust: 180, medium: 56, twinkle: 120, cross: 28, spark: 12 };
}

export function createAmbientStarfield(counts: AmbientStarfieldCounts): AmbientStarfield {
  const twinkleStars = createTierStars(counts.twinkle, 'twinkle', 0);
  const crossStars = createTierStars(counts.cross, 'cross', twinkleStars.length);
  const sparkStars = createTierStars(counts.spark, 'spark', twinkleStars.length + crossStars.length);

  return {
    dustBoxShadow: buildBoxShadow(counts.dust, {
      minAlpha: 0.2,
      maxAlpha: 0.5,
      coolRatio: 0.25,
    }),
    mediumBoxShadow: buildBoxShadow(counts.medium, {
      minAlpha: 0.38,
      maxAlpha: 0.78,
      glowPx: 1,
      coolRatio: 0.3,
    }),
    animatedStars: [...twinkleStars, ...crossStars, ...sparkStars],
  };
}

export function ambientStarClassName(star: AmbientStar): string {
  return [
    'ambient__star',
    `ambient__star--${star.tier}`,
    `ambient__star--tone-${star.tone}`,
  ].join(' ');
}

export function ambientStarStyle(star: AmbientStar): {
  left: string;
  top: string;
  width: string;
  height: string;
  animationDelay: string;
  animationDuration: string;
  customProperties: Record<string, string>;
} {
  const customProperties: Record<string, string> = {
    '--star-opacity-min': String(star.minOpacity),
    '--star-opacity-max': String(star.maxOpacity),
    '--star-rotation': `${star.rotationDeg}deg`,
  };

  if (star.tier === 'cross') {
    customProperties['--flare-size'] = `${star.sizePx}px`;
  }

  return {
    left: `${star.leftPercent}%`,
    top: `${star.topPercent}%`,
    width: `${star.sizePx}px`,
    height: `${star.sizePx}px`,
    animationDelay: `${star.delaySeconds}s`,
    animationDuration: `${star.durationSeconds}s`,
    customProperties,
  };
}

export function applyStarStyle(element: HTMLElement, star: AmbientStar): void {
  const style = ambientStarStyle(star);
  element.style.left = style.left;
  element.style.top = style.top;
  element.style.width = style.width;
  element.style.height = style.height;
  element.style.animationDelay = style.animationDelay;
  element.style.animationDuration = style.animationDuration;
  for (const [key, value] of Object.entries(style.customProperties)) {
    element.style.setProperty(key, value);
  }
}
