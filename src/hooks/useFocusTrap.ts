import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside a modal while it is open: focus moves into the
 * modal on open, Tab / Shift+Tab wrap around its focusable elements, and focus
 * goes back to the element that opened it on close.
 */
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!container.contains(document.activeElement)) {
      if (!container.hasAttribute("tabindex")) container.tabIndex = -1;
      container.style.outline = "none";
      container.focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // A nested modal (e.g. the full-screen viewer opened from a gallery) has its own trap.
      const inner = document.activeElement?.closest('[aria-modal="true"]');
      if (inner && inner !== container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      } else if (!container.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, containerRef]);
}
