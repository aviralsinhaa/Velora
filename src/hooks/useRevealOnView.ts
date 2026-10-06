import { useEffect, RefObject } from 'react';

/**
 * Ultra-lightweight native reveal system (Zero React state churn, zero scroll cost).
 * Uses native IntersectionObserver to reveal elements once on viewport entry.
 * Adds `is-visible` and immediately unobserves the element.
 */
export function useRevealOnView(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string = '.luxury-reveal, .luxury-reveal-img'
) {
  useEffect(() => {
    const root = scopeRef.current;
    if (typeof window === 'undefined' || !root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = root.querySelectorAll(selector);

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [scopeRef, selector]);
}
