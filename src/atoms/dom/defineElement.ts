export function defineAlloysElement(tag: string, ctor: CustomElementConstructor) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
