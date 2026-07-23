import { currentAppPath, resolveRoute } from '../../app/router.js';
import type { RecipeSelection } from '../recipe-selection/recipeSelection.js';
import { normalizeRecipeSelection } from '../recipe-selection/recipeSelection.js';
import type { RecipeTabId } from '../recipe-catalog/alloysRecipeCatalog.js';
import { TOOLTIP_HIDE_EVENT } from '../tooltip-model/types.js';

export const RECIPE_EXPLORER_SELECT_EVENT = 'alloys-recipe-explorer-select';

export function recipeExplorerQueryFromSelection(selection: RecipeSelection): URLSearchParams {
  return new URLSearchParams({
    alloy: selection.alloyId,
    tab: selection.tab,
  });
}

export function recipeSelectionFromQuery(search = window.location.search): RecipeSelection | null {
  const params = new URLSearchParams(search);
  const alloyId = params.get('alloy');
  if (!alloyId) return null;

  const tab = (params.get('tab') ?? 'ingot') as RecipeTabId;
  return normalizeRecipeSelection({ alloyId, tab });
}

export function recipeExplorerPath(selection: RecipeSelection): string {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const search = recipeExplorerQueryFromSelection(selection).toString();
  return `${basePath}/guide/alloys?${search}`;
}

function dismissTooltips(): void {
  document.dispatchEvent(new CustomEvent(TOOLTIP_HIDE_EVENT, { bubbles: true }));
}

export function applyRecipeExplorerSelection(selection: RecipeSelection): boolean {
  const explorer = document.querySelector('recipe-explorer');
  if (!explorer) return false;

  explorer.setAttribute('initial-alloy', selection.alloyId);
  explorer.setAttribute('initial-tab', selection.tab);
  explorer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  explorer.dispatchEvent(new CustomEvent(RECIPE_EXPLORER_SELECT_EVENT, {
    bubbles: true,
    detail: selection,
  }));
  return true;
}

function queueRecipeExplorerMount(selection: RecipeSelection, attempts = 0): void {
  if (applyRecipeExplorerSelection(selection)) return;
  if (attempts > 24) return;
  requestAnimationFrame(() => queueRecipeExplorerMount(selection, attempts + 1));
}

export function syncRecipeExplorerUrl(selection: RecipeSelection, replace = true): void {
  const route = resolveRoute(currentAppPath());
  if (route.view !== 'guide' || route.slug !== 'alloys') return;

  const next = recipeExplorerPath(selection);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === next) return;

  if (replace) window.history.replaceState({}, '', next);
  else window.history.pushState({}, '', next);
}

export function openRecipeExplorer(raw: RecipeSelection): boolean {
  const selection = normalizeRecipeSelection(raw);
  if (!selection) return false;

  dismissTooltips();

  const route = resolveRoute(currentAppPath());
  const onAlloys = route.view === 'guide' && route.slug === 'alloys';
  const path = recipeExplorerPath(selection);

  if (!onAlloys) {
    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
    window.dispatchEvent(new PopStateEvent('popstate'));
    queueRecipeExplorerMount(selection);
    return true;
  }

  if (`${window.location.pathname}${window.location.search}` !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return applyRecipeExplorerSelection(selection);
}
