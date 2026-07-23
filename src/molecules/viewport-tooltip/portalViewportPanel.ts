const portals = new WeakMap<HTMLElement, Comment>();

/** Move a panel to `document.body` so `position: fixed` uses the viewport, not a filtered ancestor. */
export function portalViewportPanel(panel: HTMLElement): () => void {
  if (!portals.has(panel)) {
    const placeholder = document.createComment('viewport-anchored-panel');
    panel.before(placeholder);
    portals.set(panel, placeholder);
    panel.dataset.viewportPortaled = 'true';
    document.body.append(panel);
  }
  return () => unportalViewportPanel(panel);
}

export function unportalViewportPanel(panel: HTMLElement): void {
  const placeholder = portals.get(panel);
  if (!placeholder) return;
  placeholder.replaceWith(panel);
  portals.delete(panel);
  panel.removeAttribute('data-viewport-portaled');
}
