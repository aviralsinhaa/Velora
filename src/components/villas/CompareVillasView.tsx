import { useEffect } from 'react';
import { Villa } from '../../types';
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react';

interface CompareVillasViewProps {
  villas: Villa[];
  onClose: () => void;
  onSelectVilla: (villaId: string) => void;
  onRequestStay: (villaId: string) => void;
  onAskConcierge: (prompt: string) => void;
}

export function CompareVillasView({
  villas,
  onClose,
  onSelectVilla,
  onRequestStay,
  onAskConcierge,
}: CompareVillasViewProps) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare Villas"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="compare-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            Compare Villas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskConcierge('Which villa is best for our stay?')}
            data-cursor="CONCIERGE"
            data-focus-id="compare-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={onClose}
            data-focus-id="compare-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close comparison view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-10 sm:space-y-14">
        {/* Intro */}
        <div className="border-b border-white/10 pb-6 text-left space-y-2">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
            ARCHITECTURAL COMPARISON
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl text-white font-light">
            Finding Your Island Sanctuary
          </h1>
          <p className="font-sans text-xs sm:text-sm text-white/70 max-w-2xl font-light">
            Each villa at Velora has been positioned intentionally: from sunset overwater infinity pools to secluded barefoot beachfront compounds and our solitary island-tip estate.
          </p>
        </div>

        {/* Comparison Table / Cards Matrix */}
        <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <div className="min-w-[840px] grid grid-cols-4 gap-6">
            {villas.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl bg-[#06101c] border border-white/10 p-6 flex flex-col justify-between space-y-6 text-left shadow-xl"
              >
                {/* Header Card Info */}
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-[#04080f]">
                    <img
                      src={v.featuredImage}
                      alt={v.name}
                      loading="lazy"
                      className="w-full h-full object-cover velora-image-grade"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans block">
                      {v.subtitle}
                    </span>
                    <h2 className="font-editorial text-2xl text-white font-normal mt-0.5">
                      {v.name}
                    </h2>
                    <span className="font-mono text-lg text-[#dfcaa3] block mt-1">
                      ${v.pricePerNight.toLocaleString()}<span className="text-xs text-white/40 font-sans"> / night</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => onRequestStay(v.id)}
                      data-focus-id={`compare-request-${v.id}`}
                      className="w-full py-2.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-xs uppercase tracking-[0.2em] font-sans font-medium transition-all text-center block"
                    >
                      REQUEST THIS VILLA
                    </button>
                    <button
                      onClick={() => onSelectVilla(v.id)}
                      data-focus-id={`compare-view-${v.id}`}
                      className="w-full py-2 text-center text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors block border border-white/10 rounded-full"
                    >
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Attributes Comparison */}
                <div className="space-y-4 border-t border-white/10 pt-4 text-xs font-sans">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">SETTING</span>
                    <span className="text-white capitalize">{v.category} Living</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">LIVING AREA</span>
                    <span className="font-editorial text-base text-white">{v.size}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">CAPACITY</span>
                    <span className="text-white">{v.guests} ({v.bedrooms})</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">ORIENTATION</span>
                    <span className="text-white/80">{v.orientation}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">POOL & WATER ACCESS</span>
                    <span className="text-white/80">
                      {v.id === 'sunset-pool-villa'
                        ? '16m Infinity Pool · Submerged Reef Ladder'
                        : v.id === 'ocean-lagoon-villa'
                        ? 'Plunge Pool · Direct Lagoon Reef Stairs'
                        : v.id === 'beach-reserve-residence'
                        ? 'Plunge Pool · 50m Barefoot Private Beach'
                        : 'Dual 25m Pools · Private Boat Mooring'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[9px] uppercase tracking-wider text-[#dfcaa3] block font-medium">BEST FOR</span>
                    <p className="text-[11px] text-white/75 font-light leading-relaxed mt-1">
                      {v.id === 'sunset-pool-villa'
                        ? 'Couples seeking iconic open-ocean sunset views & infinity pool seclusion.'
                        : v.id === 'ocean-lagoon-villa'
                        ? 'Morning sunrise lovers & marine enthusiasts exploring the inner reef.'
                        : v.id === 'beach-reserve-residence'
                        ? 'Families & guests who prefer barefoot white powder sand & palm shade.'
                        : 'Private delegations & families demanding island-tip compound exclusivity.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
