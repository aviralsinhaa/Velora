import { useEffect } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ConciergeSourceContext } from '../../data/resortContext';
import { ArrowLeft, Clock, MapPin, Utensils, Sparkles, X } from 'lucide-react';

interface DiningDestinationViewProps {
  onClose: () => void;
  onAskConcierge: (prompt: string, context?: ConciergeSourceContext) => void;
  onRequestStay: (notes?: string) => void;
}

export function DiningDestinationView({
  onClose,
  onAskConcierge,
  onRequestStay,
}: DiningDestinationViewProps) {
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

  const venues = veloraResort.dining;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dining at Velora"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="dining-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            Dining
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onAskConcierge('What dining experiences would you recommend for our stay?', {
                type: 'dining',
                id: 'dining-general',
              })
            }
            data-cursor="CONCIERGE"
            data-focus-id="dining-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={() => onRequestStay('Interested in dining arrangements at Velora')}
            data-focus-id="dining-request"
            className="px-5 py-2 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all"
          >
            REQUEST YOUR STAY
          </button>

          <button
            onClick={onClose}
            data-focus-id="dining-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close dining destination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-16 sm:space-y-24">
        {/* Environmental Hero */}
        <section className="space-y-6 text-left">
          <div className="border-b border-white/10 pb-6">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block mb-2">
              CULINARY ECOSYSTEM · NOONU ATOLL
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white font-light tracking-wide">
              Dining at Velora
            </h1>
            <p className="font-sans text-xs sm:text-base text-white/70 max-w-2xl font-light mt-3 leading-relaxed">
              Four distinct culinary sanctuaries where the rhythm of the ocean shapes every course: AURA, EMBER, TIDE, and private lantern-lit sandbank dining.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] sm:aspect-[21/9] w-full shadow-2xl bg-[#06101c]">
            <img
              src={RESORT_MEDIA.dining.aura.hero}
              alt="Dining pavilion over turquoise lagoon"
              loading="lazy"
              className="w-full h-full object-cover velora-image-grade"
            />
          </div>
        </section>

        {/* Venues Sequence */}
        <section className="space-y-20 sm:space-y-28">
          {venues.map((venue, idx) => (
            <article
              key={venue.id}
              className={`editorial-grid-12 gap-8 lg:gap-14 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Media Column (7 Cols) */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-2xl group">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Details Column (5 Cols) */}
              <div className={`lg:col-span-5 space-y-6 text-left ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block">
                    0{idx + 1} · {venue.cuisine.toUpperCase()}
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light">
                    {venue.name}
                  </h2>
                  <p className="font-editorial text-lg text-white/80 italic font-light">
                    &ldquo;{venue.tagline}&rdquo;
                  </p>
                </div>

                <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  {venue.description}
                </p>

                {/* Practical Details */}
                <div className="py-4 border-y border-white/10 space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{venue.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{venue.setting}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-[11px]">
                    <Utensils className="w-3.5 h-3.5 text-white/40" />
                    <span>Attire: {venue.dressCode}</span>
                  </div>
                </div>

                {/* Thematic Courses */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 font-sans block">
                    SAMPLE THEMATIC DISHES
                  </span>
                  <ul className="space-y-1.5 text-xs font-sans text-white/75 font-light">
                    {(venue.menuHighlights || []).map((dish, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#dfcaa3]">✦</span>
                        <span>{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() =>
                      onAskConcierge(`Tell me about dining at ${venue.name}. What should we reserve?`, {
                        type: 'dining',
                        id: venue.id,
                      })
                    }
                    data-focus-id={`dining-venue-concierge-${venue.id}`}
                    className="editorial-link text-xs uppercase tracking-[0.2em]"
                  >
                    <span>Ask Concierge About {venue.name} ✦</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
