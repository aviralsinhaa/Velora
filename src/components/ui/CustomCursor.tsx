import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device has fine pointer (mouse/trackpad)
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);
    document.body.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;

      // Disable custom styling over text entry elements
      if (targetEl.closest('input[type="text"], input[type="date"], input[type="email"], textarea')) {
        setCursorText('');
        setIsHovered(false);
        return;
      }

      // Check contextual target
      const cursorContainer = targetEl.closest('[data-cursor]');
      if (cursorContainer) {
        const text = cursorContainer.getAttribute('data-cursor') || '';
        setCursorText(text);
        setIsHovered(true);
      } else {
        const isInteractive = targetEl.closest('button, a, select, [role="button"], [tabindex="0"]');
        if (isInteractive) {
          setCursorText('');
          setIsHovered(true);
        } else {
          setCursorText('');
          setIsHovered(false);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [isVisible]);

  // Smooth lerp animation for the outer follower ring
  useEffect(() => {
    if (isTouch) return;
    const animate = () => {
      setPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.24,
        y: prev.y + (targetPos.y - prev.y) * 0.24,
      }));
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [targetPos, isTouch]);

  if (isTouch || !isVisible) return null;

  return (
    <aside aria-hidden="true" className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {/* Outer contextual follower ring */}
      <div
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out flex items-center justify-center ${
          cursorText
            ? 'w-16 h-16 bg-[#06101c]/90 border border-[#dfcaa3]/70 backdrop-blur-md text-[#f8f5ee] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
            : isHovered
            ? 'w-10 h-10 bg-transparent border border-[#dfcaa3]/70'
            : isClicking
            ? 'w-5 h-5 bg-transparent border border-[#dfcaa3]'
            : 'w-7 h-7 bg-transparent border border-white/25'
        }`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
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
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#dfcaa3] rounded-full transition-opacity duration-150"
          style={{
            transform: `translate3d(${targetPos.x}px, ${targetPos.y}px, 0) translate(-50%, -50%)`,
            opacity: isHovered ? 0.3 : 0.9,
          }}
        />
      )}
    </aside>
  );
}
