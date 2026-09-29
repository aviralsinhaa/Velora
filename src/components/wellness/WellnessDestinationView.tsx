import { useEffect } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ConciergeSourceContext } from '../../data/resortContext';
import { ArrowLeft, Clock, Sparkles, X, Heart } from 'lucide-react';

interface WellnessDestinationViewProps {
  onClose: () => void;
  onAskConcierge: (prompt: string, context?: ConciergeSourceContext) => void;
  onRequestStay: (notes?: string) => void;
}

export function WellnessDestinationView({
  onClose,
  onAskConcierge,
  onRequestStay,
}: WellnessDestinationViewProps) {
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

  const rituals = veloraResort.wellness.rituals.map((r) => ({
    id: r.id,
    title: r.title,
    duration: r.duration,
    focus: r.focus,
    desc: r.description,
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wellness at Velora"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="wellness-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            The Water Pavilion
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onAskConcierge('Tell me about the wellness rituals and acoustic meditation at Velora.', {
                type: 'wellness',
                id: 'water-pavilion',
              })
            }
            data-cursor="CONCIERGE"
            data-focus-id="wellness-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={() => onRequestStay('Interested in wellness retreats & acoustic meditation')}
            data-focus-id="wellness-request"
            className="px-5 py-2 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all"
          >
            REQUEST YOUR STAY
          </button>

          <button
            onClick={onClose}
            data-focus-id="wellness-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close wellness destination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-16 sm:space-y-24">
        {/* Editorial Split Opening: 5 Cols Text | 7 Cols Image */}
        <section className="editorial-grid-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              RESTORATION & WATER
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl text-white font-light tracking-wide leading-tight">
              The Water Pavilion
            </h1>
            <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light">
              Suspended above the quietest lagoon shallows of Noonu Atoll, our wellness sanctuary is designed around natural elements: gentle ocean breeze, timber acoustics, and the deep restorative power of marine stillness.
            </p>

            {/* Spatial Facilities List */}
            <div className="pt-4 border-t border-white/10 space-y-3 text-xs font-sans">
              <span className="text-[9px] uppercase tracking-[0.24em] text-white/40 block">
                SPATIAL FACILITIES
              </span>
              <ul className="space-y-2 text-white/80 font-light">
                <li className="flex items-center gap-2">
                  <span className="text-[#dfcaa3]">✦</span>
                  <span>Three overwater treatment pavilions with glass-floor coral viewing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#dfcaa3]">✦</span>
                  <span>Open-air teak movement deck suspended directly over the reef</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#dfcaa3]">✦</span>
                  <span>Finnish cedarwood ocean sauna and chilled seawater plunge pool</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  onAskConcierge('Plan a five-night restorative wellness itinerary for two', {
                    type: 'wellness',
                    id: 'water-pavilion',
                  })
                }
                className="editorial-link text-xs uppercase tracking-[0.2em]"
              >
                <span>Curate a Wellness Itinerary with Concierge ✦</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] sm:aspect-[4/3] w-full shadow-2xl">
              <img
                src={RESORT_MEDIA.wellness.waterPavilion}
                alt="The Water Pavilion at Velora"
                loading="lazy"
                className="w-full h-full object-cover velora-image-grade"
              />
            </div>
          </div>
        </section>

        {/* Rituals & Treatments List */}
        <section className="space-y-10 border-t border-white/10 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                SIGNATURE RITUALS
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white font-light">
                Rituals of Water & Sound
              </h2>
            </div>
            <p className="font-sans text-xs text-white/50 max-w-md font-light">
              Every therapy begins with a cold botanical foot bath and fragrant island sea salt scrub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rituals.map((r, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-[#06101c] border border-white/10 space-y-4 text-left hover:border-[#dfcaa3]/50 transition-colors shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium">
                    0{i + 1} · {r.focus.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-white/50">
                    <Clock className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{r.duration}</span>
                  </div>
                </div>

                <h3 className="font-editorial text-2xl text-white font-normal">
                  {r.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  {r.desc}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      onAskConcierge(
                        `Tell me about the ${r.title} at The Water Pavilion. Can we do this in the afternoon?`,
                        {
                          type: 'wellness',
                          id: r.id,
                        }
                      )
                    }
                    data-focus-id={`wellness-ritual-concierge-${r.id}`}
                    className="text-[11px] uppercase tracking-[0.2em] text-[#dfcaa3] hover:text-white transition-colors font-sans"
                  >
                    Include in Stay ✦
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
