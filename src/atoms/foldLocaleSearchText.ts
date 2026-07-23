/** Accent/punctuation folding for locale-friendly haystack match. */
export function foldLocaleSearchText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['']/g, '')
    .replace(/-/g, '');
}
