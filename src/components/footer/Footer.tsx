import { veloraResort } from '../../data/resortConfig';
import { ArrowUp, Sparkles, ArrowRight } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenConcierge: () => void;
  onOpenCompareVillas?: () => void;
  onOpenDining?: () => void;
  onOpenWellness?: () => void;
  onOpenExperiences?: () => void;
  onOpenGettingHere?: () => void;
  onOpenPracticalInfo?: () => void;
}

export function Footer({
  onOpenBooking,
  onOpenConcierge,
  onOpenCompareVillas,
  onOpenDining,
  onOpenWellness,
  onOpenExperiences,
  onOpenGettingHere,
  onOpenPracticalInfo,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#02050a] text-[#ece6dc] pt-20 sm:pt-28 pb-16 border-t border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,40,70,0.15),_transparent_70%)] pointer-events-none" />

      <div className="editorial-container relative z-10">
        <div className="editorial-grid-12 items-start pb-16 border-b border-white/10">
          {/* Left 6 Columns: Brand Line & Heritage */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <span className="font-editorial text-2xl sm:text-3xl text-white tracking-[0.2em] font-normal">
                {veloraResort.brandName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfcaa3]" />
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium">
                PRIVATE ISLAND
              </span>
            </div>

            <p className="font-editorial text-xl sm:text-2xl text-[#dfcaa3] font-light italic max-w-md">
              &ldquo;{veloraResort.tagline}&rdquo;
            </p>

            <p className="font-sans text-xs text-white/60 font-light max-w-sm leading-relaxed">
              Twenty-four architectural residences in Noonu Atoll, Maldives. Where space, privacy, and undisturbed ocean horizons define every stay.
            </p>
          </div>

          {/* Right 6 Columns: Actions & Navigation Links */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8 lg:pl-12 text-left">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenBooking}
                data-cursor="REQUEST"
                className="px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-[0_0_24px_rgba(223,202,163,0.2)] hover:scale-105 active:scale-95 text-center"
              >
                REQUEST YOUR STAY
              </button>

              <button
                onClick={onOpenConcierge}
                data-cursor="CONCIERGE"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/20 hover:border-[#dfcaa3] text-white hover:text-[#dfcaa3] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#dfcaa3]" />
                <span>PRIVATE CONCIERGE ✦</span>
              </button>
            </div>

            {/* Editorial Navigation Groups */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-left">
              {/* THE ISLAND */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                  THE ISLAND
                </span>
                <ul className="space-y-2 text-xs font-sans font-light text-white/70">
                  <li>
                    <a href="#island" className="hover:text-[#dfcaa3] transition-colors">THE ISLAND</a>
                  </li>
                  <li>
                    {onOpenGettingHere ? (
                      <button onClick={onOpenGettingHere} className="hover:text-[#dfcaa3] transition-colors text-left">
                        GETTING HERE
                      </button>
                    ) : (
                      <a href="#getting-here" className="hover:text-[#dfcaa3] transition-colors">GETTING HERE</a>
                    )}
                  </li>
                  <li>
                    {onOpenPracticalInfo ? (
                      <button onClick={onOpenPracticalInfo} className="hover:text-[#dfcaa3] transition-colors text-left">
                        PRACTICAL INFO
                      </button>
                    ) : (
                      <span className="text-white/40">PRACTICAL INFO</span>
                    )}
                  </li>
                </ul>
              </div>

              {/* STAY */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                  STAY
                </span>
                <ul className="space-y-2 text-xs font-sans font-light text-white/70">
                  <li>
                    <a href="#stay" className="hover:text-[#dfcaa3] transition-colors">VILLAS</a>
                  </li>
                  <li>
                    {onOpenCompareVillas && (
                      <button onClick={onOpenCompareVillas} className="hover:text-[#dfcaa3] transition-colors text-left">
                        COMPARE VILLAS
                      </button>
                    )}
                  </li>
                </ul>
              </div>

              {/* ISLAND LIFE */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                  ISLAND LIFE
                </span>
                <ul className="space-y-2 text-xs font-sans font-light text-white/70">
                  <li>
                    {onOpenDining ? (
                      <button onClick={onOpenDining} className="hover:text-[#dfcaa3] transition-colors text-left">
                        DINING
                      </button>
                    ) : (
                      <a href="#island-life" className="hover:text-[#dfcaa3] transition-colors">DINING</a>
                    )}
                  </li>
                  <li>
                    {onOpenExperiences ? (
                      <button onClick={onOpenExperiences} className="hover:text-[#dfcaa3] transition-colors text-left">
                        EXPERIENCES
                      </button>
                    ) : (
                      <a href="#island-life" className="hover:text-[#dfcaa3] transition-colors">EXPERIENCES</a>
                    )}
                  </li>
                  <li>
                    {onOpenWellness ? (
                      <button onClick={onOpenWellness} className="hover:text-[#dfcaa3] transition-colors text-left">
                        WELLNESS
                      </button>
                    ) : (
                      <a href="#island-life" className="hover:text-[#dfcaa3] transition-colors">WELLNESS</a>
                    )}
                  </li>
                  <li>
                    <a href="#day" className="hover:text-[#dfcaa3] transition-colors">A DAY AT VELORA</a>
                  </li>
                </ul>
              </div>

              {/* DISCOVER */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                  DISCOVER
                </span>
                <ul className="space-y-2 text-xs font-sans font-light text-white/70">
                  <li>
                    <a href="#discover" className="hover:text-[#dfcaa3] transition-colors">PHOTOGRAPHY</a>
                  </li>
                </ul>
              </div>

              {/* SERVICE */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans font-medium block">
                  SERVICE
                </span>
                <ul className="space-y-2 text-xs font-sans font-light text-white/70">
                  <li>
                    <button onClick={onOpenConcierge} className="hover:text-[#dfcaa3] transition-colors text-left">
                      PRIVATE CONCIERGE
                    </button>
                  </li>
                  <li>
                    <button onClick={onOpenBooking} className="hover:text-[#dfcaa3] transition-colors text-left">
                      REQUEST YOUR STAY
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Sub-Footer Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/45 font-light">
          <div className="flex items-center gap-4 text-[11px] font-mono tracking-wider">
            <span>NOONU ATOLL · MALDIVES</span>
            <span>·</span>
            <span>INDIAN OCEAN</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] text-white/40">
              © {new Date().getFullYear()} VELORA PRIVATE ISLAND
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
              aria-label="Back to top"
            >
              <span>TOP</span>
              <ArrowUp className="w-3 h-3 text-[#dfcaa3]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
