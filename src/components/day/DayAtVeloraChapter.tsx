import { useEffect, useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { Sparkles } from 'lucide-react';

interface DayMoment {
  time: string;
  title: string;
  fullTitle: string;
  sentence: string;
  image: string;
  layout: 'image-left-7' | 'image-right-7' | 'image-left-8' | 'image-right-6';
}

interface DayAtVeloraChapterProps {
  onOpenConcierge: (prompt?: string) => void;
}

export function DayAtVeloraChapter({ onOpenConcierge }: DayAtVeloraChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const moments: DayMoment[] = [
    {
      time: '06:24',
      title: 'WAKE',
      fullTitle: 'Awakening With The Tide',
      sentence: 'First light breaks across the eastern lagoon as the solitary tide turns.',
      image: RESORT_MEDIA.circadian.dawn,
      layout: 'image-left-7',
    },
    {
      time: '08:10',
      title: 'BREAKFAST',
      fullTitle: 'Overwater Harvest',
      sentence: 'Hand-pressed tropical harvest served on your private overwater deck.',
      image: RESORT_MEDIA.circadian.morning,
      layout: 'image-right-7',
    },
    {
      time: '11:42',
      title: 'DIVE',
      fullTitle: 'The Outer Drop-Off',
      sentence: 'Gliding along the coral drop-off with tropical marine life in crystal visibility.',
      image: RESORT_MEDIA.circadian.noon,
      layout: 'image-left-8',
    },
    {
      time: '15:20',
      title: 'BREATHE',
      fullTitle: 'Deep Oceanic Stillness',
      sentence: 'Tibetan crystal sound meditation suspended above the quiet living reef.',
      image: RESORT_MEDIA.circadian.afternoon,
      layout: 'image-right-6',
    },
    {
      time: '18:17',
      title: 'SAIL',
      fullTitle: 'Sunset Ocean Catamaran',
      sentence: 'Private catamaran gliding into warm western skies across the quiet lagoon.',
      image: RESORT_MEDIA.circadian.sunset,
      layout: 'image-left-7',
    },
    {
      time: '20:36',
      title: 'DINE',
      fullTitle: 'Lantern-Lit Sandbank',
      sentence: 'Lanterns illuminating an untouched sandbank under infinite southern stars.',
      image: RESORT_MEDIA.circadian.dusk,
      layout: 'image-right-7',
    },
    {
      time: '23:08',
      title: 'STILLNESS',
      fullTitle: 'Midnight Lagoon',
      sentence: 'Bioluminescent tide glowing softly beneath your solitary starlight sanctuary.',
      image: RESORT_MEDIA.circadian.night,
      layout: 'image-left-8',
    },
  ];

  // ONE native IntersectionObserver observing all rows (Zero React scroll state churn)
  useEffect(() => {
    const root = sectionRef.current;
    if (typeof window === 'undefined' || !root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = root.querySelectorAll('.day-editorial-row');

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.08,
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="day"
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-36 bg-[#04080f] text-[#ece6dc] border-t border-white/10"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="border-b border-white/10 pb-5 mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
                <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
                  CHAPTER 05 · A DAY AT VELORA
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
                The Island Day
              </h2>
            </div>
            <div className="font-mono text-xs text-white/50 tracking-widest mt-2 sm:mt-0">
              06:24 — 23:08 · CIRCADIAN NARRATIVE
            </div>
          </div>
          <div className="w-full h-[1px] bg-white/10 mt-5 origin-left" />
        </div>

        {/* Seven Complete Editorial Moments (Task 8: Tightened Spacing, Zero Persistent will-change) */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {moments.map((m) => {
            if (m.layout === 'image-left-7') {
              return (
                <article
                  key={m.time}
                  className="day-editorial-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
                >
                  {/* Image: Columns 1-7 */}
                  <div className="lg:col-span-7">
                    <div className="day-row-img-frame relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-xl">
                      <ResponsiveImage
                        src={m.image}
                        alt={m.fullTitle}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="day-row-img w-full h-full object-cover velora-image-grade"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Text: Columns 9-12 (Image-left -> text begins x 10px -> 0) */}
                  <div className="day-text-left lg:col-start-9 lg:col-span-4 space-y-4 text-left">
                    <div className="overflow-hidden">
                      <span className="day-row-time font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#dfcaa3] block font-light leading-none">
                        {m.time}
                      </span>
                    </div>
                    <span className="day-row-category text-[10px] uppercase text-white/60 font-sans block font-medium">
                      {m.title}
                    </span>
                    <div className="overflow-hidden">
                      <h3 className="day-row-title font-editorial text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-snug">
                        {m.fullTitle}
                      </h3>
                    </div>
                    <p className="day-row-desc font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                      {m.sentence}
                    </p>
                    <div className="day-row-cta pt-2">
                      <button
                        onClick={() =>
                          onOpenConcierge(`I would like to explore activities around ${m.title} at ${m.time}.`)
                        }
                        className="editorial-link"
                      >
                        <span>PLAN THIS MOMENT</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            if (m.layout === 'image-right-7') {
              return (
                <article
                  key={m.time}
                  className="day-editorial-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
                >
                  {/* Text on Mobile, Left on Desktop: Columns 1-4 (Image-right -> text begins x -10px -> 0) */}
                  <div className="day-text-right lg:col-span-4 space-y-4 text-left order-2 lg:order-1">
                    <div className="overflow-hidden">
                      <span className="day-row-time font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#dfcaa3] block font-light leading-none">
                        {m.time}
                      </span>
                    </div>
                    <span className="day-row-category text-[10px] uppercase text-white/60 font-sans block font-medium">
                      {m.title}
                    </span>
                    <div className="overflow-hidden">
                      <h3 className="day-row-title font-editorial text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-snug">
                        {m.fullTitle}
                      </h3>
                    </div>
                    <p className="day-row-desc font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                      {m.sentence}
                    </p>
                    <div className="day-row-cta pt-2">
                      <button
                        onClick={() =>
                          onOpenConcierge(`I would like to explore activities around ${m.title} at ${m.time}.`)
                        }
                        className="editorial-link"
                      >
                        <span>PLAN THIS MOMENT</span>
                      </button>
                    </div>
                  </div>

                  {/* Image: Columns 6-12 */}
                  <div className="lg:col-start-6 lg:col-span-7 order-1 lg:order-2">
                    <div className="day-row-img-frame relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-xl">
                      <ResponsiveImage
                        src={m.image}
                        alt={m.fullTitle}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="day-row-img w-full h-full object-cover velora-image-grade"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </article>
              );
            }

            if (m.layout === 'image-left-8') {
              return (
                <article
                  key={m.time}
                  className="day-editorial-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
                >
                  {/* Image: Columns 1-8 */}
                  <div className="lg:col-span-8">
                    <div className="day-row-img-frame relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/9] shadow-xl">
                      <ResponsiveImage
                        src={m.image}
                        alt={m.fullTitle}
                        sizes="(max-width: 1024px) 100vw, 65vw"
                        className="day-row-img w-full h-full object-cover velora-image-grade"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Text: Columns 10-12 (Image-left -> text begins x 10px -> 0) */}
                  <div className="day-text-left lg:col-start-10 lg:col-span-3 space-y-4 text-left">
                    <div className="overflow-hidden">
                      <span className="day-row-time font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#dfcaa3] block font-light leading-none">
                        {m.time}
                      </span>
                    </div>
                    <span className="day-row-category text-[10px] uppercase text-white/60 font-sans block font-medium">
                      {m.title}
                    </span>
                    <div className="overflow-hidden">
                      <h3 className="day-row-title font-editorial text-2xl sm:text-3xl text-white font-light leading-snug">
                        {m.fullTitle}
                      </h3>
                    </div>
                    <p className="day-row-desc font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                      {m.sentence}
                    </p>
                    <div className="day-row-cta pt-2">
                      <button
                        onClick={() =>
                          onOpenConcierge(`I would like to explore activities around ${m.title} at ${m.time}.`)
                        }
                        className="editorial-link"
                      >
                        <span>PLAN THIS MOMENT</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            // image-right-6
            return (
              <article
                key={m.time}
                className="day-editorial-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
              >
                {/* Text: Columns 2-5 (Image-right -> text begins x -10px -> 0) */}
                <div className="day-text-right lg:col-start-2 lg:col-span-4 space-y-4 text-left order-2 lg:order-1">
                  <div className="overflow-hidden">
                    <span className="day-row-time font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#dfcaa3] block font-light leading-none">
                      {m.time}
                    </span>
                  </div>
                  <span className="day-row-category text-[10px] uppercase text-white/60 font-sans block font-medium">
                    {m.title}
                  </span>
                  <div className="overflow-hidden">
                    <h3 className="day-row-title font-editorial text-2xl sm:text-3xl text-white font-light leading-snug">
                      {m.fullTitle}
                    </h3>
                  </div>
                  <p className="day-row-desc font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                    {m.sentence}
                  </p>
                  <div className="day-row-cta pt-2">
                    <button
                      onClick={() =>
                        onOpenConcierge(`I would like to explore activities around ${m.title} at ${m.time}.`)
                      }
                      className="editorial-link"
                    >
                      <span>PLAN THIS MOMENT</span>
                    </button>
                  </div>
                </div>

                {/* Image: Columns 7-12 */}
                <div className="lg:col-start-7 lg:col-span-6 order-1 lg:order-2">
                  <div className="day-row-img-frame relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/3] shadow-xl">
                    <ResponsiveImage
                      src={m.image}
                      alt={m.fullTitle}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="day-row-img w-full h-full object-cover velora-image-grade"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Section Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-16 border-t border-white/10 mt-20 sm:mt-28">
          <p className="font-editorial text-lg sm:text-xl text-white/70 italic font-light text-center sm:text-left">
            &ldquo;A day at Velora has no schedule, only the rhythm of the ocean.&rdquo;
          </p>

          <button
            onClick={() => onOpenConcierge('Design my ideal day at Velora from morning awakening to starlight stillness.')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-colors duration-300 shadow-[0_0_24px_rgba(223,202,163,0.2)] hover:scale-[1.015]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DESIGN MY DAY ✦</span>
          </button>
        </div>
      </div>
    </section>
  );
}
