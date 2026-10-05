import { useEffect, useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ArrowLeft, Plane, Clock, ShieldCheck, Sparkles, X, Luggage } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface GettingHereDestinationViewProps {
  onClose: () => void;
  onAskConcierge: (prompt: string) => void;
  onRequestStay: () => void;
}

export function GettingHereDestinationView({
  onClose,
  onAskConcierge,
  onRequestStay,
}: GettingHereDestinationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, true, { autoFocusFirst: true });

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

  const journeySteps = [
    {
      step: '01',
      title: 'Arrival in Malé (MLE)',
      subtitle: 'Velana International Airport',
      desc: 'The concept assumes an approximately 45-minute seaplane connection from Velana International Airport in Malé northbound to Noonu Atoll.',
    },
    {
      step: '02',
      title: 'Seaplane Departure Terminal',
      subtitle: 'Transfer Planning & Comfort',
      desc: 'Terminal facilities provide comfortable seating while onward seaplane departures are scheduled.',
    },
    {
      step: '03',
      title: '45-Minute Scenic Seaplane',
      subtitle: 'Flight Across Northern Ring-Atolls',
      desc: 'Embark on a breathtaking 45-minute aerial seaplane journey northbound. Fly over endless turquoise lagoons, sand cays, and pristine coral atolls before descending toward Noonu Atoll.',
    },
    {
      step: '04',
      title: 'Arrival at Velora Pontoon',
      subtitle: 'Outer Lagoon Welcome',
      desc: 'Your seaplane lands gently on the calm outer lagoon pontoon. The arrival concept transitions from the outer-lagoon pontoon toward the villa areas.',
    },
  ];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Getting Here - Velora Private Island"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="getting-here-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            Getting Here
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskConcierge('How does the seaplane transfer to Velora work?')}
            data-cursor="CONCIERGE"
            data-focus-id="getting-here-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={onRequestStay}
            data-focus-id="getting-here-request"
            className="px-5 py-2 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all"
          >
            REQUEST YOUR STAY
          </button>

          <button
            onClick={onClose}
            data-focus-id="getting-here-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close getting here destination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-16 sm:space-y-24">
        {/* Hero */}
        <section className="space-y-6 text-left">
          <div className="border-b border-white/10 pb-6">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block mb-2">
              SEAPLANE LOGISTICS & ARRIVAL
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl text-white font-light tracking-wide">
              The Journey to Noonu Atoll
            </h1>
            <p className="font-sans text-xs sm:text-base text-white/70 max-w-2xl font-light mt-3 leading-relaxed">
              Arriving at Velora is an effortless, scenic transition. From the moment you land at Malé to your arrival on our quiet outer lagoon pontoon, every detail is seamlessly curated.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] sm:aspect-[21/9] w-full shadow-2xl bg-[#06101c]">
            <img
              src={RESORT_MEDIA.arrival.seaplaneLagoon}
              alt="Seaplane flight over Maldivian coral atolls"
              loading="lazy"
              className="w-full h-full object-cover velora-image-grade"
            />
          </div>
        </section>

        {/* 4-Step Journey Sequence */}
        <section className="space-y-10">
          <div className="text-left space-y-2 border-b border-white/10 pb-4">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans block">
              SEAMLESS TRANSIT SEQUENCE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white font-light">
              From Malé to Your Villa Deck
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-2xl bg-[#06101c] border border-white/10 space-y-3 text-left shadow-lg"
              >
                <span className="font-mono text-xl text-[#dfcaa3] block font-light">
                  {step.step}
                </span>
                <h3 className="font-editorial text-xl text-white font-normal">
                  {step.title}
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-sans block">
                  {step.subtitle}
                </span>
                <p className="font-sans text-xs text-white/70 leading-relaxed font-light pt-1">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Practical Baggage & Timing Guidelines */}
        <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-6">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#dfcaa3] font-sans font-medium block">
            PRACTICAL TRAVEL GUIDANCE
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-sans font-light">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-normal">
                <Luggage className="w-4 h-4 text-[#dfcaa3]" />
                <span>Baggage Guidelines</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Baggage limits depend on the operating transfer carrier and will be confirmed alongside your arrival schedule.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-normal">
                <Clock className="w-4 h-4 text-[#dfcaa3]" />
                <span>Daylight Flight Window</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Seaplanes operate during daylight hours. Seaplane timing would be planned around the international flight schedule into Malé.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-normal">
                <ShieldCheck className="w-4 h-4 text-[#dfcaa3]" />
                <span>Departure Coordination</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Departure transfer timing would be planned around your international flight departure timing from Velana International Airport (MLE).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
