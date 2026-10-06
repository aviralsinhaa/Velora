import { useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ArrowRight } from 'lucide-react';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import gsap from 'gsap';

interface IslandLifeChapterProps {
  onOpenDining: () => void;
  onOpenExperiences: () => void;
  onOpenWellness: () => void;
}

export function IslandLifeChapter({
  onOpenDining,
  onOpenExperiences,
  onOpenWellness,
}: IslandLifeChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLDivElement>(null);

  const diningCardRef = useRef<HTMLDivElement>(null);
  const diningImgRef = useRef<HTMLImageElement>(null);
  const diningTitleRef = useRef<HTMLSpanElement>(null);
  const diningLabelRef = useRef<HTMLSpanElement>(null);
  const diningDescRef = useRef<HTMLParagraphElement>(null);
  const diningLinkRef = useRef<HTMLSpanElement>(null);

  const expCardRef = useRef<HTMLDivElement>(null);
  const expImgRef = useRef<HTMLImageElement>(null);
  const expTitleRef = useRef<HTMLSpanElement>(null);
  const expLabelRef = useRef<HTMLSpanElement>(null);
  const expDescRef = useRef<HTMLParagraphElement>(null);
  const expLinkRef = useRef<HTMLSpanElement>(null);

  const wellnessCardRef = useRef<HTMLDivElement>(null);
  const wellnessImgRef = useRef<HTMLImageElement>(null);
  const wellnessTitleRef = useRef<HTMLSpanElement>(null);
  const wellnessLabelRef = useRef<HTMLSpanElement>(null);
  const wellnessDescRef = useRef<HTMLParagraphElement>(null);
  const wellnessLinkRef = useRef<HTMLSpanElement>(null);

  useScrollMotion(sectionRef, (_ctx, isReducedMotion) => {
    if (isReducedMotion || !sectionRef.current) return;

    // GROUP A: Header, Dining Card, Experiences Card (Triggered at Section Entry)
    const tlA = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    // Chapter Header signature
    if (chapterDotRef.current) {
      tlA.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      tlA.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      tlA.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }

    // 1. DINING CARD: Image leads (~80ms progression)
    if (diningCardRef.current) {
      tlA.fromTo(diningCardRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.12);
    }
    if (diningImgRef.current) {
      tlA.fromTo(diningImgRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, 0.12);
    }
    if (diningLabelRef.current) {
      tlA.fromTo(diningLabelRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.18);
    }
    if (diningTitleRef.current) {
      tlA.fromTo(diningTitleRef.current, { yPercent: 105 }, { yPercent: 0, duration: 0.75, ease: 'power3.out' }, 0.24);
    }
    if (diningDescRef.current) {
      tlA.fromTo(diningDescRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.30);
    }
    if (diningLinkRef.current) {
      tlA.fromTo(diningLinkRef.current, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.36);
    }

    // 2. EXPERIENCES CARD: Headline leads (~80ms progression)
    if (expTitleRef.current) {
      tlA.fromTo(expTitleRef.current, { yPercent: 105 }, { yPercent: 0, duration: 0.75, ease: 'power3.out' }, 0.26);
    }
    if (expLabelRef.current) {
      tlA.fromTo(expLabelRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.30);
    }
    if (expCardRef.current) {
      tlA.fromTo(expCardRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.34);
    }
    if (expImgRef.current) {
      tlA.fromTo(expImgRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, 0.34);
    }
    if (expDescRef.current) {
      tlA.fromTo(expDescRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.40);
    }
    if (expLinkRef.current) {
      tlA.fromTo(expLinkRef.current, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.46);
    }

    // GROUP B: WELLNESS CARD (Task 7: triggers when user actually reaches it)
    if (wellnessCardRef.current) {
      const tlB = gsap.timeline({
        scrollTrigger: {
          trigger: wellnessCardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tlB.fromTo(wellnessCardRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
      if (wellnessImgRef.current) {
        tlB.fromTo(wellnessImgRef.current, { scale: 1.035 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, 0);
      }
      if (wellnessLabelRef.current) {
        tlB.fromTo(wellnessLabelRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.05);
      }
      if (wellnessTitleRef.current) {
        tlB.fromTo(wellnessTitleRef.current, { yPercent: 105 }, { yPercent: 0, duration: 0.75, ease: 'power3.out' }, 0.1);
      }
      if (wellnessDescRef.current) {
        tlB.fromTo(wellnessDescRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.16);
      }
      if (wellnessLinkRef.current) {
        tlB.fromTo(wellnessLinkRef.current, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.24);
      }
    }
  });

  return (
    <section
      id="island-life"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden border-t border-white/10"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span ref={chapterDotRef} className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span ref={chapterTextRef} className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
                  CHAPTER 04 · ISLAND LIFE
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                Ecosystems of Ocean & Living
              </h2>
            </div>
            <p className="text-left sm:text-right font-sans text-xs text-white/50 max-w-xs font-light mt-2 sm:mt-0">
              Three living dimensions shaped entirely around the rhythm of water, fire, and quiet restoration.
            </p>
          </div>
          <div ref={chapterLineRef} className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* Spread 1: 7 Cols Dining | 5 Cols Ocean & Reef (Asymmetric) */}
        <div className="editorial-grid-12 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
          {/* 7 Cols: Dining Gateway */}
          <div
            ref={diningCardRef}
            role="button"
            tabIndex={0}
            onClick={onOpenDining}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDining();
              }
            }}
            aria-label="Explore Dining Above the Reef"
            data-cursor="DINING"
            className="lg:col-span-7 group cursor-pointer space-y-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-xl"
          >
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-xl">
              <ResponsiveImage
                ref={diningImgRef}
                src={RESORT_MEDIA.dining.aura.hero}
                alt="Dining over the lagoon"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-[1.018] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6">
                <span ref={diningLabelRef} className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  01 · CULINARY SANCTUARIES
                </span>
                <h3 className="font-editorial text-2xl sm:text-4xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  <span className="block overflow-hidden">
                    <span ref={diningTitleRef} className="block">
                      Dining Above the Reef
                    </span>
                  </span>
                </h3>
                <p ref={diningDescRef} className="font-sans text-xs sm:text-sm text-white/70 max-w-md mt-1 font-light hidden sm:block">
                  Contemporary coastal Japanese at AURA, beachfront woodfire grills at EMBER, and lantern-lit private sandbank dining.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-sans text-white/60 text-[11px] uppercase tracking-wider">AURA · EMBER · TIDE · SANDBANK</span>
              <span ref={diningLinkRef} className="editorial-link">
                <span>Explore Dining</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </span>
            </div>
          </div>

          {/* 5 Cols: Ocean / Experiences Gateway */}
          <div
            ref={expCardRef}
            role="button"
            tabIndex={0}
            onClick={onOpenExperiences}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenExperiences();
              }
            }}
            aria-label="Explore House Reef & Expeditions"
            data-cursor="OCEAN"
            className="lg:col-span-5 group cursor-pointer space-y-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-xl"
          >
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/5] sm:aspect-[4/5] shadow-xl">
              <ResponsiveImage
                ref={expImgRef}
                src={RESORT_MEDIA.experiences.mantaReefDive}
                alt="Diving the house reef"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-[1.018] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6">
                <span ref={expLabelRef} className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  02 · OCEAN & REEF
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  <span className="block overflow-hidden">
                    <span ref={expTitleRef} className="block">
                      House Reef & Expeditions
                    </span>
                  </span>
                </h3>
                <p ref={expDescRef} className="font-sans text-xs text-white/70 mt-1 font-light hidden sm:block">
                  Outer-reef drift exploration, sunset catamaran sails, and deserted atoll picnics.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-sans text-white/60 text-[11px] uppercase tracking-wider">SNORKELING · SAILING · EXPEDITIONS</span>
              <span ref={expLinkRef} className="editorial-link">
                <span>Explore Experiences</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </span>
            </div>
          </div>
        </div>

        {/* Spread 2: Full-Width / 12-Column Quieter Wellness Gateway */}
        <div
          ref={wellnessCardRef}
          role="button"
          tabIndex={0}
          onClick={onOpenWellness}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenWellness();
            }
          }}
          aria-label="Discover Wellness & Rituals at The Water Pavilion"
          data-cursor="WELLNESS"
          className="group cursor-pointer space-y-4 text-left border-t border-white/10 pt-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-xl"
        >
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/9] sm:aspect-[21/9] shadow-xl">
            <ResponsiveImage
              ref={wellnessImgRef}
              src={RESORT_MEDIA.wellness.waterPavilion}
              alt="The Water Pavilion at Velora"
              sizes="(max-width: 1024px) 100vw, 90vw"
              className="w-full h-full object-cover velora-image-grade group-hover:scale-[1.018] transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span ref={wellnessLabelRef} className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  03 · THE WATER PAVILION
                </span>
                <h3 className="font-editorial text-2xl sm:text-4xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  <span className="block overflow-hidden">
                    <span ref={wellnessTitleRef} className="block">
                      Restoration Over the Lagoon
                    </span>
                  </span>
                </h3>
                <p ref={wellnessDescRef} className="font-sans text-xs sm:text-sm text-white/70 max-w-lg mt-1 font-light">
                  Restorative sound sessions, open-air yoga on the movement deck, and Ayurvedic warm oil therapies suspended above water.
                </p>
              </div>
              <span ref={wellnessLinkRef} className="editorial-link self-start sm:self-auto">
                <span>Discover Wellness & Rituals</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
