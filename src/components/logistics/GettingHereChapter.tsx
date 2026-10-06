import { useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { Plane, ArrowRight } from 'lucide-react';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import gsap from 'gsap';

interface GettingHereChapterProps {
  onOpenGettingHereDetails: () => void;
}

export function GettingHereChapter({ onOpenGettingHereDetails }: GettingHereChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLDivElement>(null);

  const headingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const routeStartRef = useRef<HTMLSpanElement>(null);
  const routeLine1Ref = useRef<HTMLSpanElement>(null);
  const routeMidRef = useRef<HTMLSpanElement>(null);
  const routeLine2Ref = useRef<HTMLSpanElement>(null);
  const routeEndRef = useRef<HTMLSpanElement>(null);

  const ctaRef = useRef<HTMLDivElement>(null);
  const seaplaneFrameRef = useRef<HTMLDivElement>(null);
  const seaplaneImageRef = useRef<HTMLImageElement>(null);

  // TASK 7 & 9: Breakpoint-aware entry groups (desktop side-by-side, mobile sequenced)
  useScrollMotion(sectionRef, (_ctx, isReducedMotion) => {
    if (isReducedMotion || !sectionRef.current) return;

    const isMobile = window.innerWidth < 768;
    const yMove = isMobile ? 8 : 12;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    // 1. Chapter marker signature
    if (chapterDotRef.current) {
      tl.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      tl.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      tl.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }

    // 2. Heading & body
    if (headingRef.current) {
      tl.fromTo(headingRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.1);
    }
    if (bodyRef.current) {
      tl.fromTo(bodyRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
    }

    // 3. Route line extension choreography (MALÉ -> line extends -> 45 MIN -> line extends -> VELORA)
    if (routeStartRef.current) {
      tl.fromTo(routeStartRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.26);
    }
    if (routeLine1Ref.current) {
      tl.fromTo(routeLine1Ref.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.5, ease: 'power3.out' }, 0.3);
    }
    if (routeMidRef.current) {
      tl.fromTo(routeMidRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.36);
    }
    if (routeLine2Ref.current) {
      tl.fromTo(routeLine2Ref.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.5, ease: 'power3.out' }, 0.42);
    }
    if (routeEndRef.current) {
      tl.fromTo(routeEndRef.current, { opacity: 0, x: 6 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.48);
    }

    // 4. CTA
    if (ctaRef.current) {
      tl.fromTo(ctaRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.52);
    }

    // 5. Seaplane image composition reveal (on mobile, trigger when approaching viewport)
    if (seaplaneFrameRef.current) {
      if (isMobile) {
        const mImgTl = gsap.timeline({
          scrollTrigger: {
            trigger: seaplaneFrameRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
        mImgTl.fromTo(seaplaneFrameRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0);
        if (seaplaneImageRef.current) {
          mImgTl.fromTo(seaplaneImageRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, 0);
        }
      } else {
        tl.fromTo(seaplaneFrameRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.32);
        if (seaplaneImageRef.current) {
          tl.fromTo(seaplaneImageRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, 0.32);
        }
      }
    }
  });

  return (
    <section
      id="getting-here"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-36 bg-[#04080f] text-[#ece6dc] border-t border-white/10 overflow-hidden"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span ref={chapterDotRef} className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span ref={chapterTextRef} className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
                  CHAPTER 07 · GETTING HERE
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                Arrival Trajectory
              </h2>
            </div>
            <div className="font-mono text-xs text-white/45 tracking-[0.2em]">
              45 MIN SEAPLANE TRANSIT
            </div>
          </div>
          <div ref={chapterLineRef} className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* 12-Column Spread: 5 Cols Copy | 7 Cols Aerial Seaplane Photography */}
        <div className="editorial-grid-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <div ref={headingRef} className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                NOONU ATOLL LOGISTICS
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-white font-light leading-tight">
                Forty-Five Minutes Above the Coral Rings
              </h3>
            </div>

            <p ref={bodyRef} className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light">
              From Velana International Airport in Malé, a scenic seaplane journey glides over vibrant turquoise ring-reefs before docking smoothly at the Velora outer lagoon pontoon.
            </p>

            {/* Travel Path Pill Indicator (Task 9 scaleX lines choreography) */}
            <div className="flex items-center gap-3 py-3 border-y border-white/10 font-mono text-xs text-white/90">
              <span ref={routeStartRef}>MALÉ (MLE)</span>
              <span ref={routeLine1Ref} className="w-6 h-[1px] bg-[#dfcaa3] origin-left" />
              <span ref={routeMidRef} className="text-[#dfcaa3] flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px]">
                <Plane className="w-3.5 h-3.5" />
                <span>45 MIN FLIGHT</span>
              </span>
              <span ref={routeLine2Ref} className="w-6 h-[1px] bg-[#dfcaa3] origin-left" />
              <span ref={routeEndRef}>VELORA</span>
            </div>

            <p className="font-sans text-xs text-white/60 font-light">
              Arrival timing in Malé is seamlessly tailored around your scheduled seaplane departure.
            </p>

            <div ref={ctaRef} className="pt-2">
              <button
                onClick={onOpenGettingHereDetails}
                data-cursor="TRANSIT"
                className="editorial-link"
              >
                <span>Explore Travel Logistics & Transfer Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              ref={seaplaneFrameRef}
              role="button"
              tabIndex={0}
              onClick={onOpenGettingHereDetails}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenGettingHereDetails();
                }
              }}
              aria-label="View travel logistics and seaplane transfer details"
              className="block w-full rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/9] shadow-xl cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3]"
            >
              <ResponsiveImage
                ref={seaplaneImageRef}
                src={RESORT_MEDIA.arrival.seaplaneLagoon}
                alt="Seaplane transfer across the atoll"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-[1.018] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
