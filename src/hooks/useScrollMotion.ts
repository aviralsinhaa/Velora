import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger once globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollMotionOptions {
  scopeRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
}

/**
 * Reusable Luxury Editorial Motion Hook
 * Built on gsap.context() and gsap.matchMedia() with strict cleanup (ctx.revert()).
 * Enforces restrained, 60fps cinematic principles:
 * - small travel distance
 * - slow deliberate curves (power2.out, power3.out)
 * - hardware-accelerated transforms and clip-paths
 * - immediate fallback if prefers-reduced-motion is active
 */
export function useScrollMotion(
  scopeRef: RefObject<HTMLElement | null>,
  animationSetup: (ctx: gsap.Context, isReducedMotion: boolean) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = mediaQuery.matches;

    // Use gsap.context to ensure all created tweens and ScrollTriggers are scoped and cleanly reverted
    const ctx = gsap.context((context) => {
      animationSetup(context, isReducedMotion);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef, ...deps]);
}

/**
 * Precision Master Easing Constants
 * Strictly adheres to 4-tier luxury motion hierarchy
 */
export const MOTION_EASE = {
  primaryEditorial: 'power3.out',
  editorialBezier: 'cubic-bezier(0.22, 1, 0.36, 1)',
  interface: 'power2.out',
  crossfade: 'power2.inOut',
};

/**
 * Standard relative timeline rhythm offsets (Task 1)
 */
export const CHOREOGRAPHY_OFFSETS = {
  chapterLabel: 0.0,
  hairline: 0.06,
  headlineLine1: 0.10,
  headlineLine2: 0.17,
  bodyCopy: 0.28,
  imageBegins: 0.34,
  metadata: 0.44,
  cta: 0.52,
};

/**
 * Common luxury editorial motion helpers
 */
export const luxuryMotion = {
  ease: {
    cinematic: 'power3.out',
    deliberate: 'power2.out',
    silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
    crossfade: 'power2.inOut',
  },

  // Create ONE viewport-entry timeline per section (strictly enforces one ScrollTrigger)
  createSectionTimeline: (
    trigger: gsap.DOMTarget,
    options: {
      start?: string;
      onComplete?: () => void;
    } = {}
  ) => {
    return gsap.timeline({
      scrollTrigger: {
        trigger,
        start: options.start || 'top 82%',
        toggleActions: 'play none none none',
      },
      onComplete: options.onComplete,
    });
  },

  // Masked element entrance (zero clip-path, pure GPU transform)
  revealText: (
    elements: gsap.DOMTarget,
    trigger: gsap.DOMTarget,
    options: { delay?: number; stagger?: number; y?: number } = {}
  ) => {
    return gsap.from(elements, {
      scrollTrigger: {
        trigger,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: options.y ?? 18,
      opacity: 0,
      duration: 0.85,
      stagger: options.stagger ?? 0.08,
      ease: 'power3.out',
      delay: options.delay ?? 0,
    });
  },
};
