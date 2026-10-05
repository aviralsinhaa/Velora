import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contentEditable=true]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  autoFocusFirst?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  options?: UseFocusTrapOptions
) {
  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    if (!container) return;

    // Optional initial focus
    const focusTarget = () => {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;
      if (options?.initialFocusRef?.current) {
        options.initialFocusRef.current.focus();
      } else if (options?.autoFocusFirst) {
        // Do not steal focus if an element inside this modal already received focus
        if (
          !document.activeElement ||
          !currentContainer.contains(document.activeElement) ||
          document.activeElement === document.body
        ) {
          const focusable = getFocusableElements(currentContainer);
          if (focusable.length > 0) {
            focusable[0].focus();
          }
        }
      }
    };

    focusTarget();
    const rafId = requestAnimationFrame(focusTarget);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const focusableElements = getFocusableElements(currentContainer);
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // If shift + tab
      if (e.shiftKey) {
        if (activeElement === firstElement || !currentContainer.contains(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Regular tab
        if (activeElement === lastElement || !currentContainer.contains(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef, options?.autoFocusFirst, options?.initialFocusRef]);
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  return elements.filter((el) => {
    // Ensure element is not hidden or detached
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    // Check if element has dimension or is valid interactive
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
  });
}
