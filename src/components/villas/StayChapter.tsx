import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { Villa } from '../../types';
import { oceanAudio } from '../../utils/audio';
import { ArrowLeft, ArrowRight, Compass, X } from 'lucide-react';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import gsap from 'gsap';

interface StayChapterProps {
  onReserveVilla: (villaId: string) => void;
  onOpen360Scene: (sceneId: string) => void;
  onOpenConcierge?: (prompt?: string, villaId?: string) => void;
  onOpenVillaDetail?: (villaId: string) => void;
  onOpenCompareVillas?: () => void;
}

export function StayChapter({
  onReserveVilla,
  onOpen360Scene,
  onOpenConcierge,
  onOpenVillaDetail,
  onOpenCompareVillas,
}: StayChapterProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outgoingVilla, setOutgoingVilla] = useState<Villa | null>(null);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const touchStartX = useRef<number | null>(null);
  const prevIndexRef = useRef<number>(0);
  const isFirstMountRef = useRef<boolean>(true);
  const transitionIdRef = useRef<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const activeImgRef = useRef<HTMLImageElement>(null);
  const outgoingImgRef = useRef<HTMLImageElement>(null);
  const infoColRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const navTabsRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);

  const villas = veloraResort.villas;
  const currentVilla = villas[currentIndex];

  // 1. Initial Section Entrance: ONE timeline, ONE section trigger (Task 5)
  useScrollMotion(sectionRef, (_ctx, isReducedMotion) => {
    if (isReducedMotion || !sectionRef.current) return;

    const isMobile = window.innerWidth < 768;
    const yMove = isMobile ? 8 : 14;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Chapter marker
    if (chapterDotRef.current) {
      tl.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      tl.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      tl.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }

    // Headline
    if (headlineRef.current) {
      tl.fromTo(headlineRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    }

    // Image frame: opacity 0 -> 1, inner image scale 1.025 -> 1 (zero clip-path!)
    if (imageFrameRef.current) {
      tl.fromTo(imageFrameRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.18);
    }
    if (activeImgRef.current) {
      tl.fromTo(activeImgRef.current, { scale: 1.02 }, { scale: 1.0, duration: 0.9, ease: 'power3.out' }, 0.18);
    }

    // Villa subtitle & title
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.28);
    }
    if (titleRef.current) {
      tl.fromTo(titleRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.32);
    }

    // Body description
    if (descRef.current) {
      tl.fromTo(descRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.38);
    }

    // Metadata & specs
    if (specsRef.current) {
      tl.fromTo(
        specsRef.current.children,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' },
        0.44
      );
    }

    // Navigation tabs & CTA
    if (navTabsRef.current) {
      tl.fromTo(navTabsRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.48);
    }
    if (ctaContainerRef.current) {
      tl.fromTo(ctaContainerRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.52);
    }
  });

  // 2. Cinematic Villa Change: Trigger state for outgoing and incoming layers synchronously
  if (prevIndexRef.current !== currentIndex) {
    setOutgoingVilla(villas[prevIndexRef.current]);
    prevIndexRef.current = currentIndex;
  }

  // Execute GSAP Crossfade once outgoing layer is genuinely mounted in DOM
  useLayoutEffect(() => {
    if (!outgoingVilla) return;

    const currentId = ++transitionIdRef.current;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      setOutgoingVilla(null);
      return;
    }

    const outEl = outgoingImgRef.current;
    const activeEl = activeImgRef.current;

    if (outEl && activeEl) {
      gsap.killTweensOf([outEl, activeEl]);

      // Explicit initial states: outgoing at 1, incoming at 0 & slightly scaled
      gsap.set(outEl, { opacity: 1, scale: 1.0, transformOrigin: 'center center' });
      gsap.set(activeEl, { opacity: 0, scale: 1.02, transformOrigin: 'center center' });

      // Outgoing: opacity 1 -> 0, scale 1 -> 1.01 over 680ms with power2.inOut
      gsap.to(outEl, {
        opacity: 0,
        scale: 1.01,
        duration: 0.68,
        ease: 'power2.inOut',
        onComplete: () => {
          if (transitionIdRef.current === currentId) {
            setOutgoingVilla(null);
          }
        },
      });

      // Incoming: opacity 0 -> 1, scale 1.02 -> 1 over 700ms with power2.out
      gsap.to(activeEl, {
        opacity: 1,
        scale: 1.0,
        duration: 0.7,
        ease: 'power2.out',
      });
    } else {
      setOutgoingVilla(null);
    }

    return () => {
      if (outEl) gsap.killTweensOf(outEl);
      if (activeEl) gsap.killTweensOf(activeEl);
    };
  }, [outgoingVilla, currentIndex]);

  // Choreographed Editorial Typography Transition on Villa Switch
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    if (descRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, delay: 0.05, ease: 'power2.out' }
      );
    }
    if (specsRef.current) {
      gsap.fromTo(
        specsRef.current.children,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.45, delay: 0.08, ease: 'power2.out' }
      );
    }
  }, [currentIndex]);

  const nextVilla = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % villas.length);
  }, [villas.length]);

  const prevVilla = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + villas.length) % villas.length);
  }, [villas.length]);

  // Touch Swipe Support: Scoped strictly to villa image frame (Task 2)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextVilla();
    else if (diff < -50) prevVilla();
    touchStartX.current = null;
  };

  // Keyboard navigation: Scoped to villa carousel container, NOT global window (Task 2)
  const handleVillaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextVilla();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevVilla();
    }
  };

  // Only listen to Escape on window when selectedVilla modal is active
  useEffect(() => {
    if (!selectedVilla) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVilla(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVilla]);

  return (
    <section
      id="stay"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="border-b border-white/10 pb-5 mb-10 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span ref={chapterDotRef} className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span ref={chapterTextRef} className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
                  CHAPTER 03 · STAY
                </span>
              </div>
              <h2 ref={headlineRef} className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                Architectural Sanctuaries
              </h2>
            </div>

            {/* Villa Selector Index & Navigation */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
              {onOpenCompareVillas && (
                <button
                  onClick={onOpenCompareVillas}
                  data-cursor="COMPARE"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#dfcaa3] text-[#dfcaa3] hover:text-white text-[11px] uppercase tracking-[0.18em] font-sans transition-colors"
                >
                  <span>Compare Villas →</span>
                </button>
              )}
              <span className="font-mono text-xs text-white/50 tracking-widest">
                0{currentIndex + 1} / 0{villas.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevVilla}
                  data-cursor="PREV"
                  className="w-9 h-9 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                  aria-label="Previous villa"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextVilla}
                  data-cursor="NEXT"
                  className="w-9 h-9 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                  aria-label="Next villa"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div ref={chapterLineRef} className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* 12-Column Architectural Spread: 7 Cols Photography | 5 Cols Villa Information */}
        <div className="editorial-grid-12 items-center">
          {/* Columns 1-7: Dominant Villa Photography Canvas */}
          <div className="lg:col-span-7">
            <div
              ref={imageFrameRef}
              tabIndex={0}
              role="region"
              aria-label="Sanctuary Villa Visual Stage (Use Arrow keys to switch)"
              onKeyDown={handleVillaKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/10] shadow-xl group select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#dfcaa3]/60"
            >
              {/* Outgoing Villa Image Layer (Task 1: Overlaps and fades out with scale 1 -> 1.01) */}
              {outgoingVilla && (
                <ResponsiveImage
                  ref={outgoingImgRef}
                  key={`out-${outgoingVilla.id}`}
                  src={outgoingVilla.featuredImage}
                  alt={outgoingVilla.name}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-10"
                />
              )}

              {/* Active Current Villa Image Layer (Task 1: Scales 1.02 -> 1, Fades 0 -> 1) */}
              <ResponsiveImage
                ref={activeImgRef}
                key={`act-${currentVilla.id}`}
                src={currentVilla.featuredImage}
                alt={currentVilla.name}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

              {/* Quick Image Pill Indicator */}
              <div className="absolute bottom-5 left-5 text-white/80 font-mono text-[11px] tracking-wider pointer-events-none">
                <span>{currentVilla.orientation.toUpperCase()}</span>
              </div>

              {currentVilla.panoramaSceneId && (
                <button
                  onClick={() => onOpen360Scene(currentVilla.panoramaSceneId!)}
                  data-cursor="360°"
                  className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-sans backdrop-blur-md transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#dfcaa3]" />
                  <span>360° VIEW</span>
                </button>
              )}
            </div>

            {/* Quick Villa Tab Strip with Sliding Underline (Task 5) */}
            <div ref={navTabsRef} className="relative mt-3 pt-1 border-b border-white/10">
              <div className="grid grid-cols-4 gap-2.5">
                {villas.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`py-2 px-1 text-left transition-colors duration-300 ${
                      idx === currentIndex ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <span className="font-mono text-[10px] block">0{idx + 1}</span>
                    <span className="text-[10px] font-sans uppercase tracking-wider truncate block">
                      {v.name.replace(' Villa', '').replace(' Residence', '')}
                    </span>
                  </button>
                ))}
              </div>
              {/* Sliding Underline Indicator */}
              <div
                className="absolute bottom-0 h-[2px] bg-[#dfcaa3] transition-[left,width] duration-300 ease-out"
                style={{
                  left: `${currentIndex * 25}%`,
                  width: '25%',
                }}
              />
            </div>
          </div>

          {/* Columns 8-12 (lg:col-span-5): Clean Architectural Hierarchy */}
          <div ref={infoColRef} className="lg:col-span-5 space-y-6 lg:pl-6 text-left">
            <div className="space-y-2 villa-meta-item">
              <div className="flex items-center gap-2.5">
                <span
                  ref={subtitleRef}
                  className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium"
                >
                  {currentVilla.subtitle}
                </span>
                <span className="text-white/20">·</span>
                <span className="font-mono text-[11px] text-white/50">{currentVilla.orientation}</span>
              </div>

              <h3
                ref={titleRef}
                className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-tight leading-tight"
              >
                {currentVilla.name}
              </h3>
            </div>

            <p
              ref={descRef}
              className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light villa-meta-item"
            >
              {currentVilla.description}
            </p>

            {/* Architectural Specifications Grid */}
            <div
              ref={specsRef}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-white/10 text-left villa-meta-item"
            >
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/55 font-sans block">SIZE</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.size}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/55 font-sans block">GUESTS</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.guests}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/55 font-sans block">BEDROOMS</span>
                <span className="font-editorial text-lg text-white mt-0.5 block">{currentVilla.bedrooms}</span>
              </div>
              <div ref={priceRef}>
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/55 font-sans block">FROM</span>
                <span className="font-mono text-sm text-[#dfcaa3] mt-1 block">
                  ${currentVilla.pricePerNight.toLocaleString()}<span className="text-[10px] text-white/50">/nt</span>
                </span>
              </div>
            </div>

            {/* Highlights List */}
            <div className="space-y-2 villa-meta-item">
              <span className="text-[9px] uppercase tracking-[0.24em] text-white/55 font-sans block">
                SANCTUARY HIGHLIGHTS
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-white/70 font-light">
                {currentVilla.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#dfcaa3] mt-0.5">✦</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions (Task 13 refined button hover scale max 1.015) */}
            <div ref={ctaContainerRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 villa-meta-item">
              <button
                onClick={() => onReserveVilla(currentVilla.id)}
                data-cursor="RESERVE"
                className="px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-[background-color,color,transform,box-shadow] duration-300 shadow-[0_0_24px_rgba(223,202,163,0.2)] hover:scale-[1.015] active:scale-95 text-center"
              >
                REQUEST THIS VILLA
              </button>

              {onOpenConcierge && (
                <button
                  onClick={() =>
                    onOpenConcierge(
                      `Tell me about the ${currentVilla.name} and its privacy.`,
                      currentVilla.id
                    )
                  }
                  data-cursor="CONCIERGE"
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-[#dfcaa3] bg-white/[0.03] hover:bg-[#dfcaa3]/10 text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-[border-color,background-color,color] duration-300 text-center"
                >
                  CONCIERGE ✦
                </button>
              )}

              <button
                onClick={() => {
                  if (onOpenVillaDetail) {
                    onOpenVillaDetail(currentVilla.id);
                  } else {
                    setSelectedVilla(currentVilla);
                  }
                }}
                data-cursor="SPECS"
                className="editorial-link py-2 sm:py-0 self-center sm:self-auto text-center"
              >
                <span>ARCHITECTURAL DOSSIER →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VILLA DETAIL MODAL */}
      {selectedVilla && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#06101c] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVilla(null)}
              className="absolute top-5 right-5 p-2 rounded-full border border-white/10 text-white/60 hover:text-white"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans block">
                ARCHITECTURAL SPECIFICATION
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                {selectedVilla.name}
              </h3>
            </div>

            <div className="aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
              <ResponsiveImage
                src={selectedVilla.featuredImage}
                alt={selectedVilla.name}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 672px"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              {selectedVilla.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-sans">
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">LIVING AREA</span>
                <span className="text-white font-medium">{selectedVilla.size}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">MAX GUESTS</span>
                <span className="text-white font-medium">{selectedVilla.guests}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">ORIENTATION</span>
                <span className="text-white font-medium">{selectedVilla.orientation}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">NIGHTLY RATE</span>
                <span className="text-[#dfcaa3] font-medium">${selectedVilla.pricePerNight.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans block">
                INCLUDED AMENITIES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-white/70">
                {selectedVilla.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#dfcaa3]">✓</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-3">
              {onOpenVillaDetail && (
                <button
                  onClick={() => {
                    const id = selectedVilla.id;
                    setSelectedVilla(null);
                    onOpenVillaDetail(id);
                  }}
                  className="px-4 py-3 rounded-full border border-white/20 hover:border-[#dfcaa3] text-[#dfcaa3] hover:text-white font-sans text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                >
                  FULL DOSSIER →
                </button>
              )}

              {onOpenConcierge && (
                <button
                  onClick={() => {
                    const v = selectedVilla;
                    setSelectedVilla(null);
                    onOpenConcierge(`Tell me more about the ${v.name}.`, v.id);
                  }}
                  className="px-5 py-3 rounded-full border border-white/20 hover:border-[#dfcaa3] text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                >
                  CONCIERGE ✦
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedVilla(null);
                  onReserveVilla(selectedVilla.id);
                }}
                className="px-6 py-3 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-[background-color,color,transform,box-shadow] duration-300 shadow-[0_0_20px_rgba(223,202,163,0.2)] hover:scale-[1.01] active:scale-[0.99]"
              >
                REQUEST THIS VILLA
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
