import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, Sparkles, X, HelpCircle } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PracticalInfoViewProps {
  onClose: () => void;
  onAskConcierge: (prompt: string) => void;
  onRequestStay: () => void;
}

export function PracticalInfoView({
  onClose,
  onAskConcierge,
  onRequestStay,
}: PracticalInfoViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, true, { autoFocusFirst: true });

  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const faqs = [
    {
      q: 'What are the check-in and check-out times?',
      a: 'Official check-in is at 15:00 and check-out is at 12:00. Depending on seaplane arrivals and departures, transit timing and hospitality arrangements are coordinated so your island experience remains unhurried from touchdown to departure.',
    },
    {
      q: 'How does the seaplane transfer operate?',
      a: 'Guests arrive via an approximate 45-minute scenic seaplane journey from Velana International Airport in Malé (MLE). Seaplane transfers operate during daylight hours. Seaplane timing would be planned around the international flight schedule.',
    },
    {
      q: 'Are children welcome at Velora?',
      a: 'Yes. Our Beach Reserve Residence and The Velora Estate are exceptionally well-suited for families, offering extensive private shoreline and fenced garden compounds. For overwater villas, families traveling with young children receive a comprehensive safety orientation upon arrival.',
    },
    {
      q: 'Can the resort accommodate specific dietary requirements?',
      a: 'Absolutely. Culinary preferences and dietary requirements can be shared during stay planning. Dining arrangements seamlessly accommodate Halal, Kosher-friendly, vegan, celiac/gluten-free, and any personal allergy requirements across all dining sanctuaries.',
    },
    {
      q: 'What is the climate and best season to visit Noonu Atoll?',
      a: 'The Maldives enjoys tropical warmth year-round (28°C to 31°C). The dry Northeast Monsoon (December to April) brings calm turquoise seas and clear skies. The Southwest Monsoon (May to November) brings occasional refreshing tropical showers and active marine life across the atoll channels.',
    },
    {
      q: 'What should we pack for our stay?',
      a: 'Velora operates on a barefoot luxury philosophy. Lightweight linen, resort wear, swimwear, and sun protection (hats and UV rash guards) are ideal. In support of reef health, we ask guests to use only reef-safe sunscreen, which is also provided with our compliments in each villa.',
    },
    {
      q: 'What scuba diving experience is required?',
      a: 'Our house reef accommodates snorkelers and divers of all levels. Certified divers may be asked to provide relevant certification for advanced outer-channel dive activities. Introductory lagoon orientation can be considered before outer-reef activities.',
    },
    {
      q: 'How does the Stay Request process work?',
      a: 'As Velora is an exclusive private island concept, your stay preferences are prepared together for review. We preserve your preferred dates, villa selection, and guest details to prepare your stay arrangements.',
    },
  ];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Practical Information - Velora Private Island"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="practical-info-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            Practical Information
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskConcierge('I have a practical question about traveling to Velora.')}
            data-cursor="CONCIERGE"
            data-focus-id="practical-info-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={onRequestStay}
            data-focus-id="practical-info-request"
            className="px-5 py-2 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-colors"
          >
            REQUEST YOUR STAY
          </button>

          <button
            onClick={onClose}
            data-focus-id="practical-info-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close practical information"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-12 sm:space-y-16">
        <div className="border-b border-white/10 pb-6 text-left space-y-2">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
            GUEST SERVICES & TRAVEL GUIDANCE
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-white font-light">
            Practical Information
          </h1>
          <p className="font-sans text-xs sm:text-sm text-white/70 max-w-2xl font-light">
            Everything you need to know about traveling to Noonu Atoll, island customs, packing, diving, and bespoke reservations.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl divide-y divide-white/10 text-left mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left group"
                >
                  <span className="font-editorial text-xl sm:text-2xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#dfcaa3] transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light mt-3 pr-6 animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge Help Banner */}
        <div className="p-8 rounded-2xl bg-[#06101c] border border-white/10 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
          <HelpCircle className="w-6 h-6 text-[#dfcaa3] mx-auto" />
          <h2 className="font-editorial text-2xl text-white font-normal">
            Have a question not listed here?
          </h2>
          <p className="font-sans text-xs text-white/70 max-w-md mx-auto font-light">
            Our digital Private Concierge is available at any time to answer resort questions, compare villas, and assist with custom requirements.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onAskConcierge('I have a question about staying at Velora.')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-xs uppercase tracking-[0.2em] font-sans transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Private Concierge ✦</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
