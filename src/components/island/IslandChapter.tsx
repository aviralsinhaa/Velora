import { useRef } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { Compass, ArrowRight } from 'lucide-react';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import gsap from 'gsap';

interface IslandChapterProps {
  onOpen360Scene: (sceneId: string) => void;
  onNavigateToStay: () => void;
}

export function IslandChapter({ onOpen360Scene, onNavigateToStay }: IslandChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLDivElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const introQuoteRef = useRef<HTMLParagraphElement>(null);
  const introCopyRef = useRef<HTMLParagraphElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef = useRef<HTMLDivElement>(null);
  const aerialContainerRef = useRef<HTMLDivElement>(null);
  const aerialImageRef = useRef<HTMLImageElement>(null);
  const destinationsRowRef = useRef<HTMLDivElement>(null);

  const destinations = [
    {
      id: 'stay',
      tag: '01 / RESIDENCE',
      title: 'Overwater & Beach Pavilions',
      desc: '24 secluded architectural sanctuaries suspended over the turquoise lagoon and sheltered by mature palms.',
      actionLabel: 'EXPLORE VILLAS',
      onClick: onNavigateToStay,
      is360: false,
    },
    {
      id: 'reef',
      tag: '02 / HOUSE REEF',
      title: 'Living Reef Ecosystem',
      desc: 'A vibrant coral drop-off where reef fish and tropical marine life may be encountered with the ocean tides.',
      actionLabel: 'VIEW 360° REEF',
      onClick: () => onOpen360Scene('ocean-villa'),
      is360: true,
    },
    {
      id: 'wellness',
      tag: '03 / RESTORATION',
      title: 'Ayurvedic Water Pavilion',
      desc: 'Acoustic crystal meditation and open-air yoga suspended above gentle lagoon currents.',
      actionLabel: 'VIEW 360° PAVILION',
      onClick: () => onOpen360Scene('sunset-villa'),
      is360: true,
    },
  ];

  // TASK 7: TWO logical one-time groups (Group A: Header/Aerial, Group B: Lower Destinations)
  useScrollMotion(sectionRef, (_ctx, isReducedMotion) => {
    if (isReducedMotion || !sectionRef.current) return;

    const isMobile = window.innerWidth < 768;
    const yMove = isMobile ? 8 : 12;

    // GROUP A: Header, Headline, Intro Copy, Aerial, Stats
    const tlA = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // 1. Chapter label signature
    if (chapterDotRef.current) {
      tlA.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      tlA.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      tlA.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }

    // 2. Masked headline lines rise without clip-path
    if (headlineLine1Ref.current) {
      tlA.fromTo(headlineLine1Ref.current, { yPercent: 105 }, { yPercent: 0, duration: 0.85, ease: 'power3.out' }, 0.1);
    }
    if (headlineLine2Ref.current) {
      tlA.fromTo(headlineLine2Ref.current, { yPercent: 105 }, { yPercent: 0, duration: 0.85, ease: 'power3.out' }, 0.17);
    }

    // 3. Intro copy & quote
    if (introQuoteRef.current) {
      tlA.fromTo(introQuoteRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.25);
    }
    if (introCopyRef.current) {
      tlA.fromTo(introCopyRef.current, { opacity: 0, y: yMove }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3);
    }

    // 4. Large aerial image (frame opacity, inner image scale 1.035 -> 1)
    if (aerialContainerRef.current) {
      tlA.fromTo(aerialContainerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: 'power2.out' }, 0.34);
    }
    if (aerialImageRef.current) {
      tlA.fromTo(aerialImageRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.9, ease: 'power3.out' }, 0.34);
    }

    // 5. Stats appear sequentially
    if (statsContainerRef.current) {
      tlA.fromTo(
        statsContainerRef.current.children,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' },
        0.44
      );
    }

    // GROUP B: Lower destination columns (triggers only when actually approaching viewport)
    if (destinationsRowRef.current) {
      const tlB = gsap.timeline({
        scrollTrigger: {
          trigger: destinationsRowRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      if (ctaBtnRef.current) {
        tlB.fromTo(ctaBtnRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
      }
      tlB.fromTo(
        destinationsRowRef.current.children,
        { opacity: 0, x: yMove },
        { opacity: 1, x: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out' },
        0.05
      );
    }
  });

  return (
    <section
      id="island"
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
                  CHAPTER 02 · THE ISLAND
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                Noonu Atoll · Maldives
              </h2>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 font-mono text-xs text-white/45 tracking-[0.2em]">
              NORTHERN ATOLLS · MALDIVES
            </div>
          </div>
          <div ref={chapterLineRef} className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* Magazine Spread: Columns 1-4 Narrative | Columns 5-12 Aerial Photo */}
        <div className="editorial-grid-12 items-start mb-16 lg:mb-24">
          {/* Columns 1-4: Editorial Introduction */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <div className="space-y-3">
              <h3 className="font-editorial text-3xl sm:text-4xl text-white font-light leading-tight">
                <span className="block overflow-hidden">
                  <span ref={headlineLine1Ref} className="block">
                    ONE ISLAND.
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span ref={headlineLine2Ref} className="block italic text-[#dfcaa3]">
                    NOTHING ELSE.
                  </span>
                </span>
              </h3>
              <p ref={introQuoteRef} className="font-editorial text-lg text-white/80 italic font-light">
                &ldquo;Here, the horizon is not a boundary. It is an invitation to forget time.&rdquo;
              </p>
            </div>

            <p ref={introCopyRef} className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Isolated across the sapphire waters of Noonu Atoll, VELORA exists as an independent realm. There are no roads, no neighboring resorts within line of sight, and twenty-four architectural sanctuaries carved into the quiet coral reef.
            </p>

            {/* Geographical Figures (Task 4: 24 SANCTUARIES · 8.4 KM² LAGOON · 420+ REEF SPECIES) */}
            <div ref={statsContainerRef} className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">24</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">SANCTUARIES</span>
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">8.4</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">KM² LAGOON</span>
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">420+</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">REEF SPECIES</span>
              </div>
            </div>

            <div ref={ctaBtnRef} className="pt-2">
              <button
                onClick={onNavigateToStay}
                data-cursor="STAY"
                className="editorial-link"
              >
                <span>DISCOVER SANCTUARIES</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </button>
            </div>
          </div>

          {/* Columns 5-12: Large Dominant Aerial Photograph */}
          <div className="lg:col-span-8">
            <div
              ref={aerialContainerRef}
              className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/10] w-full shadow-2xl"
            >
              <ResponsiveImage
                ref={aerialImageRef}
                src={veloraResort.islandIntro.aerialImage}
                alt="Aerial view of Velora Atoll"
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="w-full h-full object-cover velora-image-grade"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04080f]/75 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white/70 font-mono text-[11px] tracking-wider pointer-events-none">
                <span>SOLITARY CORAL REEF</span>
                <span className="hidden sm:inline">NOONU ATOLL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Editorial Row: 3 Clean Contextual Destinations */}
        <div className="pt-8 border-t border-white/10">
          <div ref={destinationsRowRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="space-y-3 group text-left border-l border-white/10 pl-5 hover:border-[#dfcaa3] transition-colors"
              >
                <span className="text-[9px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans block">
                  {dest.tag}
                </span>

                <h4 className="font-editorial text-xl sm:text-2xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  {dest.title}
                </h4>

                <p className="font-sans text-xs text-white/65 leading-relaxed font-light">
                  {dest.desc}
                </p>

                <div className="pt-2">
                  <button
                    onClick={dest.onClick}
                    className="editorial-link text-[10px]"
                  >
                    {dest.is360 && <Compass className="w-3 h-3 text-[#dfcaa3]" />}
                    <span>{dest.actionLabel}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
