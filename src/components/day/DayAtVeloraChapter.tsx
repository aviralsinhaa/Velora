import { useState, useEffect, useRef } from 'react';
import { oceanAudio, IslandSoundZone } from '../../utils/audio';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

interface DayMoment {
  time: string;
  title: string;
  fullTitle: string;
  sentence: string;
  image: string;
  zone: IslandSoundZone;
}

interface DayAtVeloraChapterProps {
  onOpenConcierge: (prompt?: string) => void;
}

export function DayAtVeloraChapter({ onOpenConcierge }: DayAtVeloraChapterProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const moments: DayMoment[] = [
    {
      time: '06:24',
      title: 'WAKE',
      fullTitle: 'Awakening With The Tide',
      sentence: 'First light breaks across the eastern lagoon as the solitary tide turns.',
      image: RESORT_MEDIA.circadian.dawn,
      zone: 'morning',
    },
    {
      time: '08:10',
      title: 'BREAKFAST',
      fullTitle: 'Overwater Harvest',
      sentence: 'Hand-pressed tropical harvest served on your private overwater deck.',
      image: RESORT_MEDIA.circadian.morning,
      zone: 'morning',
    },
    {
      time: '11:42',
      title: 'DIVE',
      fullTitle: 'The Outer Drop-Off',
      sentence: 'Gliding along the coral drop-off with tropical marine life in crystal visibility.',
      image: RESORT_MEDIA.circadian.noon,
      zone: 'dive',
    },
    {
      time: '15:20',
      title: 'BREATHE',
      fullTitle: 'Deep Oceanic Stillness',
      sentence: 'Tibetan crystal sound meditation suspended above the quiet living reef.',
      image: RESORT_MEDIA.circadian.afternoon,
      zone: 'wellness',
    },
    {
      time: '18:17',
      title: 'SAIL',
      fullTitle: 'Sunset Ocean Catamaran',
      sentence: 'Private catamaran gliding into warm western skies across the quiet lagoon.',
      image: RESORT_MEDIA.circadian.sunset,
      zone: 'sunset',
    },
    {
      time: '20:36',
      title: 'DINE',
      fullTitle: 'Lantern-Lit Sandbank',
      sentence: 'Lanterns illuminating an untouched sandbank under infinite southern stars.',
      image: RESORT_MEDIA.circadian.dusk,
      zone: 'dinner',
    },
    {
      time: '23:08',
      title: 'STILLNESS',
      fullTitle: 'Midnight Lagoon',
      sentence: 'Bioluminescent tide glowing softly beneath your solitary starlight sanctuary.',
      image: RESORT_MEDIA.circadian.night,
      zone: 'night',
    },
  ];

  const current = moments[activeIdx];

  useEffect(() => {
    oceanAudio.setSoundscapeZone(current.zone);
  }, [activeIdx, current.zone]);

  return (
    <section
      id="day"
      ref={containerRef}
      className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden border-t border-white/10"
    >
      <div className="editorial-container">
        {/* Chapter Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-10 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 05 · A DAY AT VELORA
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              The Island Day
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono text-xs text-white/50">
            <span>06:24 — 23:08</span>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setActiveIdx((prev) => (prev - 1 + moments.length) % moments.length)}
                data-cursor="PREV"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                aria-label="Previous circadian moment"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev + 1) % moments.length)}
                data-cursor="NEXT"
                className="w-8 h-8 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors"
                aria-label="Next circadian moment"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE VERTICAL STORY (< md screens)
            Sequential unhurried flow: image -> time & title -> description
           ======================================================== */}
        <div className="block md:hidden space-y-8 mb-12">
          {moments.map((m, idx) => (
            <div key={m.time} className="space-y-3 pb-6 border-b border-white/10">
              <div className="aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-[#06101c]">
                <img
                  src={m.image}
                  alt={m.fullTitle}
                  className="w-full h-full object-cover velora-image-grade"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2 text-[#dfcaa3] text-[9.5px] uppercase tracking-[0.24em] font-sans font-medium">
                <span>{m.time}</span>
                <span>·</span>
                <span>{m.title}</span>
              </div>

              <h3 className="font-editorial text-2xl text-white font-light">
                {m.fullTitle}
              </h3>

              <p className="font-sans text-xs text-white/70 leading-relaxed font-light">
                {m.sentence}
              </p>
            </div>
          ))}

          <div className="pt-4 text-center">
            <button
              onClick={() => onOpenConcierge('Design my day at Velora.')}
              data-cursor="DESIGN"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#dfcaa3] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>DESIGN MY DAY ✦</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            DESKTOP EDITORIAL STAGE (md+ screens)
            Direct photographic canvas without heavy card container
           ======================================================== */}
        <div className="hidden md:block">
          {/* Circadian Timeline Selector Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-white/10">
            {moments.map((m, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={m.time}
                  onClick={() => setActiveIdx(idx)}
                  className={`group flex flex-col items-start min-w-[90px] py-1 text-left transition-colors ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <span className="font-mono text-xs tracking-wider block">{m.time}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-sans block mt-0.5 group-hover:text-[#dfcaa3] transition-colors">
                    {m.title}
                  </span>
                  <span
                    className={`block h-[1.5px] mt-2 transition-all duration-500 ${
                      isActive ? 'w-full bg-[#dfcaa3]' : 'w-0 bg-transparent group-hover:w-1/2 group-hover:bg-white/30'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Large Photographic Stage — Frame the image directly on the page */}
          <div className="editorial-grid-12 items-end mb-12">
            {/* Columns 1-4: Editorial Moment Details */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="flex items-center gap-2 text-[#dfcaa3] text-[10px] uppercase tracking-[0.28em] font-sans font-medium">
                <span>{current.title}</span>
                <span>·</span>
                <span>{current.time}</span>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
                {current.fullTitle}
              </h3>

              <p className="font-sans text-sm text-white/75 leading-relaxed font-light max-w-sm">
                {current.sentence}
              </p>

              <div className="pt-4">
                <button
                  onClick={() =>
                    onOpenConcierge(`I would like to explore activities around ${current.title} at ${current.time}.`)
                  }
                  className="editorial-link"
                >
                  <span>PLAN THIS MOMENT</span>
                </button>
              </div>
            </div>

            {/* Columns 5-12: Full Height Photographic Canvas */}
            <div className="lg:col-span-8">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-2xl">
                {moments.map((m, idx) => (
                  <div
                    key={m.time}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                      idx === activeIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                    style={{ backgroundImage: `url(${m.image})` }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04080f]/80 via-transparent to-black/20 pointer-events-none" />

                {/* Monumental Time Overlay */}
                <div className="absolute top-6 right-8 select-none pointer-events-none text-right">
                  <span className="font-editorial text-7xl lg:text-8xl text-white/15 block font-light leading-none">
                    {current.time}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-sans text-[#dfcaa3]/60 block mt-1">
                    MALDIVES TIME
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Footer: Single deliberate action */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            <p className="font-editorial text-lg text-white/70 italic font-light">
              &ldquo;A day at Velora has no schedule, only the rhythm of the ocean.&rdquo;
            </p>

            <button
              onClick={() => onOpenConcierge('Design my ideal day at Velora from morning awakening to starlight stillness.')}
              data-cursor="DESIGN"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-[0_0_24px_rgba(223,202,163,0.2)] hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>DESIGN MY DAY ✦</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
