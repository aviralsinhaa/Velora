import { RESORT_MEDIA } from '../../data/mediaAssets';
import { Plane, ArrowRight } from 'lucide-react';

interface GettingHereChapterProps {
  onOpenGettingHereDetails: () => void;
}

export function GettingHereChapter({ onOpenGettingHereDetails }: GettingHereChapterProps) {
  return (
    <section id="getting-here" className="relative w-full py-20 sm:py-28 lg:py-36 bg-[#04080f] text-[#ece6dc] border-t border-white/10">
      <div className="editorial-container">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-5 mb-12 sm:mb-16">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CHAPTER 07 · GETTING HERE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light tracking-wide">
              Arrival Trajectory
            </h2>
          </div>
          <div className="font-mono text-xs text-white/45 tracking-[0.2em]">
            45 MIN SEAPLANE TRANSIT
          </div>
        </div>

        {/* 12-Column Spread: 4 Cols Copy | 8 Cols Aerial Seaplane Photography */}
        <div className="editorial-grid-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                NOONU ATOLL LOGISTICS
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-white font-light leading-tight">
                Forty-Five Minutes Above the Coral Rings
              </h3>
            </div>

            <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light">
              From Velana International Airport in Malé, a scenic seaplane journey glides over vibrant turquoise ring-reefs before docking smoothly at the Velora outer lagoon pontoon.
            </p>

            {/* Travel Path Pill Indicator */}
            <div className="flex items-center gap-3 py-3 border-y border-white/10 font-mono text-xs text-white/90">
              <span>MALÉ (MLE)</span>
              <span className="w-6 h-[1px] bg-[#dfcaa3]" />
              <span className="text-[#dfcaa3] flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px]">
                <Plane className="w-3.5 h-3.5" />
                <span>45 MIN FLIGHT</span>
              </span>
              <span className="w-6 h-[1px] bg-[#dfcaa3]" />
              <span>VELORA</span>
            </div>

            <p className="font-sans text-xs text-white/50 font-light">
              Waterfront lounge access in Malé with refreshments and flight coordination before departure.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenGettingHereDetails}
                data-cursor="TRANSIT"
                className="editorial-link"
              >
                <span>Explore Travel Logistics & Lounge Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              onClick={onOpenGettingHereDetails}
              className="rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[16/9] w-full shadow-2xl cursor-pointer group"
            >
              <img
                src={RESORT_MEDIA.arrival.seaplaneLagoon}
                alt="Seaplane transfer across the atoll"
                className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
