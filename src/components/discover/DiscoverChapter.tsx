import { useState, useEffect, useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollMotion } from '../../hooks/useScrollMotion';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import gsap from 'gsap';

interface GalleryPiece {
  id: string;
  title: string;
  caption: string;
  image: string;
  aspect: string;
  desktopCols: string;
  parallaxOffset: number;
}

export function DiscoverChapter() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const chapterDotRef = useRef<HTMLSpanElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const chapterLineRef = useRef<HTMLDivElement>(null);

  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);

  useFocusTrap(lightboxRef, lightboxIndex !== null, { autoFocusFirst: true });

  // Curated, art-directed editorial pieces from one cohesive Maldivian resort world
  const pieces: GalleryPiece[] = [
    // ROW 1: 12 columns large hero image
    {
      id: 'atoll-approach',
      title: 'Arrival Over Solitary Coral Ring Reefs',
      caption: 'NOONU ATOLL APPROACH',
      image: RESORT_MEDIA.arrival.seaplaneTransfer,
      aspect: 'aspect-[21/9] sm:aspect-[21/9]',
      desktopCols: 'col-span-12',
      parallaxOffset: -3,
    },
    // ROW 2: 7-column landscape + 5-column portrait
    {
      id: 'sunset-deck',
      title: 'Sunset Deck & Infinity Pool',
      caption: 'SUNSET DECK',
      image: RESORT_MEDIA.villas.sunsetPoolVilla.deck,
      aspect: 'aspect-[16/10]',
      desktopCols: 'lg:col-span-7',
      parallaxOffset: 4,
    },
    {
      id: 'house-reef-drift',
      title: 'Outer Reef Drop-Off',
      caption: 'HOUSE REEF',
      image: RESORT_MEDIA.experiences.mantaReefDive,
      aspect: 'aspect-[4/5]',
      desktopCols: 'lg:col-span-5',
      parallaxOffset: -5,
    },
    // ROW 3: 5-column portrait + 7-column landscape
    {
      id: 'water-pavilion',
      title: 'The Water Pavilion',
      caption: 'WATER PAVILION',
      image: RESORT_MEDIA.wellness.waterPavilion,
      aspect: 'aspect-[4/5]',
      desktopCols: 'lg:col-span-5',
      parallaxOffset: 3,
    },
    {
      id: 'private-sandbank-dining',
      title: 'Lantern-Lit Sandbank Table',
      caption: 'SANDBANK DINNER',
      image: RESORT_MEDIA.dining.sandbankOmakase.hero,
      aspect: 'aspect-[16/10]',
      desktopCols: 'lg:col-span-7',
      parallaxOffset: -4,
    },
    // ROW 4: Full-width cinematic image
    {
      id: 'sunset-catamaran',
      title: 'Dusk Catamaran Sail across Noonu Atoll',
      caption: 'SUNSET SAIL',
      image: RESORT_MEDIA.experiences.sunsetDhoniSail,
      aspect: 'aspect-[21/9]',
      desktopCols: 'col-span-12',
      parallaxOffset: 2,
    },
  ];

  // TASK 8: TWO grouped reveals with micro-choreography (no per-card triggers)
  useScrollMotion(sectionRef, (_ctx, isReducedMotion) => {
    if (isReducedMotion || !sectionRef.current) return;

    // Header reveal (Chapter 06 signature)
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    if (chapterDotRef.current) {
      headerTl.fromTo(chapterDotRef.current, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, 0);
    }
    if (chapterTextRef.current) {
      headerTl.fromTo(chapterTextRef.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.04);
    }
    if (chapterLineRef.current) {
      headerTl.fromTo(chapterLineRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.65, ease: 'power3.out' }, 0.06);
    }

    // Group 1 reveal (Pieces 0, 1, 2)
    if (group1Ref.current) {
      const cards = group1Ref.current.querySelectorAll('.gallery-card');
      const g1Tl = gsap.timeline({
        scrollTrigger: {
          trigger: group1Ref.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      cards.forEach((card, i) => {
        const offset = i * 0.08;
        const img = card.querySelector('img');
        const caption = card.querySelector('.gallery-caption');

        g1Tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, offset);
        if (img) {
          g1Tl.fromTo(img, { scale: 1.025 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, offset);
        }
        if (caption) {
          g1Tl.fromTo(caption, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, offset + 0.12);
        }
      });
    }

    // Group 2 reveal (Pieces 3, 4, 5)
    if (group2Ref.current) {
      const cards = group2Ref.current.querySelectorAll('.gallery-card');
      const g2Tl = gsap.timeline({
        scrollTrigger: {
          trigger: group2Ref.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      cards.forEach((card, i) => {
        const offset = i * 0.08;
        const img = card.querySelector('img');
        const caption = card.querySelector('.gallery-caption');

        g2Tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, offset);
        if (img) {
          g2Tl.fromTo(img, { scale: 1.025 }, { scale: 1.0, duration: 0.85, ease: 'power3.out' }, offset);
        }
        if (caption) {
          g2Tl.fromTo(caption, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, offset + 0.12);
        }
      });
    }
  });

  // Keyboard navigation and focus restoration for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % pieces.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + pieces.length) % pieces.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
        lastActiveElementRef.current.focus();
      }
    };
  }, [lightboxIndex, pieces.length]);

  return (
    <section
      id="discover"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] border-t border-white/10 overflow-hidden"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span ref={chapterDotRef} className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span ref={chapterTextRef} className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
                  CHAPTER 06 · DISCOVER
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                The Island, in Moments
              </h2>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 font-mono text-xs text-white/45 tracking-[0.2em]">
              PHOTOGRAPHY
            </div>
          </div>
          <div ref={chapterLineRef} className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* ========================================================
            MOBILE EDITORIAL RHYTHM (< md screens)
           ======================================================== */}
        <div className="block md:hidden space-y-10 mb-12">
          {pieces.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`Open ${p.title} photograph`}
              className="w-full text-left space-y-2 cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#dfcaa3] rounded-xl"
            >
              <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] ${p.aspect} w-full shadow-lg`}>
                <ResponsiveImage
                  src={p.image}
                  alt={p.title}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover velora-image-grade"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium">
                  {p.caption}
                </span>
                <span className="font-editorial text-white/90 text-sm italic">
                  {p.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ========================================================
            DESKTOP LAYERED EDITORIAL GALLERY (md+ screens)
            Group 1 (Rows 1 & 2) and Group 2 (Rows 3 & 4)
           ======================================================== */}
        <div className="hidden md:flex flex-col gap-8 lg:gap-10">
          {/* Group 1: Pieces 0, 1, 2 */}
          <div ref={group1Ref} className="grid grid-cols-12 gap-8 lg:gap-10">
            {pieces.slice(0, 3).map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Open ${p.title} photograph`}
                data-cursor="EXPAND"
                className={`gallery-card ${p.desktopCols} group cursor-pointer text-left space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-2xl`}
              >
                <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] ${p.aspect} w-full shadow-xl`}>
                  <ResponsiveImage
                    src={p.image}
                    alt={p.title}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover velora-image-grade md:group-hover:scale-[1.018] transition-transform duration-[800ms] ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />

                  <div className="gallery-caption absolute bottom-5 left-6 right-6 flex items-end justify-between pointer-events-none">
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium block">
                        {p.caption}
                      </span>
                      <h3 className="font-editorial text-xl lg:text-2xl text-white font-light">
                        {p.title}
                      </h3>
                    </div>

                    <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/60 font-light hidden lg:inline group-hover:translate-x-1 transition-transform duration-300">
                      EXPAND ↗
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Group 2: Pieces 3, 4, 5 */}
          <div ref={group2Ref} className="grid grid-cols-12 gap-8 lg:gap-10">
            {pieces.slice(3, 6).map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightboxIndex(idx + 3)}
                aria-label={`Open ${p.title} photograph`}
                data-cursor="EXPAND"
                className={`gallery-card ${p.desktopCols} group cursor-pointer text-left space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-xl`}
              >
                <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] ${p.aspect} w-full shadow-xl`}>
                  <ResponsiveImage
                    src={p.image}
                    alt={p.title}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover velora-image-grade md:group-hover:scale-[1.018] transition-transform duration-[800ms] ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-70 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />

                  <div className="gallery-caption absolute bottom-5 left-6 right-6 flex items-end justify-between pointer-events-none">
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium block">
                        {p.caption}
                      </span>
                      <h3 className="font-editorial text-xl lg:text-2xl text-white font-light">
                        {p.title}
                      </h3>
                    </div>

                    <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/60 font-light hidden lg:inline group-hover:translate-x-1 transition-transform duration-300">
                      EXPAND ↗
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Gallery Image"
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white/70">
            <div className="space-y-0.5">
              <span className="text-[9.5px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium block">
                {pieces[lightboxIndex].caption}
              </span>
              <span className="font-editorial text-lg sm:text-xl text-white font-light block">
                {pieces[lightboxIndex].title}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-white/40">
                0{lightboxIndex + 1} / 0{pieces.length}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                aria-label="Close Lightbox"
                className="p-2.5 rounded-full border border-white/20 hover:border-white text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Centered Expanded Image */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <ResponsiveImage
              src={pieces[lightboxIndex].image}
              alt={pieces[lightboxIndex].title}
              priority={true}
              sizes="(max-width: 1024px) 100vw, 1400px"
              className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + pieces.length) % pieces.length : 0))
              }
              aria-label="Previous image"
              className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors py-2 px-3"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#dfcaa3]" />
              <span>PREVIOUS</span>
            </button>

            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % pieces.length : 0))
              }
              aria-label="Next image"
              className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors py-2 px-3"
            >
              <span>NEXT</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
