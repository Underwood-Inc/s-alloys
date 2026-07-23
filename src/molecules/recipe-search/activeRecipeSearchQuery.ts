/** Active recipe-explorer search — tooltips read this for highlight while open. */
let activeQuery = '';

export function setActiveRecipeSearchQuery(query: string): void {
  activeQuery = query;
}

export function getActiveRecipeSearchQuery(): string {
  return activeQuery;
}
