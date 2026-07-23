/** Relative public paths → short content hashes (see tools/asset-manifest-plugin.mjs). */
let manifest: Record<string, string> = {};
let manifestPromise: Promise<void> | null = null;

export function setAssetManifest(entries: Record<string, string>): void {
  manifest = entries;
}

export function preloadAssetManifest(): Promise<void> {
  if (!manifestPromise) {
    const url = `${import.meta.env.BASE_URL}asset-manifest.json`;
    manifestPromise = fetch(url)
      .then((response) => (response.ok ? response.json() : {}))
      .then((entries: Record<string, string>) => {
        manifest = entries;
      })
      .catch(() => {
        manifest = {};
      });
  }
  return manifestPromise;
}

export function normalizeAssetPath(path: string): string {
  const withoutQuery = stripAssetVersion(path);
  let trimmed = withoutQuery.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL.replace(/^\/+|\/+$/g, '');
  if (base && (trimmed === base || trimmed.startsWith(`${base}/`))) {
    trimmed = trimmed === base ? '' : trimmed.slice(base.length + 1);
  }
  return trimmed;
}

export function stripAssetVersion(url: string): string {
  const query = url.indexOf('?');
  return query >= 0 ? url.slice(0, query) : url;
}

export function assetUrl(relativePath: string, baseUrl = import.meta.env.BASE_URL): string {
  const normalized = normalizeAssetPath(relativePath);
  const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const hash = manifest[normalized];
  const url = `${root}${normalized}`;
  return hash ? `${url}?v=${hash}` : url;
}
