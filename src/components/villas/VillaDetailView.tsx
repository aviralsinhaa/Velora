import { useEffect } from 'react';
import { Villa } from '../../types';
import { ArrowLeft, Compass, Check, Sparkles, X } from 'lucide-react';

interface VillaDetailViewProps {
  villa: Villa;
  onClose: () => void;
  onRequestStay: (villaId: string, sourceFocusId?: string) => void;
  onOpen360: (sceneId: string, sourceFocusId?: string) => void;
  onAskConcierge: (prompt: string, contextVillaId: string, sourceFocusId?: string) => void;
  onCompareVillas: () => void;
  onSelectOtherVilla: (villaId: string) => void;
  allVillas: Villa[];
}

export function VillaDetailView({
  villa,
  onClose,
  onRequestStay,
  onOpen360,
  onAskConcierge,
  onCompareVillas,
  onSelectOtherVilla,
  allVillas,
}: VillaDetailViewProps) {
  // Lock body scroll while deep view is open and handle Escape key
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

  // Derived architectural specifications
  const isOverwater = villa.category === 'overwater';
  const poolType = isOverwater
    ? villa.id === 'sunset-pool-villa'
      ? '16m Private Saltwater Infinity Pool'
      : 'Private Freshwater Lagoon Plunge Pool'
    : villa.id === 'beach-reserve-residence'
    ? 'Private Courtyard Plunge Pool & Outdoor Stone Bath'
    : 'Dual 25m Lagoon Infinity Pools & Spa Cabana';

  const waterAccess = isOverwater
    ? villa.id === 'sunset-pool-villa'
      ? 'Submerged reef ladder directly into outer lagoon'
      : 'Direct stairs down to calm lagoon reef waters'
    : villa.id === 'beach-reserve-residence'
    ? '50 metres of private powder-white beach'
    : 'Private beach perimeter & private boat mooring';

  const bestForText =
    villa.id === 'sunset-pool-villa'
      ? 'Couples seeking unobstructed Maldivian sunset views, private infinity pool seclusion, and evening golden hour.'
      : villa.id === 'ocean-lagoon-villa'
      ? 'Gentle dawn awakening, morning snorkeling over calm coral shallows, and tranquil east-facing tides.'
      : villa.id === 'beach-reserve-residence'
      ? 'Families and travelers who value barefoot shoreline living sheltered by mature banyan and coconut palms.'
      : 'Multigenerational families, private delegations, and guests seeking complete island-tip autonomy and tailored in-villa dining.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${villa.name} Details`}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Top Architectural Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="villa-detail-back"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-base sm:text-xl text-white tracking-wide truncate max-w-[110px] min-[400px]:max-w-[160px] sm:max-w-none">
            {villa.name}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onAskConcierge(`Tell me more about the ${villa.name}. Is it right for us?`, villa.id, 'villa-detail-concierge-header')}
            data-cursor="CONCIERGE"
            data-focus-id="villa-detail-concierge-header"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={() => onRequestStay(villa.id, 'villa-detail-request-header')}
            data-cursor="REQUEST"
            data-focus-id="villa-detail-request-header"
            className="px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] font-sans font-medium transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            REQUEST THIS VILLA
          </button>

          <button
            onClick={onClose}
            data-focus-id="villa-detail-close"
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            aria-label="Close villa detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="editorial-container py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block mb-2">
                0{villa.number} · {villa.subtitle.toUpperCase()}
              </span>
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-white font-light tracking-wide">
                {villa.name}
              </h1>
            </div>
            <div className="sm:text-right">
              <span className="font-mono text-2xl sm:text-3xl text-[#dfcaa3] font-light block">
                ${villa.pricePerNight.toLocaleString()}
                <span className="text-xs font-sans text-white/50 tracking-wider"> / night</span>
              </span>
              <span className="text-[11px] text-white/40 font-mono tracking-wider">
                Excludes local service & tax
              </span>
            </div>
          </div>

          {/* Primary Featured Image with 360 link */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] sm:aspect-[21/9] w-full shadow-2xl bg-[#06101c]">
            <img
              src={villa.featuredImage}
              alt={villa.name}
              className="w-full h-full object-cover velora-image-grade"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-6 flex items-end justify-between">
              <p className="font-editorial text-xl sm:text-3xl text-white italic max-w-xl font-light">
                &ldquo;{villa.tagline}&rdquo;
              </p>

              {villa.panoramaSceneId && (
                <button
                  onClick={() => onOpen360(villa.panoramaSceneId!, 'villa-detail-360')}
                  data-cursor="360°"
                  data-focus-id="villa-detail-360"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/70 hover:bg-black/95 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-sans backdrop-blur-md transition-all hover:scale-105"
                >
                  <Compass className="w-4 h-4 text-[#dfcaa3]" />
                  <span>360° Tour</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 12-Column Overview & Specifications Spread */}
        <section className="editorial-grid-12 gap-8 lg:gap-12 items-start">
          {/* Columns 1-7: Overview & Best-For Guidance */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                ARCHITECTURAL OVERVIEW
              </span>
              <p className="font-editorial text-2xl sm:text-3xl text-white font-light leading-relaxed">
                {villa.description}
              </p>
            </div>

            {/* Best-For Shopping Guidance */}
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                WHO THIS VILLA SUITS BEST
              </span>
              <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                {bestForText}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                KEY FEATURES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-white/80 font-light">
                {villa.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#dfcaa3] mt-0.5">✦</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Butler & Island Services */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                RESORT SERVICES & AMENITIES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-white/70 font-light">
                {villa.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columns 8-12: Full Specifications Table */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#06101c] border border-white/10 space-y-6 text-left shadow-xl">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block border-b border-white/10 pb-3">
                PROPERTY SPECIFICATIONS
              </span>

              <dl className="divide-y divide-white/10 text-xs font-sans space-y-3">
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Total Living Area</dt>
                  <dd className="font-editorial text-base text-white">{villa.size}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Capacity</dt>
                  <dd className="font-editorial text-base text-white">{villa.guests}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Bedrooms</dt>
                  <dd className="font-editorial text-base text-white">{villa.bedrooms}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Orientation</dt>
                  <dd className="text-right text-white font-mono text-[11px] max-w-[200px]">{villa.orientation}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Pool</dt>
                  <dd className="text-right text-white max-w-[200px]">{poolType}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Water Access</dt>
                  <dd className="text-right text-white max-w-[200px]">{waterAccess}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-white/40">Materials</dt>
                  <dd className="text-right text-white/80 max-w-[200px] text-[11px]">
                    {villa.architecturalDetails.join(', ')}
                  </dd>
                </div>
              </dl>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() => onRequestStay(villa.id, 'villa-detail-request-primary')}
                  data-cursor="REQUEST"
                  data-focus-id="villa-detail-request-primary"
                  className="w-full py-4 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.24em] font-medium transition-all shadow-lg hover:scale-[1.02] active:scale-95 text-center block"
                >
                  REQUEST THIS VILLA
                </button>

                <button
                  onClick={() => onAskConcierge(`Plan five nights for two in the ${villa.name}`, villa.id, 'villa-detail-concierge-plan')}
                  data-focus-id="villa-detail-concierge-plan"
                  className="w-full py-3.5 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 font-sans text-xs uppercase tracking-[0.2em] transition-all text-center block"
                >
                  Plan Stay with Concierge ✦
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Coherent Architectural Image Gallery */}
        <section className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                PHOTOGRAPHY
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                Inside the {villa.name}
              </h2>
            </div>
            <span className="font-mono text-xs text-white/40">
              {villa.gallery.length} Cohesive Views
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {villa.gallery.map((img, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-xl group"
              >
                <img
                  src={img}
                  alt={`${villa.name} view ${i + 1}`}
                  className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Related Villa Comparison Footer */}
        <section className="space-y-6 pt-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
                EXPLORE OTHER ACCOMMODATIONS
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                Compare with Other Sanctuaries
              </h2>
            </div>
            <button
              onClick={onCompareVillas}
              className="editorial-link text-xs uppercase tracking-[0.2em] self-start sm:self-auto"
            >
              <span>View Side-by-Side Comparison →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {allVillas
              .filter((v) => v.id !== villa.id)
              .map((other) => (
                <div
                  key={other.id}
                  onClick={() => onSelectOtherVilla(other.id)}
                  className="p-5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="aspect-[16/10] rounded-lg overflow-hidden border border-white/10 bg-[#06101c]">
                    <img
                      src={other.featuredImage}
                      alt={other.name}
                      className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans block">
                      {other.subtitle}
                    </span>
                    <h3 className="font-editorial text-xl text-white group-hover:text-[#dfcaa3] transition-colors">
                      {other.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10 text-white/60">
                    <span>{other.size} · {other.guests}</span>
                    <span className="font-mono text-[#dfcaa3]">${other.pricePerNight.toLocaleString()}/nt</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
