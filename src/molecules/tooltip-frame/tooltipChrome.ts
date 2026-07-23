/** CSS-only tooltip chrome — top bar + bottom bar, no image assets. */

export function renderTooltipTopBar(): string {
  return `
    <div class="game-tooltip__bar game-tooltip__bar--top" aria-hidden="true">
      <span class="game-tooltip__ornament game-tooltip__ornament--left"></span>
      <span class="game-tooltip__jewel"></span>
      <span class="game-tooltip__ornament game-tooltip__ornament--right"></span>
    </div>
  `;
}

export function renderTooltipBottomBar(): string {
  return `
    <div class="game-tooltip__bar game-tooltip__bar--bottom" aria-hidden="true">
      <span class="game-tooltip__stud"></span>
    </div>
  `;
}
