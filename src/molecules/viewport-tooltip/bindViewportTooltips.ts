import {
  applyViewportTooltipAnchor,
  clearViewportTooltipAnchor,
  parseViewportTooltipPlacement,
} from './applyViewportTooltipAnchor.js';
import { portalViewportPanel, unportalViewportPanel } from './portalViewportPanel.js';
import { VIEWPORT_TOOLTIP_HIDE_DELAY_MS, TOOLTIP_HOVER_MAX_MS } from './viewportTooltipConstants.js';
import { isPointerOverElement, shouldDismissHoveredTooltip } from './tooltipPointerDismiss.js';
import {
  canCloseTooltipLayer,
  closeTooltipLayer,
  forceCloseTooltipLayer,
  openTooltipLayer,
  subscribeTooltipLayerChildClosed,
  subscribeTooltipLayerForceClosed,
} from '../tooltip-stack/tooltipLayerStack.js';

const TRIGGER_SELECTOR = '[data-viewport-tooltip]';
const PANEL_SELECTOR = '[data-viewport-tooltip-panel], [role="tooltip"]';

export { VIEWPORT_TOOLTIP_HIDE_DELAY_MS };

function prefersHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function getTooltipPanel(trigger: HTMLElement): HTMLElement | null {
  return trigger.querySelector<HTMLElement>(PANEL_SELECTOR);
}

function containsTarget(trigger: HTMLElement, tooltip: HTMLElement, target: EventTarget | null): boolean {
  return target instanceof Node && (trigger.contains(target) || tooltip.contains(target));
}

export function bindViewportTooltips(root: ParentNode = document): () => void {
  const triggers = [...root.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)];
  if (!triggers.length) return () => {};

  const triggerTooltips = new WeakMap<HTMLElement, HTMLElement>();
  const triggerLayerIds = new WeakMap<HTMLElement, number>();
  let activeTrigger: HTMLElement | null = null;
  let pinnedTrigger: HTMLElement | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let hoverMaxTimer: ReturnType<typeof setTimeout> | null = null;
  const cleanups: Array<() => void> = [];
  const canHover = prefersHover();

  const cancelHide = () => {
    if (!hideTimer) return;
    clearTimeout(hideTimer);
    hideTimer = null;
  };

  const clearHoverMax = () => {
    if (!hoverMaxTimer) return;
    clearTimeout(hoverMaxTimer);
    hoverMaxTimer = null;
  };

  const hideTooltip = (trigger: HTMLElement) => {
    const tooltip = triggerTooltips.get(trigger);
    if (!tooltip) return;

    const layerId = triggerLayerIds.get(trigger);
    if (layerId !== undefined && !canCloseTooltipLayer(layerId)) return;

    clearHoverMax();
    tooltip.classList.remove('is-open', 'is-pinned');
    unportalViewportPanel(tooltip);
    clearViewportTooltipAnchor(tooltip);
    tooltip.style.display = '';
    trigger.setAttribute('aria-expanded', 'false');
    if (layerId !== undefined) {
      closeTooltipLayer(layerId);
      triggerLayerIds.delete(trigger);
    }
    if (pinnedTrigger === trigger) pinnedTrigger = null;
    if (activeTrigger === trigger) activeTrigger = null;
  };

  const hideAll = () => {
    cancelHide();
    pinnedTrigger = null;
    for (const trigger of triggers) hideTooltip(trigger);
  };

  const showTooltip = (trigger: HTMLElement, pinned = false, viaHover = false) => {
    const tooltip = triggerTooltips.get(trigger);
    if (!tooltip) return;

    if (activeTrigger && activeTrigger !== trigger) {
      hideTooltip(activeTrigger);
    }

    cancelHide();
    clearHoverMax();
    activeTrigger = trigger;
    pinnedTrigger = pinned ? trigger : pinnedTrigger;
    tooltip.classList.toggle('is-pinned', pinnedTrigger === trigger);
    tooltip.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    portalViewportPanel(tooltip);
    const previousLayerId = triggerLayerIds.get(trigger);
    if (previousLayerId !== undefined) closeTooltipLayer(previousLayerId);
    triggerLayerIds.set(
      trigger,
      openTooltipLayer({ kind: 'viewport-panel', anchor: trigger, surface: tooltip }),
    );
    applyViewportTooltipAnchor(trigger, tooltip, {
      preferred: parseViewportTooltipPlacement(trigger.dataset.tooltipPlacement),
    });

    if (viaHover && !pinned) {
      hoverMaxTimer = setTimeout(() => {
        if (pinnedTrigger === trigger) return;
        if (isPointerOverElement(trigger) || isPointerOverElement(tooltip)) return;
        hideTooltip(trigger);
      }, TOOLTIP_HOVER_MAX_MS);
    }
  };

  const scheduleHide = (trigger: HTMLElement) => {
    if (pinnedTrigger === trigger) return;
    const layerId = triggerLayerIds.get(trigger);
    if (layerId !== undefined && !canCloseTooltipLayer(layerId)) return;
    cancelHide();
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (pinnedTrigger === trigger || activeTrigger !== trigger) return;
      const tooltip = triggerTooltips.get(trigger);
      if (isPointerOverElement(trigger) || isPointerOverElement(tooltip ?? null)) return;
      hideTooltip(trigger);
    }, VIEWPORT_TOOLTIP_HIDE_DELAY_MS);
  };

  const openFromHover = (trigger: HTMLElement) => {
    cancelHide();
    showTooltip(trigger, false, true);
  };

  const togglePinned = (trigger: HTMLElement) => {
    cancelHide();
    if (activeTrigger === trigger && pinnedTrigger === trigger) {
      hideTooltip(trigger);
      return;
    }
    showTooltip(trigger, true);
  };

  const repositionActive = () => {
    if (!activeTrigger) return;
    const tooltip = triggerTooltips.get(activeTrigger);
    if (!tooltip?.classList.contains('is-open')) return;
    applyViewportTooltipAnchor(activeTrigger, tooltip, {
      preferred: parseViewportTooltipPlacement(activeTrigger.dataset.tooltipPlacement),
    });
  };

  const handleScroll = () => {
    if (!activeTrigger) return;
    const tooltip = triggerTooltips.get(activeTrigger);
    if (!tooltip?.classList.contains('is-open')) return;
    if (shouldDismissHoveredTooltip(activeTrigger, [tooltip])) {
      if (pinnedTrigger !== activeTrigger) hideTooltip(activeTrigger);
      return;
    }
    repositionActive();
  };

  for (const trigger of triggers) {
    const tooltip = getTooltipPanel(trigger);
    if (!tooltip) continue;
    triggerTooltips.set(trigger, tooltip);

    const onTriggerMouseEnter = () => {
      if (!canHover) return;
      openFromHover(trigger);
    };
    const onTriggerMouseLeave = () => {
      if (!canHover) return;
      scheduleHide(trigger);
    };
    const onPanelMouseEnter = () => {
      if (!canHover) return;
      cancelHide();
    };
    const onPanelMouseLeave = () => {
      if (!canHover) return;
      scheduleHide(trigger);
    };
    const onFocusIn = () => {
      if (!canHover) return;
      openFromHover(trigger);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (pinnedTrigger === trigger) return;
      if (containsTarget(trigger, tooltip, event.relatedTarget)) return;
      scheduleHide(trigger);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        togglePinned(trigger);
      }
      if (event.key === 'Escape') hideAll();
    };
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      togglePinned(trigger);
    };
    const onPanelPointerDown = (event: Event) => {
      event.stopPropagation();
    };

    trigger.addEventListener('mouseenter', onTriggerMouseEnter);
    trigger.addEventListener('mouseleave', onTriggerMouseLeave);
    trigger.addEventListener('focusin', onFocusIn);
    trigger.addEventListener('focusout', onFocusOut);
    trigger.addEventListener('keydown', onKeyDown);
    trigger.addEventListener('click', onClick);
    tooltip.addEventListener('mouseenter', onPanelMouseEnter);
    tooltip.addEventListener('mouseleave', onPanelMouseLeave);
    tooltip.addEventListener('pointerdown', onPanelPointerDown);

    cleanups.push(() => {
      trigger.removeEventListener('mouseenter', onTriggerMouseEnter);
      trigger.removeEventListener('mouseleave', onTriggerMouseLeave);
      trigger.removeEventListener('focusin', onFocusIn);
      trigger.removeEventListener('focusout', onFocusOut);
      trigger.removeEventListener('keydown', onKeyDown);
      trigger.removeEventListener('click', onClick);
      tooltip.removeEventListener('mouseenter', onPanelMouseEnter);
      tooltip.removeEventListener('mouseleave', onPanelMouseLeave);
      tooltip.removeEventListener('pointerdown', onPanelPointerDown);
      hideTooltip(trigger);
      triggerLayerIds.delete(trigger);
    });
  }

  const unsubscribeChildClosed = subscribeTooltipLayerChildClosed((parentId) => {
    for (const trigger of triggers) {
      if (triggerLayerIds.get(trigger) !== parentId) continue;
      const tooltip = triggerTooltips.get(trigger);
      if (isPointerOverElement(trigger) || isPointerOverElement(tooltip ?? null)) return;
      scheduleHide(trigger);
    }
  });

  const unsubscribeForceClosed = subscribeTooltipLayerForceClosed((layerId) => {
    for (const trigger of triggers) {
      if (triggerLayerIds.get(trigger) !== layerId) continue;
      hideTooltip(trigger);
    }
  });

  const onViewportChange = () => handleScroll();
  const onDocumentPointerDown = (event: Event) => {
    if (!activeTrigger) return;
    const tooltip = triggerTooltips.get(activeTrigger);
    if (!tooltip) return;
    if (containsTarget(activeTrigger, tooltip, event.target)) return;
    hideAll();
  };
  const onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && activeTrigger) hideAll();
  };

  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  document.addEventListener('pointerdown', onDocumentPointerDown);
  document.addEventListener('keydown', onDocumentKeyDown);

  return () => {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    document.removeEventListener('pointerdown', onDocumentPointerDown);
    document.removeEventListener('keydown', onDocumentKeyDown);
    unsubscribeChildClosed();
    unsubscribeForceClosed();
    cancelHide();
    clearHoverMax();
    for (const trigger of triggers) {
      const layerId = triggerLayerIds.get(trigger);
      if (layerId !== undefined) forceCloseTooltipLayer(layerId);
    }
    cleanups.forEach((cleanup) => cleanup());
    activeTrigger = null;
    pinnedTrigger = null;
  };
}
