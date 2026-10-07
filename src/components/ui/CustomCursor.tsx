import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  const followerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Cached state references to avoid duplicate low-frequency React state updates
  const lastTextRef = useRef<string>('');
  const lastHoveredRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if device has fine pointer (mouse/trackpad)
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);
    document.body.classList.add('has-custom-cursor');

    // Setup GSAP quick setters/interpolators (ZERO permanent RAF work when idle)
    let xFollower: ((value: number) => void) | null = null;
    let yFollower: ((value: number) => void) | null = null;
    let xDot: ((value: number) => void) | null = null;
    let yDot: ((value: number) => void) | null = null;

    if (followerRef.current) {
      gsap.set(followerRef.current, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      xFollower = gsap.quickTo(followerRef.current, 'x', { duration: 0.28, ease: 'power2.out' });
      yFollower = gsap.quickTo(followerRef.current, 'y', { duration: 0.28, ease: 'power2.out' });
    }

    if (dotRef.current) {
      gsap.set(dotRef.current, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      xDot = gsap.quickSetter(dotRef.current, 'x', 'px') as (value: number) => void;
      yDot = gsap.quickSetter(dotRef.current, 'y', 'px') as (value: number) => void;
    }

    // High-performance pointer move: updates coordinate positions directly via GSAP
    const handlePointerMove = (e: PointerEvent) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
        if (followerRef.current) {
          gsap.set(followerRef.current, { x: e.clientX, y: e.clientY });
        }
        if (dotRef.current) {
          gsap.set(dotRef.current, { x: e.clientX, y: e.clientY });
        }
      }

      if (xFollower && yFollower) {
        xFollower(e.clientX);
        yFollower(e.clientY);
      }
      if (xDot && yDot) {
        xDot(e.clientX);
        yDot(e.clientY);
      }

      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;

      // Disable custom styling over text entry elements
      if (targetEl.closest('input[type="text"], input[type="date"], input[type="email"], textarea')) {
        if (lastTextRef.current !== '') {
          lastTextRef.current = '';
          setCursorText('');
        }
        if (lastHoveredRef.current !== false) {
          lastHoveredRef.current = false;
          setIsHovered(false);
        }
        return;
      }

      // Check contextual target
      const cursorContainer = targetEl.closest('[data-cursor]');
      if (cursorContainer) {
        const text = cursorContainer.getAttribute('data-cursor') || '';
        if (lastTextRef.current !== text) {
          lastTextRef.current = text;
          setCursorText(text);
        }
        if (!lastHoveredRef.current) {
          lastHoveredRef.current = true;
          setIsHovered(true);
        }
      } else {
        const isInteractive = Boolean(
          targetEl.closest('button, a, select, [role="button"], [tabindex="0"]')
        );
        if (lastTextRef.current !== '') {
          lastTextRef.current = '';
          setCursorText('');
        }
        if (lastHoveredRef.current !== isInteractive) {
          lastHoveredRef.current = isInteractive;
          setIsHovered(isInteractive);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handlePointerLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const handlePointerEnter = (e: PointerEvent) => {
      isVisibleRef.current = true;
      setIsVisible(true);
      if (followerRef.current) {
        gsap.set(followerRef.current, { x: e.clientX, y: e.clientY });
      }
      if (dotRef.current) {
        gsap.set(dotRef.current, { x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('pointerenter', handlePointerEnter);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  if (isTouch || !isVisible) return null;

  return (
    <aside aria-hidden="true" className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* Outer contextual follower ring */}
      <div
        ref={followerRef}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out flex items-center justify-center will-change-transform ${
          cursorText
            ? 'w-16 h-16 bg-[#06101c]/90 border border-[#dfcaa3]/70 backdrop-blur-md text-[#f8f5ee] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
            : isHovered
            ? 'w-10 h-10 bg-transparent border border-[#dfcaa3]/70'
            : isClicking
            ? 'w-5 h-5 bg-transparent border border-[#dfcaa3]'
            : 'w-7 h-7 bg-transparent border border-white/25'
        }`}
      >
        {cursorText && (
          <span className="text-[8.5px] font-sans tracking-[0.2em] uppercase font-semibold text-[#dfcaa3] select-none text-center px-1">
            {cursorText}
          </span>
        )}
      </div>

      {/* Center point dot */}
      {!cursorText && (
        <div
          ref={dotRef}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#dfcaa3] rounded-full transition-opacity duration-150 will-change-transform"
          style={{
            opacity: isHovered ? 0.3 : 0.9,
          }}
        />
      )}
    </aside>
  );
}
