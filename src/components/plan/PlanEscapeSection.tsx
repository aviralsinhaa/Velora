import { RESORT_MEDIA } from '../../data/mediaAssets';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PlanEscapeSectionProps {
  onOpenConcierge: (prompt?: string) => void;
  onOpenBooking: () => void;
}

export function PlanEscapeSection({ onOpenConcierge, onOpenBooking }: PlanEscapeSectionProps) {
  return (
    <section
      id="plan"
      className="relative w-full py-24 sm:py-32 lg:py-44 bg-[#03060d] text-[#ece6dc] overflow-hidden border-t border-white/10"
    >
      {/* Subtle Atmospheric Water Light Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute inset-0 bg-cover bg-center filter saturate-50 scale-105"
          style={{
            backgroundImage: `url(${RESORT_MEDIA.textures.ambientLagoon})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060d] via-[#03060d]/80 to-[#03060d]" />
      </div>

      <div className="editorial-container relative z-10">
        <div className="editorial-grid-12 items-center">
          {/* Columns 1-5: Chapter Masthead & Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#c4a97d]" />
              <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium">
                CHAPTER 08 · PRIVATE CONCIERGE
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-[1.12] tracking-tight">
              What would you like the island to become?
            </h2>

            <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light max-w-md">
              Describe how you wish to spend your days. Velora’s private concierge understands your rhythms, compares architectural sanctuaries, and designs custom stays in real time.
            </p>

            {/* Structured CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => onOpenConcierge()}
                data-cursor="CONCIERGE"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] font-sans text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-[0_0_24px_rgba(223,202,163,0.25)] hover:scale-105 active:scale-95 text-center"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>OPEN PRIVATE CONCIERGE ✦</span>
              </button>

              <button
                onClick={onOpenBooking}
                data-cursor="REQUEST"
                className="editorial-link py-2 sm:py-0 self-center sm:self-auto text-center"
              >
                <span>REQUEST YOUR STAY</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#dfcaa3]" />
              </button>
            </div>
          </div>

          {/* Columns 7-12 (lg:col-start-7 lg:col-span-6): Product Preview of Private Concierge */}
          <div className="lg:col-start-7 lg:col-span-6 mt-8 lg:mt-0">
            <div className="relative rounded-2xl border border-white/10 bg-[#06101c]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Product Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs uppercase tracking-[0.26em] font-sans font-medium text-white flex items-center gap-1.5">
                    <span>VELORA</span>
                    <span className="text-[#dfcaa3]">✦</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans">
                    CONCIERGE PREVIEW
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#dfcaa3] tracking-widest uppercase">
                  ACTIVE CANVAS
                </span>
              </div>

              {/* Sample Intelligent Dialogue Transcript */}
              <div className="space-y-5 text-left">
                {/* User Turn */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-white/40 block">
                    YOU
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-[#f0e2c8] font-light pl-3 border-l border-[#dfcaa3]/50">
                    &ldquo;We have five nights in December. Somewhere private with sunset views.&rdquo;
                  </p>
                </div>

                {/* Velora Concierge Turn */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.24em] font-sans text-[#dfcaa3] block font-medium">
                    VELORA ✦
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                    For the two of you, I would begin with the Sunset Pool Villa. Its west-facing orientation gives you unobstructed golden hour views directly from your private 16-metre infinity pool.
                  </p>

                  {/* Villa Thumbnail Card */}
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#04080f]/80 flex flex-col sm:flex-row items-center gap-4 p-3">
                    <img
                      src={RESORT_MEDIA.villas.sunsetPoolVilla.hero}
                      alt="Sunset Pool Villa"
                      className="w-full sm:w-28 h-20 object-cover rounded-lg velora-image-grade shrink-0"
                      loading="lazy"
                    />
                    <div className="space-y-1 flex-1 text-left w-full sm:w-auto">
                      <span className="text-[8.5px] uppercase tracking-[0.22em] text-[#dfcaa3] font-sans block">
                        OVERWATER SANCTUARY
                      </span>
                      <p className="font-editorial text-base text-white font-normal">
                        Sunset Pool Villa
                      </p>
                      <p className="text-[11px] font-mono text-white/60">
                        280 m² · West-facing · $2,450 / night
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Launch CTA Button */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => onOpenConcierge('Plan five nights for two with sunset views in December.')}
                  className="w-full py-2.5 rounded-lg border border-[#c4a97d]/30 hover:border-[#dfcaa3] bg-[#c4a97d]/5 hover:bg-[#c4a97d]/15 text-[#dfcaa3] text-[10.5px] uppercase tracking-[0.22em] font-sans transition-all text-center block"
                >
                  START CONCIERGE SESSION →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
