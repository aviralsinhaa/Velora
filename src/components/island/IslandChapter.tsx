import { veloraResort } from '../../data/resortConfig';
import { Compass, ArrowRight } from 'lucide-react';

interface IslandChapterProps {
  onOpen360Scene: (sceneId: string) => void;
  onNavigateToStay: () => void;
}

export function IslandChapter({ onOpen360Scene, onNavigateToStay }: IslandChapterProps) {
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

  return (
    <section
      id="island"
      className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden"
    >
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-10 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 02 · THE ISLAND
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              Noonu Atoll · Maldives
            </h2>
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0 font-mono text-xs text-white/45 tracking-[0.2em]">
            NORTHERN ATOLLS · MALDIVES
          </div>
        </div>

        {/* Magazine Spread: Columns 1-4 Narrative | Columns 5-12 Aerial Photo */}
        <div className="editorial-grid-12 items-start mb-16 lg:mb-24">
          {/* Columns 1-4: Editorial Introduction */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <div className="space-y-3">
              <h3 className="font-editorial text-3xl sm:text-4xl text-white font-light leading-tight">
                ONE ISLAND. <br />
                <span className="italic text-[#dfcaa3]">NOTHING ELSE.</span>
              </h3>
              <p className="font-editorial text-lg text-white/80 italic font-light">
                &ldquo;Here, the horizon is not a boundary. It is an invitation to forget time.&rdquo;
              </p>
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              Isolated across the sapphire waters of Noonu Atoll, VELORA exists as an independent realm. There are no roads, no neighboring resorts within line of sight, and twenty-four architectural sanctuaries carved into the quiet coral reef.
            </p>

            {/* Geographical Figures */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">24</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">Villas</span>
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">1</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">Private Island</span>
              </div>
              <div>
                <span className="font-editorial text-2xl sm:text-3xl text-white block">45</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans">Min Flight</span>
              </div>
            </div>

            <div className="pt-2">
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
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/10] w-full shadow-2xl">
              <img
                src={veloraResort.islandIntro.aerialImage}
                alt="Aerial view of Velora Atoll"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
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
