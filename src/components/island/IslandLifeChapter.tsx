import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ArrowRight } from 'lucide-react';

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
  return (
    <section id="island-life" className="relative w-full py-20 sm:py-28 lg:py-40 bg-[#04080f] text-[#ece6dc] overflow-hidden border-t border-white/10">
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 04 · ISLAND LIFE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              Ecosystems of Ocean & Living
            </h2>
          </div>
          <p className="text-left sm:text-right font-sans text-xs text-white/50 max-w-xs font-light mt-2 sm:mt-0">
            Three living dimensions shaped entirely around the rhythm of water, fire, and quiet restoration.
          </p>
        </div>

        {/* Spread 1: 7 Cols Dining | 5 Cols Ocean & Reef (Asymmetric) */}
        <div className="editorial-grid-12 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
          {/* 7 Cols: Dining Gateway */}
          <div
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
            className="lg:col-span-7 group cursor-pointer space-y-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-2xl"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-2xl">
              <img
                src={RESORT_MEDIA.dining.aura.hero}
                alt="Dining over the lagoon"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  01 · CULINARY SANCTUARIES
                </span>
                <h3 className="font-editorial text-2xl sm:text-4xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  Dining Above the Reef
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/70 max-w-md mt-1 font-light hidden sm:block">
                  Contemporary coastal Japanese at AURA, beachfront woodfire grills at EMBER, and lantern-lit private sandbank dining.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-sans text-white/60 text-[11px] uppercase tracking-wider">AURA · EMBER · TIDE · SANDBANK</span>
              <span className="editorial-link">
                <span>Explore Dining</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </span>
            </div>
          </div>

          {/* 5 Cols: Ocean / Experiences Gateway */}
          <div
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
            className="lg:col-span-5 group cursor-pointer space-y-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-2xl"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/5] sm:aspect-[4/5] shadow-2xl">
              <img
                src={RESORT_MEDIA.experiences.mantaReefDive}
                alt="Diving the house reef"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6">
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  02 · OCEAN & REEF
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  House Reef & Expeditions
                </h3>
                <p className="font-sans text-xs text-white/70 mt-1 font-light hidden sm:block">
                  Outer-reef drift exploration, sunset catamaran sails, and deserted atoll picnics.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-sans text-white/60 text-[11px] uppercase tracking-wider">SNORKELING · SAILING · EXPEDITIONS</span>
              <span className="editorial-link">
                <span>Explore Experiences</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </span>
            </div>
          </div>
        </div>

        {/* Spread 2: Full-Width / 12-Column Quieter Wellness Gateway */}
        <div
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
          className="group cursor-pointer space-y-4 text-left border-t border-white/10 pt-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dfcaa3] rounded-2xl"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/9] sm:aspect-[21/9] shadow-2xl">
            <img
              src={RESORT_MEDIA.wellness.waterPavilion}
              alt="The Water Pavilion at Velora"
              className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block mb-1">
                  03 · THE WATER PAVILION
                </span>
                <h3 className="font-editorial text-2xl sm:text-4xl text-white font-light group-hover:text-[#dfcaa3] transition-colors">
                  Restoration Over the Lagoon
                </h3>
                <p className="font-sans text-xs sm:text-sm text-white/70 max-w-lg mt-1 font-light">
                  Restorative sound sessions, open-air yoga on the movement deck, and Ayurvedic warm oil therapies suspended above water.
                </p>
              </div>
              <span className="editorial-link self-start sm:self-auto">
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
