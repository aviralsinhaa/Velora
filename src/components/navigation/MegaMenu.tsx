import { useState, useEffect, useRef } from 'react';
import { RESORT_MEDIA } from '../../data/mediaAssets';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenVillaDetail: (villaId: string) => void;
  onOpenCompareVillas: () => void;
  onOpenDining: () => void;
  onOpenWellness: () => void;
  onOpenExperiences: () => void;
  onOpenGettingHere: () => void;
  onOpenPracticalInfo: () => void;
  onOpenConcierge: () => void;
  onOpenBooking: () => void;
}

export function MegaMenu({
  isOpen,
  onClose,
  onNavigateSection,
  onOpenVillaDetail,
  onOpenCompareVillas,
  onOpenDining,
  onOpenWellness,
  onOpenExperiences,
  onOpenGettingHere,
  onOpenPracticalInfo,
  onOpenConcierge,
  onOpenBooking,
}: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<'villas' | 'dining' | 'wellness' | 'experiences' | 'island' | 'transit'>('villas');
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
        lastActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryPreviews = {
    villas: {
      image: RESORT_MEDIA.villas.sunsetPoolVilla.hero,
      tag: 'RESIDENTIAL ARCHITECTURE',
      title: 'Villas & Pavilions',
      desc: '24 secluded sanctuaries over water and sand.',
    },
    dining: {
      image: RESORT_MEDIA.dining.aura.hero,
      tag: 'CULINARY SANCTUARIES',
      title: 'Dining at Velora',
      desc: 'AURA, EMBER, TIDE, and private sandbank dining.',
    },
    wellness: {
      image: RESORT_MEDIA.wellness.waterPavilion,
      tag: 'RESTORATION OVER WATER',
      title: 'The Water Pavilion',
      desc: 'Tibetan Sound & Water Meditation and open-air movement.',
    },
    experiences: {
      image: RESORT_MEDIA.experiences.mantaReefDive,
      tag: 'ATOLL EXPEDITIONS',
      title: 'Reef & Ocean Journeys',
      desc: 'Guided reef channel dives, sunset catamaran sailing, and deserted sandbanks.',
    },
    island: {
      image: RESORT_MEDIA.arrival.aerialAtoll,
      tag: 'NOONU ATOLL · MALDIVES',
      title: 'The Island World',
      desc: 'Eight square kilometres of calm turquoise atoll lagoon.',
    },
    transit: {
      image: RESORT_MEDIA.arrival.seaplaneLagoon,
      tag: '45 MIN SCENIC SEAPLANE',
      title: 'Getting Here',
      desc: 'From Malé international airport directly to our outer lagoon pontoon.',
    },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resort Navigation Menu"
      className="fixed inset-0 z-50 bg-[#04080f]/95 backdrop-blur-2xl text-[#ece6dc] flex flex-col justify-between overflow-y-auto animate-fade-in"
    >
      {/* Top Header */}
      <div className="w-full px-6 sm:px-12 py-6 border-b border-white/10 flex items-center justify-between">
        <span className="font-editorial text-2xl tracking-[0.2em] text-white">
          VELORA
        </span>

        <button
          onClick={onClose}
          data-cursor="CLOSE"
          className="inline-flex items-center gap-2 p-2 rounded-full border border-white/20 hover:border-white text-white/80 hover:text-white transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Columns */}
      <div className="editorial-container flex-1 py-10 sm:py-16">
        <div className="editorial-grid-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Menu Items */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <nav className="space-y-4">
              {/* 01 The Island */}
              <div
                onMouseEnter={() => setActiveCategory('island')}
                className="group cursor-pointer border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onNavigateSection('island');
                    onClose();
                  }}
                  className="flex items-baseline justify-between"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    The Island
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">01</span>
                </div>
              </div>

              {/* 02 Villas with Sub-links */}
              <div
                onMouseEnter={() => setActiveCategory('villas')}
                className="space-y-2 border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onNavigateSection('stay');
                    onClose();
                  }}
                  className="flex items-baseline justify-between cursor-pointer group"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    Villas & Pavilions
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">02</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs font-sans text-white/60">
                  <button
                    onClick={() => {
                      onOpenVillaDetail('sunset-pool-villa');
                      onClose();
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Sunset Pool Villa
                  </button>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={() => {
                      onOpenVillaDetail('ocean-lagoon-villa');
                      onClose();
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Ocean Lagoon Villa
                  </button>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={() => {
                      onOpenVillaDetail('beach-reserve-residence');
                      onClose();
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Beach Reserve
                  </button>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={() => {
                      onOpenVillaDetail('velora-private-estate');
                      onClose();
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Private Estate
                  </button>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={() => {
                      onOpenCompareVillas();
                      onClose();
                    }}
                    className="text-[#dfcaa3] hover:underline"
                  >
                    Compare Villas →
                  </button>
                </div>
              </div>

              {/* 03 Dining */}
              <div
                onMouseEnter={() => setActiveCategory('dining')}
                className="group cursor-pointer border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onOpenDining();
                    onClose();
                  }}
                  className="flex items-baseline justify-between"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    Dining
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">03</span>
                </div>
                <div className="flex gap-4 pt-1 text-xs font-sans text-white/60">
                  <span>AURA (Japanese)</span>
                  <span className="text-white/20">·</span>
                  <span>EMBER (Woodfire)</span>
                  <span className="text-white/20">·</span>
                  <span>Private Sandbank Dining</span>
                </div>
              </div>

              {/* 04 Experiences */}
              <div
                onMouseEnter={() => setActiveCategory('experiences')}
                className="group cursor-pointer border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onOpenExperiences();
                    onClose();
                  }}
                  className="flex items-baseline justify-between"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    Experiences
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">04</span>
                </div>
                <div className="flex gap-4 pt-1 text-xs font-sans text-white/60">
                  <span>Reef Dive</span>
                  <span className="text-white/20">·</span>
                  <span>Sunset Sail</span>
                  <span className="text-white/20">·</span>
                  <span>Sandbank Luncheon</span>
                </div>
              </div>

              {/* 05 Wellness */}
              <div
                onMouseEnter={() => setActiveCategory('wellness')}
                className="group cursor-pointer border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onOpenWellness();
                    onClose();
                  }}
                  className="flex items-baseline justify-between"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    Wellness & The Water Pavilion
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">05</span>
                </div>
              </div>

              {/* 06 Discover Photography */}
              <div
                onMouseEnter={() => setActiveCategory('island')}
                className="group cursor-pointer border-b border-white/10 pb-3"
              >
                <div
                  onClick={() => {
                    onNavigateSection('discover');
                    onClose();
                  }}
                  className="flex items-baseline justify-between"
                >
                  <span className="font-editorial text-2xl sm:text-4xl text-white group-hover:text-[#dfcaa3] transition-colors">
                    Photography & Stories
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#dfcaa3] font-mono">06</span>
                </div>
              </div>

              {/* 07 Getting Here & Practical Info */}
              <div
                onMouseEnter={() => setActiveCategory('transit')}
                className="flex flex-wrap gap-6 pt-2 text-xs font-sans uppercase tracking-[0.2em]"
              >
                <button
                  onClick={() => {
                    onOpenGettingHere();
                    onClose();
                  }}
                  className="text-white/80 hover:text-[#dfcaa3] transition-colors"
                >
                  Getting Here →
                </button>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => {
                    onOpenPracticalInfo();
                    onClose();
                  }}
                  className="text-white/80 hover:text-[#dfcaa3] transition-colors"
                >
                  Practical Info & FAQ →
                </button>
              </div>
            </nav>

            {/* Direct Major Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
              <button
                onClick={() => {
                  onClose();
                  onOpenConcierge();
                }}
                className="px-6 py-3.5 rounded-full border border-[#c4a97d]/50 text-[#dfcaa3] hover:bg-[#dfcaa3]/10 text-xs uppercase tracking-[0.22em] font-sans flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Private Concierge ✦</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-8 py-3.5 rounded-full bg-[#dfcaa3] hover:bg-[#f0e2c8] text-[#04080f] text-xs uppercase tracking-[0.22em] font-sans font-medium transition-all shadow-md text-center"
              >
                Request Your Stay
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Architectural Preview Image */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#06101c] aspect-[4/3] shadow-2xl space-y-3 p-3">
              <div className="w-full h-[75%] rounded-xl overflow-hidden">
                <img
                  src={categoryPreviews[activeCategory].image}
                  alt={categoryPreviews[activeCategory].title}
                  className="w-full h-full object-cover velora-image-grade transition-all duration-700"
                />
              </div>
              <div className="text-left px-2 pt-1">
                <span className="text-[9px] uppercase tracking-[0.26em] text-[#dfcaa3] font-sans block">
                  {categoryPreviews[activeCategory].tag}
                </span>
                <h4 className="font-editorial text-xl text-white">
                  {categoryPreviews[activeCategory].title}
                </h4>
                <p className="font-sans text-xs text-white/60 font-light mt-0.5">
                  {categoryPreviews[activeCategory].desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quiet Footer Note */}
      <div className="w-full px-6 sm:px-12 py-4 border-t border-white/10 text-xs font-mono text-white/40 flex justify-between">
        <span>NOONU ATOLL · MALDIVES</span>
        <span>VELORA PRIVATE ISLAND</span>
      </div>
    </div>
  );
}
