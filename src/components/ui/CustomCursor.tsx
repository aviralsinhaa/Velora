import { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  const followerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const targetXRef = useRef<number>(-100);
  const targetYRef = useRef<number>(-100);
  const currentXRef = useRef<number>(-100);
  const currentYRef = useRef<number>(-100);
  const rafRef = useRef<number | null>(null);

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

    // 1. One persistent RAF loop writing directly to DOM transforms (zero React re-renders)
    const updateCursorPosition = () => {
      const tx = targetXRef.current;
      const ty = targetYRef.current;
      currentXRef.current += (tx - currentXRef.current) * 0.24;
      currentYRef.current += (ty - currentYRef.current) * 0.24;

      const cx = currentXRef.current;
      const cy = currentYRef.current;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(updateCursorPosition);
    };

    rafRef.current = requestAnimationFrame(updateCursorPosition);

    // 2. High-performance pointer move: updates coordinate refs with zero setState for x/y
    const handlePointerMove = (e: PointerEvent) => {
      targetXRef.current = e.clientX;
      targetYRef.current = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
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
    const handlePointerEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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
        style={{
          transform: `translate3d(${currentXRef.current}px, ${currentYRef.current}px, 0) translate(-50%, -50%)`,
        }}
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
            transform: `translate3d(${targetXRef.current}px, ${targetYRef.current}px, 0) translate(-50%, -50%)`,
            opacity: isHovered ? 0.3 : 0.9,
          }}
        />
      )}
    </aside>
  );
}
