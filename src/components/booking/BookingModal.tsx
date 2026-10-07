import { useState, useEffect, useRef } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { X, Calendar, Users, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface BookingModalProps {
  isOpen: boolean;
  initialVillaId?: string;
  initialNights?: number;
  initialGuests?: number;
  initialNotes?: string;
  onClose: () => void;
  onOpenConcierge: (prompt: string, selectedVillaId?: string) => void;
}

export function BookingModal({
  isOpen,
  initialVillaId,
  initialNights = 5,
  initialGuests = 2,
  initialNotes,
  onClose,
  onOpenConcierge,
}: BookingModalProps) {
  const [selectedVillaId, setSelectedVillaId] = useState<string | undefined>(
    initialVillaId
  );
  const [nights, setNights] = useState<number>(initialNights || 5);
  const [guestCount, setGuestCount] = useState<number>(initialGuests || 2);
  const [villaError, setVillaError] = useState<string | null>(null);

  // Dynamic future date default (14 days from today)
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultFutureDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState(defaultFutureDate);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalContainerRef, isOpen, { autoFocusFirst: true });

  // Task 3: Comprehensive Reset on Open to prevent stale state from previous sessions
  useEffect(() => {
    if (isOpen) {
      setSelectedVillaId(initialVillaId ?? undefined);
      setNights(initialNights || 5);
      setGuestCount(initialGuests || 2);
      setNotes(initialNotes || '');
      const dynamicFuture = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      setCheckInDate(dynamicFuture);
      setGuestName('');
      setGuestEmail('');
      setVillaError(null);
      setIsSubmitted(false);
    }
  }, [isOpen, initialVillaId, initialNights, initialGuests, initialNotes]);

  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Escape key listener, body scroll lock & focus restoration
  useEffect(() => {
    if (!isOpen) return;
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (
        lastActiveElementRef.current &&
        document.body.contains(lastActiveElementRef.current) &&
        typeof lastActiveElementRef.current.focus === 'function'
      ) {
        lastActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  const selectedVilla = selectedVillaId
    ? veloraResort.villas.find((v) => v.id === selectedVillaId) ?? null
    : null;

  const totalCost = selectedVilla ? selectedVilla.pricePerNight * nights : 0;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVillaId) {
      setVillaError('Please select a villa.');
      return;
    }
    setVillaError(null);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setVillaError(null);
    setGuestName('');
    setGuestEmail('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Request Your Stay"
      className="fixed inset-0 z-[160] overflow-hidden"
    >
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .velora-drawer-in { animation: drawerSlideIn 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .velora-backdrop-in { animation: backdropFadeIn 280ms ease-out forwards; }
      `}</style>

      {/* Dismissable Backdrop Overlay */}
      <div
        onClick={handleReset}
        aria-hidden="true"
        className="velora-backdrop-in fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
      />

      {/* Right-Side Stay Request Panel */}
      <aside
        className="velora-drawer-in fixed top-0 right-0 bottom-0 z-10 w-full sm:w-[540px] md:w-[600px] max-w-full h-[100dvh] max-h-[100dvh] bg-[#04080f] border-l border-white/10 shadow-[-24px_0_80px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-y-auto text-[#ece6dc] p-6 sm:p-8 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block mb-1">
                REQUEST YOUR STAY
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white font-normal">
                {isSubmitted ? 'Stay Request Prepared' : 'Request Your Stay'}
              </h3>
            </div>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-full border border-white/15 hover:border-white text-white/60 hover:text-white transition-colors focus:outline-none"
              aria-label="Close stay request drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SUBMITTED STATE (Truthful prepared request state) */}
          {isSubmitted ? (
            <div className="space-y-6 text-center py-8 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#dfcaa3]/20 border border-[#dfcaa3] text-[#dfcaa3] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#dfcaa3] font-sans">
                  STAY PREFERENCES PREPARED
                </span>
                <h4 className="font-editorial text-2xl sm:text-3xl text-white font-light">
                  YOUR STAY REQUEST IS READY
                </h4>
                <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  Your stay preferences are prepared together for review. Availability would be confirmed before any stay is finalized.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#06101c] border border-white/10 text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-wider font-sans">VILLA</span>
                  <span className="text-white font-editorial text-sm">{selectedVilla?.name || 'Selected Sanctuary'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-wider font-sans">DATES</span>
                  <span className="text-white font-mono">{checkInDate} · {nights} Nights</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-wider font-sans">GUESTS</span>
                  <span className="text-white">{guestCount} Guests</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-white/40 uppercase tracking-wider font-sans">ESTIMATED STAY</span>
                  <span className="font-editorial text-base text-[#dfcaa3]">
                    ${totalCost.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center"
                >
                  RETURN TO VELORA
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3.5 rounded-full border border-white/20 hover:border-[#dfcaa3] text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center"
                >
                  CONTINUE EXPLORING
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: Villa & Stay Details */
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              {/* Villa Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label id="booking-villa-label" className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50 block">
                    SELECT A VILLA
                  </label>
                  {villaError && (
                    <span className="text-[11px] text-rose-300 font-sans">{villaError}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-labelledby="booking-villa-label">
                  {veloraResort.villas.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVillaId(v.id)}
                      aria-label={`Select ${v.name}, $${v.pricePerNight.toLocaleString()} per night`}
                      aria-pressed={selectedVillaId === v.id}
                      className={`p-3.5 rounded-xl border text-left transition-colors ${
                        selectedVillaId === v.id
                          ? 'border-[#dfcaa3] bg-[#dfcaa3]/10 text-white'
                          : 'border-white/10 bg-[#06101c] text-white/70 hover:border-white/25'
                      }`}
                    >
                      <span className="font-editorial text-sm block">{v.name}</span>
                      <span className="text-[10px] text-[#dfcaa3] font-mono block mt-0.5">
                        ${v.pricePerNight.toLocaleString()}/night
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Nights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="booking-arrival-date" className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50 block">
                    ARRIVAL DATE
                  </label>
                  <input
                    id="booking-arrival-date"
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    aria-label="Arrival date"
                    className="w-full bg-[#06101c] border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#dfcaa3]"
                  />
                </div>

                <div className="space-y-2">
                  <label id="booking-duration-label" className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50 block">
                    DURATION
                  </label>
                  <div className="flex gap-2" role="group" aria-labelledby="booking-duration-label">
                    {[3, 5, 7, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNights(n)}
                        aria-label={`${n} nights duration`}
                        aria-pressed={nights === n}
                        className={`flex-1 py-3 rounded-xl border text-xs font-mono transition-colors ${
                          nights === n
                            ? 'border-[#dfcaa3] bg-[#dfcaa3] text-[#04080f] font-medium'
                            : 'border-white/15 bg-[#06101c] text-white/70 hover:border-white/30'
                        }`}
                      >
                        {n}N
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <label id="booking-party-label" className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50 block">
                  PARTY SIZE
                </label>
                <div className="flex gap-2" role="group" aria-labelledby="booking-party-label">
                  {[1, 2, 4, 8].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuestCount(g)}
                      aria-label={g === 1 ? 'Solo guest' : g === 2 ? 'Couple (2 guests)' : `${g} guests`}
                      aria-pressed={guestCount === g}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-sans transition-colors ${
                        guestCount === g
                          ? 'border-[#dfcaa3] bg-[#dfcaa3] text-[#04080f] font-medium'
                          : 'border-white/15 bg-[#06101c] text-white/70 hover:border-white/30'
                      }`}
                    >
                      {g === 1 ? 'Solo' : g === 2 ? '2 (Couple)' : `${g} Guests`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/50 block">
                  GUEST DETAILS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    id="booking-guest-name"
                    type="text"
                    placeholder="Full Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    aria-label="Full Name"
                    className="w-full bg-[#06101c] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#dfcaa3] placeholder:text-white/45"
                  />
                  <input
                    id="booking-guest-email"
                    type="email"
                    placeholder="Email Address"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    aria-label="Email Address"
                    className="w-full bg-[#06101c] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#dfcaa3] placeholder:text-white/45"
                  />
                </div>
                <textarea
                  id="booking-special-requests"
                  placeholder="Special requests, dietary preferences, or arrival notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  aria-label="Special requests, dietary preferences, or arrival notes"
                  className="w-full bg-[#06101c] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#dfcaa3] placeholder:text-white/45 resize-none font-light"
                />
              </div>

              {/* Cost Calculation Bar */}
              {selectedVilla ? (
                <div className="p-4 rounded-xl bg-[#06101c] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                      ESTIMATED TOTAL
                    </span>
                    <span className="font-editorial text-2xl text-white">
                      ${totalCost.toLocaleString()}{' '}
                      <span className="text-xs font-sans text-white/50 font-light">USD</span>
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-white/45 font-sans">
                    <span>${selectedVilla.pricePerNight.toLocaleString()} × {nights} nights</span>
                    <br />
                    <span>Includes daily artisanal breakfast</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#06101c] border border-white/10 text-center text-xs text-white/50 font-light">
                  Select a villa above to calculate estimated stay total
                </div>
              )}

              {/* Concierge Consultation Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-[#c4a97d]/20 bg-[#c4a97d]/5">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#dfcaa3] shrink-0" />
                  <span className="text-[11px] text-white/80 font-light">
                    Need guidance tailoring this stay or experiences?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenConcierge(
                      selectedVilla
                        ? `I am considering ${nights} nights at the ${selectedVilla.name} for ${guestCount} guests. Can you guide me through our options?`
                        : 'Can you help guide me through selecting a sanctuary and planning our stay?',
                      selectedVillaId
                    )
                  }
                  className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#dfcaa3] hover:text-[#f0e2c8] transition-colors shrink-0 font-medium text-left sm:text-right"
                >
                  CONSULT CONCIERGE →
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-[background-color,color,transform,box-shadow] duration-300 shadow-[0_0_24px_rgba(223,202,163,0.25)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{selectedVillaId ? 'REQUEST THIS VILLA' : 'REQUEST YOUR STAY'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-white/40 text-[10px] font-sans">
          <ShieldCheck className="w-3.5 h-3.5 text-[#dfcaa3]" />
          <span>Your selections remain in this concept stay request until you return to the island experience.</span>
        </div>
      </aside>
    </div>
  );
}
