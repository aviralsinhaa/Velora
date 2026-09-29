import { useState, useEffect } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { ConciergeSourceContext } from '../../data/resortContext';
import { ArrowLeft, Clock, Sparkles, X, Compass, Users } from 'lucide-react';

interface ExperiencesDestinationViewProps {
  onClose: () => void;
  onAskConcierge: (prompt: string, context?: ConciergeSourceContext) => void;
  onRequestStay: (notes?: string) => void;
}

export function ExperiencesDestinationView({
  onClose,
  onAskConcierge,
  onRequestStay,
}: ExperiencesDestinationViewProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ocean' | 'private' | 'culinary'>('all');

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

  const experiencePresentation: Record<string, { suits: string; includes: string }> = {
    'house-reef-dive': {
      suits: 'Certified divers with relevant certification for outer drop-off dives. Lagoon orientation available on the house reef.',
      includes: 'Full Scubapro equipment, guided boat transfer, marine guide briefing, refreshments.',
    },
    'sunset-dhoni-cruise': {
      suits: 'Couples, families, and photography enthusiasts.',
      includes: 'Chilled champagne, artisan canapés, and scenic cruising.',
    },
    'sandbank-picnic': {
      suits: 'Couples seeking complete Robinson Crusoe luxury or private celebratory lunches.',
      includes: 'Private boat transfer, curated picnic setup, shaded linen canopy, chilled beverages.',
    },
    'private-yacht-charter': {
      suits: 'Small groups or couples wanting total open-ocean freedom across Noonu Atoll.',
      includes: 'Bespoke charter itinerary, gourmet lunch, island excursion stops, snorkeling & diving gear.',
    },
    'starlight-cinema': {
      suits: 'Couples and families looking for a magical evening under open constellations.',
      includes: 'Curated film selection, champagne, artisan popcorn and dessert tasting.',
    },
  };

  const experiences = veloraResort.experiences;

  const filtered =
    activeCategory === 'all'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Experiences at Velora"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#04080f] text-[#ece6dc] animate-fade-in"
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 w-full bg-[#04080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onClose}
            data-cursor="BACK"
            data-focus-id="experiences-back"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#dfcaa3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Island</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="font-editorial text-lg sm:text-xl text-white tracking-wide">
            Island Experiences
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onAskConcierge('What ocean and private sandbank experiences do you offer?', {
                type: 'experience',
                id: 'experience-general',
              })
            }
            data-cursor="CONCIERGE"
            data-focus-id="experiences-concierge"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#c4a97d]/40 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-[11px] uppercase tracking-[0.2em] font-sans transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>

          <button
            onClick={() => onRequestStay('Interested in private ocean expeditions & sandbank dining')}
            data-focus-id="experiences-request"
            className="px-5 py-2 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all"
          >
            REQUEST YOUR STAY
          </button>

          <button
            onClick={onClose}
            data-focus-id="experiences-close"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close experiences destination"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editorial-container py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* Intro */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#dfcaa3] font-sans font-medium block">
              CURATED ISLAND EXPEDITIONS
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl text-white font-light">
              Moments Beyond the Shore
            </h1>
            <p className="font-sans text-xs sm:text-sm text-white/70 max-w-xl font-light">
              From sunset catamaran sailing and guided outer reef channel dives to deserted sandbank luncheons across Noonu Atoll.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {(['all', 'ocean', 'private', 'culinary'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-sans transition-all ${
                  activeCategory === cat
                    ? 'bg-[#dfcaa3] text-[#04080f] font-medium'
                    : 'border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Experiences Grid */}
        <div className="space-y-16">
          {filtered.map((exp, idx) => (
            <article
              key={exp.id}
              className={`editorial-grid-12 gap-8 lg:gap-14 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Media Column (7 Cols) */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[16/10] shadow-2xl group">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover velora-image-grade group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Details Column (5 Cols) */}
              <div className={`lg:col-span-5 space-y-6 text-left ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans font-medium block">
                    {exp.category.toUpperCase()} · {exp.privacy.toUpperCase()}
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white font-light">
                    {exp.title}
                  </h2>
                </div>

                <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed font-light">
                  {exp.description}
                </p>

                {/* Practical Details */}
                <div className="py-4 border-y border-white/10 space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>Duration: {exp.duration} ({exp.timing})</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-3.5 h-3.5 text-[#dfcaa3]" />
                    <span>Privacy: {exp.privacy}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-sans text-white/60 font-light">
                  <p><strong className="text-white/80 font-normal">Who it suits:</strong> {experiencePresentation[exp.id]?.suits}</p>
                  <p><strong className="text-white/80 font-normal">Includes:</strong> {experiencePresentation[exp.id]?.includes}</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      onAskConcierge(`Tell me more about ${exp.title}. Would this work for beginners?`, {
                        type: 'experience',
                        id: exp.id,
                      })
                    }
                    className="editorial-link text-xs uppercase tracking-[0.2em]"
                  >
                    <span>Include in Itinerary with Concierge ✦</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
