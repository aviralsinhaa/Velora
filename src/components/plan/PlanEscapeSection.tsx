import { useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import gsap from 'gsap';

interface PlanEscapeSectionProps {
  onOpenConcierge: (prompt?: string) => void;
  onOpenBooking: () => void;
}

export function PlanEscapeSection({ onOpenConcierge, onOpenBooking }: PlanEscapeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgTextureRef = useRef<HTMLDivElement>(null);

  // Task 10 choreography refs
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);

  const cardShellRef = useRef<HTMLDivElement>(null);
  const userTurnRef = useRef<HTMLDivElement>(null);
  const conciergeTurnRef = useRef<HTMLDivElement>(null);
  const quickPromptsRef = useRef<HTMLDivElement>(null);

  // TASK 10: ONE single timeline on sectionRef
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

    // 1. Chapter marker & headline (0.00 to 0.18)
    if (chapterDotRef.current) {
      tl.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      tl.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      tl.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }
    if (headlineRef.current) {
      tl.fromTo(headlineRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.12);
    }

    // 2. Body copy & buttons (0.24 to 0.32)
    if (bodyRef.current) {
      tl.fromTo(bodyRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.22);
    }
    if (ctaRowRef.current) {
      tl.fromTo(ctaRowRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.28);
    }

    // 3. Concierge preview shell & inner dialogue (Desktop: single coordinated flow; Mobile: triggers on approach)
    if (cardShellRef.current) {
      if (isMobile) {
        const mCardTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardShellRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
        mCardTl.fromTo(
          cardShellRef.current,
          { opacity: 0, scale: 0.985, y: 12 },
          { opacity: 1, scale: 1.0, y: 0, duration: 0.75, ease: 'power2.out' },
          0
        );
        if (userTurnRef.current) {
          mCardTl.fromTo(userTurnRef.current, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.12);
        }
        if (conciergeTurnRef.current) {
          mCardTl.fromTo(conciergeTurnRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.2);
        }
        if (quickPromptsRef.current) {
          mCardTl.fromTo(quickPromptsRef.current.children, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out' }, 0.28);
        }
      } else {
        tl.fromTo(
          cardShellRef.current,
          { opacity: 0, scale: 0.985, y: 12 },
          { opacity: 1, scale: 1.0, y: 0, duration: 0.75, ease: 'power2.out' },
          0.20
        );
        if (userTurnRef.current) {
          tl.fromTo(
            userTurnRef.current,
            { opacity: 0, x: -8 },
            { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' },
            0.32
          );
        }
        if (conciergeTurnRef.current) {
          tl.fromTo(
            conciergeTurnRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            0.40
          );
        }
        if (quickPromptsRef.current) {
          tl.fromTo(
            quickPromptsRef.current.children,
            { opacity: 0, y: 4 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out' },
            0.48
          );
        }
      }
    }
  });

  return (
    <section
      id="plan"
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 lg:py-44 bg-[#03060d] text-[#ece6dc] overflow-hidden border-t border-white/10"
    >
      {/* Subtle Atmospheric Water Light Backdrop (Static, no scrub) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          ref={bgTextureRef}
          className="absolute inset-0 bg-cover bg-center filter saturate-50 scale-105"
          style={{
            backgroundImage: `url(${RESORT_MEDIA.textures.ambientLagoon})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060d] via-[#03060d]/80 to-[#03060d]" />
      </div>

      <div className="editorial-container relative z-10">
        <div className="editorial-grid-12 items-center">
          {/* Columns 1-5: Chapter Masthead & Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span ref={chapterLineRef} className="w-8 h-[1px] bg-[#c4a97d] origin-left" />
              <div className="flex items-center gap-2">
                <span ref={chapterDotRef} className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span ref={chapterTextRef} className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium">
                  CHAPTER 08 · PRIVATE CONCIERGE
                </span>
              </div>
            </div>

            <h2 ref={headlineRef} className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-[1.12] tracking-tight">
              What would you like the island to become?
            </h2>

            <p ref={bodyRef} className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light max-w-md">
              Describe how you wish to spend your days. Velora’s private concierge understands your rhythms, compares architectural sanctuaries, and designs custom stays in real time.
            </p>

            {/* Structured CTAs */}
            <div ref={ctaRowRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => onOpenConcierge()}
                data-cursor="CONCIERGE"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 shadow-[0_0_24px_rgba(223,202,163,0.25)] hover:scale-[1.01] active:scale-[0.99] text-center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>OPEN PRIVATE CONCIERGE ✦</span>
              </button>

              <button
                onClick={onOpenBooking}
                data-cursor="REQUEST"
                className="editorial-link py-2 sm:py-0 self-center sm:self-auto text-center"
              >
                <span>REQUEST YOUR STAY</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </button>
            </div>
          </div>

          {/* Columns 7-12: Product Preview of Private Concierge */}
          <div className="lg:col-start-7 lg:col-span-6 mt-8 lg:mt-0">
            <div
              ref={cardShellRef}
              className="relative rounded-2xl border border-white/10 bg-[#06101c]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
            >
              {/* Product Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs uppercase tracking-[0.26em] font-sans font-medium text-white flex items-center gap-1.5">
                    <span>VELORA</span>
                    <span className="text-[#dfcaa3]">✦</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans">
                    CONCIERGE PREVIEW
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#dfcaa3] tracking-widest uppercase">
                  ACTIVE CANVAS
                </span>
              </div>

              {/* Sample Intelligent Dialogue Transcript */}
              <div className="space-y-5 text-left">
                {/* User Turn */}
                <div ref={userTurnRef} className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-white/40 block">
                    YOU
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-[#f0e2c8] font-light pl-3 border-l border-[#dfcaa3]/50">
                    &ldquo;We have five nights in December. Somewhere private with sunset views.&rdquo;
                  </p>
                </div>

                {/* Velora Concierge Turn */}
                <div ref={conciergeTurnRef} className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-[#dfcaa3] block font-medium">
                    VELORA ✦
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                    For the two of you, I would begin with the Sunset Pool Villa. Its west-facing orientation gives you unobstructed golden hour views directly from your private 16-metre infinity pool.
                  </p>

                  {/* Villa Thumbnail Card */}
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#04080f]/80 flex flex-col sm:flex-row items-center gap-4 p-3">
                    <img
                      src={RESORT_MEDIA.villas.sunsetPoolVilla.hero}
                      alt="Sunset Pool Villa"
                      className="w-full sm:w-28 h-20 object-cover rounded-lg velora-image-grade shrink-0"
                      loading="lazy"
                    />
                    <div className="space-y-1 flex-1 text-left w-full sm:w-auto">
                      <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans block">
                        OVERWATER SANCTUARY
                      </span>
                      <p className="font-editorial text-base text-white font-normal">
                        Sunset Pool Villa
                      </p>
                      <p className="text-[11px] font-mono text-white/60">
                        280 m² · West-facing · $2,450 / night
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Prompts & Quick Launch */}
              <div ref={quickPromptsRef} className="pt-2 border-t border-white/10 space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onOpenConcierge('Recommend villas with sunset views and total privacy')}
                    className="text-[10px] font-sans text-white/70 hover:text-[#dfcaa3] border border-white/10 hover:border-[#dfcaa3]/40 px-2.5 py-1 rounded-full transition-colors"
                  >
                    ✦ Sunset views for two
                  </button>
                  <button
                    onClick={() => onOpenConcierge('Plan a private sandbank dinner itinerary')}
                    className="text-[10px] font-sans text-white/70 hover:text-[#dfcaa3] border border-white/10 hover:border-[#dfcaa3]/40 px-2.5 py-1 rounded-full transition-colors"
                  >
                    ✦ Sandbank dinner under stars
                  </button>
                </div>
                <button
                  onClick={() => onOpenConcierge('Plan five nights for two with sunset views in December.')}
                  className="w-full py-2.5 rounded-lg border border-[#c4a97d]/30 hover:border-[#dfcaa3] bg-[#c4a97d]/5 hover:bg-[#c4a97d]/15 text-[#dfcaa3] text-[10.5px] uppercase tracking-[0.22em] font-sans transition-all text-center block"
                >
                  START CONCIERGE SESSION →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
