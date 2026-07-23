import {
  applyViewportTooltipAnchor,
  clearViewportTooltipAnchor,
} from './applyViewportTooltipAnchor.js';
import { portalViewportPanel } from './portalViewportPanel.js';
import type { ViewportTooltipOptions } from './viewportTooltipPosition.js';
import { VIEWPORT_TOOLTIP_HIDE_DELAY_MS } from './viewportTooltipConstants.js';
import {
  canCloseTooltipLayer,
  closeTooltipLayer,
  forceCloseTooltipLayer,
  openTooltipLayer,
  subscribeTooltipLayerChildClosed,
} from '../tooltip-stack/tooltipLayerStack.js';

export interface SharedViewportPanelBinding {
  triggers: HTMLElement[];
  panel: HTMLElement;
  hideDelayMs?: number;
  anchorOptions?: ViewportTooltipOptions;
  onActivate?: (trigger: HTMLElement) => void;
}

function prefersHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function containsTarget(trigger: HTMLElement, panel: HTMLElement, target: EventTarget | null): boolean {
  return target instanceof Node && (trigger.contains(target) || panel.contains(target));
}

/**
 * One shared panel anchored to many triggers — portals the panel to `document.body`
 * and uses the same viewport placement rules as `bindViewportTooltips`.
 */
export function bindSharedViewportPanel(binding: SharedViewportPanelBinding): () => void {
  const { triggers, panel, hideDelayMs = VIEWPORT_TOOLTIP_HIDE_DELAY_MS, anchorOptions, onActivate } = binding;
  if (!triggers.length) return () => {};

  const unportal = portalViewportPanel(panel);
  const canHover = prefersHover();
  let activeTrigger: HTMLElement | null = null;
  let activeLayerId: number | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelHide = () => {
    if (!hideTimer) return;
    clearTimeout(hideTimer);
    hideTimer = null;
  };

  const hide = () => {
    if (activeLayerId !== null && !canCloseTooltipLayer(activeLayerId)) return;

    cancelHide();
    panel.hidden = true;
    panel.classList.remove('is-open');
    clearViewportTooltipAnchor(panel);
    activeTrigger?.classList.remove('is-active');
    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger = null;

    if (activeLayerId !== null) {
      closeTooltipLayer(activeLayerId);
      activeLayerId = null;
    }
  };

  const scheduleHide = () => {
    if (activeLayerId !== null && !canCloseTooltipLayer(activeLayerId)) return;
    cancelHide();
    hideTimer = setTimeout(() => {
      hideTimer = null;
      hide();
    }, hideDelayMs);
  };

  const reposition = () => {
    if (!activeTrigger || panel.hidden) return;
    applyViewportTooltipAnchor(activeTrigger, panel, anchorOptions);
  };

  const show = (trigger: HTMLElement) => {
    cancelHide();
    if (activeTrigger && activeTrigger !== trigger) {
      activeTrigger.classList.remove('is-active');
      activeTrigger.setAttribute('aria-expanded', 'false');
    }
    activeTrigger = trigger;
    trigger.classList.add('is-active');
    trigger.setAttribute('aria-expanded', 'true');
    onActivate?.(trigger);
    panel.hidden = false;
    panel.classList.add('is-open');

    if (activeLayerId !== null) {
      closeTooltipLayer(activeLayerId);
    }
    activeLayerId = openTooltipLayer({
      kind: 'viewport-panel',
      anchor: trigger,
      surface: panel,
    });

    requestAnimationFrame(() => {
      applyViewportTooltipAnchor(trigger, panel, anchorOptions);
    });
  };

  const unsubscribeChildClosed = subscribeTooltipLayerChildClosed((parentId) => {
    if (activeLayerId !== parentId) return;
    if (panel.matches(':hover') || activeTrigger?.matches(':hover')) return;
    scheduleHide();
  });

  const cleanups: Array<() => void> = [];

  for (const trigger of triggers) {
    const onMouseEnter = () => {
      if (!canHover) return;
      show(trigger);
    };
    const onMouseLeave = () => {
      if (!canHover) return;
      scheduleHide();
    };
    const onFocus = () => show(trigger);
    const onBlur = (event: FocusEvent) => {
      if (containsTarget(trigger, panel, event.relatedTarget)) return;
      scheduleHide();
    };

    trigger.addEventListener('mouseenter', onMouseEnter);
    trigger.addEventListener('mouseleave', onMouseLeave);
    trigger.addEventListener('focusin', onFocus);
    trigger.addEventListener('focusout', onBlur);

    cleanups.push(() => {
      trigger.removeEventListener('mouseenter', onMouseEnter);
      trigger.removeEventListener('mouseleave', onMouseLeave);
      trigger.removeEventListener('focusin', onFocus);
      trigger.removeEventListener('focusout', onBlur);
    });
  }

  const onPanelEnter = () => cancelHide();
  const onPanelLeave = () => scheduleHide();
  panel.addEventListener('mouseenter', onPanelEnter);
  panel.addEventListener('mouseleave', onPanelLeave);
  cleanups.push(() => {
    panel.removeEventListener('mouseenter', onPanelEnter);
    panel.removeEventListener('mouseleave', onPanelLeave);
  });

  const onViewportChange = () => reposition();
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  cleanups.push(() => {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
  });

  return () => {
    cancelHide();
    cleanups.forEach((cleanup) => cleanup());
    unsubscribeChildClosed();
    if (activeLayerId !== null) forceCloseTooltipLayer(activeLayerId);
    activeLayerId = null;
    activeTrigger = null;
    panel.hidden = true;
    panel.classList.remove('is-open');
    clearViewportTooltipAnchor(panel);
    unportal();
  };
}
