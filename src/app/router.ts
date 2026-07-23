export type AppRoute =
  | { view: 'home' }
  | { view: 'checklist' }
  | { view: 'guide'; slug: string | null };

export function resolveRoute(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '') return { view: 'home' };
  if (path === '/checklist' || path === '/qa') return { view: 'checklist' };
  if (path === '/guide') return { view: 'guide', slug: null };
  if (path.startsWith('/guide/')) {
    let slug = path.slice('/guide/'.length);
    if (slug === 'qa') slug = 'checklist';
    return slug ? { view: 'guide', slug } : { view: 'guide', slug: null };
  }
  return { view: 'home' };
}

export function routeToPath(route: AppRoute): string {
  if (route.view === 'home') return '/';
  if (route.view === 'checklist') return '/checklist';
  if (route.view === 'guide') return route.slug ? `/guide/${route.slug}` : '/guide';
  return '/';
}

export function currentAppPath(): string {
  const base = '/s-alloys';
  const path = window.location.pathname;
  return path.startsWith(base) ? path.slice(base.length) || '/' : path || '/';
}
